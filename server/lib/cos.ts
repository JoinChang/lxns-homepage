import COS from 'cos-nodejs-sdk-v5'
import crypto from 'node:crypto'

// 上传桶（COS 工作流的输入端）
const UPLOAD_BUCKET = process.env.COS_UPLOAD_BUCKET || ''
const UPLOAD_REGION = process.env.COS_UPLOAD_REGION || ''
// 公开访问桶（工作流输出到的桶；默认与上传桶相同）
const ACCESS_BUCKET = process.env.COS_ACCESS_BUCKET || UPLOAD_BUCKET
const ACCESS_REGION = process.env.COS_ACCESS_REGION || UPLOAD_REGION

const PUBLIC_HOST = (
  process.env.COS_PUBLIC_HOST ||
  (ACCESS_BUCKET && ACCESS_REGION
    ? `https://${ACCESS_BUCKET}.cos.${ACCESS_REGION}.myqcloud.com`
    : '')
).replace(/\/+$/, '')

const UPLOAD_PREFIX = (process.env.COS_UPLOAD_PREFIX || 'albums').replace(/^\/+|\/+$/g, '')
const ACCESS_PREFIX = (process.env.COS_ACCESS_PREFIX || UPLOAD_PREFIX).replace(/^\/+|\/+$/g, '')
// 工作流常见操作：比如统一转 webp。不设则跟随上传格式
const ACCESS_EXT = process.env.COS_ACCESS_EXT || ''

const WORKFLOW_WAIT_TIMEOUT = Number(process.env.COS_WORKFLOW_WAIT_TIMEOUT_MS || 60_000)
const WORKFLOW_POLL_INTERVAL = Number(process.env.COS_WORKFLOW_POLL_INTERVAL_MS || 1000)

// 若 bucket/region/prefix 完全一致，视为同一个位置，避免重复操作
const SAME_LOCATION =
  UPLOAD_BUCKET === ACCESS_BUCKET &&
  UPLOAD_REGION === ACCESS_REGION &&
  UPLOAD_PREFIX === ACCESS_PREFIX

let clientInstance: COS | null = null

function getClient(): COS {
  if (clientInstance) return clientInstance
  const SecretId = process.env.COS_SECRET_ID
  const SecretKey = process.env.COS_SECRET_KEY
  if (!SecretId || !SecretKey) {
    throw new Error('COS_SECRET_ID / COS_SECRET_KEY not configured')
  }
  if (!UPLOAD_BUCKET || !UPLOAD_REGION) {
    throw new Error('COS_UPLOAD_BUCKET / COS_UPLOAD_REGION not configured')
  }
  clientInstance = new COS({ SecretId, SecretKey })
  return clientInstance
}

export const EXTENSIONS_BY_MIME: Record<string, string> = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function accessObjectExists(key: string): Promise<boolean> {
  try {
    await getClient().headObject({
      Bucket: ACCESS_BUCKET,
      Region: ACCESS_REGION,
      Key: key,
    })
    return true
  } catch {
    return false
  }
}

async function waitForAccessObject(key: string): Promise<boolean> {
  // 上传桶 = 访问桶 且 前缀/扩展名都没变 —— 直接已就绪
  if (SAME_LOCATION && !ACCESS_EXT) return true

  const start = Date.now()
  while (Date.now() - start < WORKFLOW_WAIT_TIMEOUT) {
    if (await accessObjectExists(key)) return true
    await sleep(WORKFLOW_POLL_INTERVAL)
  }
  return false
}

export async function putAlbumImage(
  buffer: Buffer,
  contentType: string,
  ext: string,
): Promise<{ key: string; url: string }> {
  const uuid = crypto.randomUUID()
  const uploadKey = `${UPLOAD_PREFIX}/${uuid}${ext}`
  const accessKey = `${ACCESS_PREFIX}/${uuid}${ACCESS_EXT || ext}`

  await getClient().putObject({
    Bucket: UPLOAD_BUCKET,
    Region: UPLOAD_REGION,
    Key: uploadKey,
    Body: buffer,
    ContentType: contentType,
  })

  // 等工作流把输出写到访问桶；超时仍然返回（客户端可能短暂看到 404，但多数情况能等到）
  const ready = await waitForAccessObject(accessKey)
  if (!ready) {
    console.warn('[cos] access object not ready after timeout', accessKey)
  }

  return {
    key: accessKey,
    url: `${PUBLIC_HOST}/${accessKey}`,
  }
}

interface Location {
  bucket: string
  region: string
  prefix: string
}

async function listAndDelete(loc: Location, uuid: string): Promise<void> {
  const client = getClient()
  try {
    const res = await client.getBucket({
      Bucket: loc.bucket,
      Region: loc.region,
      Prefix: `${loc.prefix}/${uuid}`,
    })
    await Promise.all(
      (res.Contents ?? []).map((obj) =>
        obj.Key
          ? client
              .deleteObject({ Bucket: loc.bucket, Region: loc.region, Key: obj.Key })
              .catch((err) =>
                console.warn('[cos] delete failed', loc.bucket, obj.Key, err),
              )
          : Promise.resolve(),
      ),
    )
  } catch (err) {
    console.warn('[cos] list failed', loc.bucket, loc.prefix, err)
  }
}

/**
 * 同 UUID 下的所有对象都清掉：
 *   - 上传桶原图（可能是 .jpg/.png/.webp 等）
 *   - 访问桶工作流输出（处理后的 .webp 等）
 * 跨桶时双端都会处理。
 */
export async function deleteAlbumImage(key: string): Promise<void> {
  const uploadLoc: Location = {
    bucket: UPLOAD_BUCKET,
    region: UPLOAD_REGION,
    prefix: UPLOAD_PREFIX,
  }
  const accessLoc: Location = {
    bucket: ACCESS_BUCKET,
    region: ACCESS_REGION,
    prefix: ACCESS_PREFIX,
  }

  // 非 managed 前缀的 key（seed 历史遗留）no-op
  if (!key.startsWith(`${UPLOAD_PREFIX}/`) && !key.startsWith(`${ACCESS_PREFIX}/`)) {
    return
  }

  const basename = key.slice(key.lastIndexOf('/') + 1)
  const uuid = basename.includes('.')
    ? basename.slice(0, basename.lastIndexOf('.'))
    : basename
  if (!uuid) return

  if (SAME_LOCATION) {
    await listAndDelete(uploadLoc, uuid)
  } else {
    await Promise.all([
      listAndDelete(uploadLoc, uuid),
      listAndDelete(accessLoc, uuid),
    ])
  }
}
