import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { putAlbumImage, deleteAlbumImage, EXTENSIONS_BY_MIME } from '../../lib/cos'
import { ApiError } from '../../lib/errors'

export function createAdminUploadRouter(): Router {
  const router = Router()

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (EXTENSIONS_BY_MIME[file.mimetype]) cb(null, true)
      else cb(new Error('不支持的文件类型'))
    },
  })

  // multer 是 callback-style 的 middleware，让它的 error 走统一 ApiError 通道。
  // LIMIT_FILE_SIZE 换成更友好的中文，其他 multer error 由 errorMiddleware 格式化
  const singleFile = upload.single('file')
  const handleUpload = (
    req: Parameters<typeof singleFile>[0],
    res: Parameters<typeof singleFile>[1],
    next: Parameters<typeof singleFile>[2],
  ) => {
    singleFile(req, res, (err: unknown) => {
      if (err) {
        const code = (err as { code?: string })?.code
        if (code === 'LIMIT_FILE_SIZE') {
          next(ApiError.badRequest('文件超过 50MB 上限'))
          return
        }
        next(err)
        return
      }
      next()
    })
  }

  router.post('/album-image', handleUpload, async (req, res) => {
    const file = req.file
    if (!file) throw ApiError.badRequest('没有收到文件')

    const ext = EXTENSIONS_BY_MIME[file.mimetype]
    if (!ext) throw ApiError.badRequest('不支持的 MIME 类型')

    let buffer = file.buffer
    let ratio: number

    try {
      const meta = await sharp(buffer).metadata()
      if (!meta.width || !meta.height) {
        throw ApiError.badRequest('无法读取图片尺寸')
      }
      ratio = meta.width / meta.height
      if (meta.width > 1000) {
        buffer = await sharp(buffer).resize({ width: 1000 }).toBuffer()
      }
    } catch (err) {
      if (err instanceof ApiError) throw err
      console.error('[upload] sharp failed', err)
      throw ApiError.badRequest('图片解析失败')
    }

    try {
      const { key, url } = await putAlbumImage(buffer, file.mimetype, ext)
      res.json({ key, url, ratio })
    } catch (err) {
      console.error('[upload] cos failed', err)
      throw ApiError.internal('上传到 COS 失败')
    }
  })

  router.delete('/album-image', async (req, res) => {
    const key = req.query.key
    if (typeof key !== 'string' || !key) {
      throw ApiError.badRequest('key is required')
    }
    try {
      await deleteAlbumImage(key)
      res.status(204).end()
    } catch (err) {
      console.error('[upload] delete failed', err)
      throw ApiError.internal('删除失败')
    }
  })

  return router
}
