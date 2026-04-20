import COS from 'cos-nodejs-sdk-v5'
import { prisma } from './prisma'

interface Location {
  bucket: string
  region: string
  prefix: string
}

interface ReconcileResult {
  totalCosObjects: number
  knownUuids: number
  orphansByLocation: { location: Location; orphans: string[] }[]
  deleted: number
  failed: number
}

function loadConfig() {
  const uploadBucket = process.env.COS_UPLOAD_BUCKET || ''
  const uploadRegion = process.env.COS_UPLOAD_REGION || ''
  const uploadPrefix = (process.env.COS_UPLOAD_PREFIX || 'albums').replace(
    /^\/+|\/+$/g,
    '',
  )
  const accessBucket = process.env.COS_ACCESS_BUCKET || uploadBucket
  const accessRegion = process.env.COS_ACCESS_REGION || uploadRegion
  const accessPrefix = (
    process.env.COS_ACCESS_PREFIX || uploadPrefix
  ).replace(/^\/+|\/+$/g, '')

  const uploadLoc: Location = {
    bucket: uploadBucket,
    region: uploadRegion,
    prefix: uploadPrefix,
  }
  const accessLoc: Location = {
    bucket: accessBucket,
    region: accessRegion,
    prefix: accessPrefix,
  }
  const sameLocation =
    uploadLoc.bucket === accessLoc.bucket &&
    uploadLoc.region === accessLoc.region &&
    uploadLoc.prefix === accessLoc.prefix

  return { uploadLoc, accessLoc, sameLocation }
}

function extractUuid(key: string): string | null {
  const basename = key.slice(key.lastIndexOf('/') + 1)
  if (!basename) return null
  const uuid = basename.includes('.')
    ? basename.slice(0, basename.lastIndexOf('.'))
    : basename
  return uuid || null
}

async function listAllKeys(cos: COS, loc: Location): Promise<string[]> {
  if (!loc.bucket || !loc.region) return []
  const keys: string[] = []
  let Marker: string | undefined

  while (true) {
    const res = await cos.getBucket({
      Bucket: loc.bucket,
      Region: loc.region,
      Prefix: `${loc.prefix}/`,
      MaxKeys: 1000,
      Marker,
    })
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key)
    }
    if (!res.IsTruncated) break
    Marker = res.NextMarker || res.Contents?.[res.Contents.length - 1]?.Key
    if (!Marker) break
  }

  return keys
}

export interface ReconcileOptions {
  apply?: boolean
}

export async function reconcileOrphans(
  options: ReconcileOptions = {},
): Promise<ReconcileResult> {
  const apply = options.apply ?? false

  const { uploadLoc, accessLoc, sameLocation } = loadConfig()
  if (!uploadLoc.bucket || !uploadLoc.region) {
    throw new Error('COS_UPLOAD_BUCKET / COS_UPLOAD_REGION not configured')
  }

  const SecretId = process.env.COS_SECRET_ID
  const SecretKey = process.env.COS_SECRET_KEY
  if (!SecretId || !SecretKey) {
    throw new Error('COS_SECRET_ID / COS_SECRET_KEY not configured')
  }
  const cos = new COS({ SecretId, SecretKey })

  const collectKnownUuids = async (): Promise<Set<string>> => {
    const albums = await prisma.album.findMany({ select: { file: true } })
    const set = new Set<string>()
    for (const a of albums) {
      const uuid = extractUuid(a.file)
      if (uuid) set.add(uuid)
    }
    return set
  }

  // 取 COS 列表前 + 列表后两次 DB 快照的并集，避免列表期间新写入的 album 被
  // 当成 orphan 删掉（admin 同时上传 + 清理 → 数据丢失）
  const knownUuidsBefore = await collectKnownUuids()

  const locs = sameLocation ? [uploadLoc] : [uploadLoc, accessLoc]
  let totalCosObjects = 0
  const cosKeysByLocation: { location: Location; keys: string[] }[] = []

  for (const loc of locs) {
    const keys = await listAllKeys(cos, loc)
    totalCosObjects += keys.length
    cosKeysByLocation.push({ location: loc, keys })
  }

  const knownUuidsAfter = await collectKnownUuids()
  const knownUuids = new Set<string>([...knownUuidsBefore, ...knownUuidsAfter])

  const orphansByLocation: { location: Location; orphans: string[] }[] =
    cosKeysByLocation.map(({ location, keys }) => ({
      location,
      orphans: keys.filter((k) => {
        const uuid = extractUuid(k)
        return uuid && !knownUuids.has(uuid)
      }),
    }))

  let deleted = 0
  let failed = 0
  if (apply) {
    for (const { location, orphans } of orphansByLocation) {
      for (const Key of orphans) {
        try {
          await cos.deleteObject({
            Bucket: location.bucket,
            Region: location.region,
            Key,
          })
          deleted++
        } catch (err) {
          failed++
          console.warn('[cos-reconcile] delete failed', location.bucket, Key, err)
        }
      }
    }
  }

  return {
    totalCosObjects,
    knownUuids: knownUuids.size,
    orphansByLocation,
    deleted,
    failed,
  }
}
