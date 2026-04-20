import { useRef, useState } from 'react'
import { IconX, IconCheck } from '@tabler/icons-react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { adminApi } from '@/lib/adminApi'
import Modal from '@/components/Modal/Modal.tsx'
import classes from './ImageUpload.module.scss'

export interface UploadResult {
  key: string
  url: string
  ratio: number
}

const ACCEPTED_MIMES = new Set(['image/webp', 'image/jpeg', 'image/png'])
const MAX_SIZE = 50 * 1024 * 1024

async function blobFromCrop(
  image: HTMLImageElement,
  crop: PixelCrop,
  mime: string,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = Math.round(crop.width * scaleX)
  canvas.height = Math.round(crop.height * scaleY)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 canvas 上下文')
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('裁剪失败'))),
      mime,
      0.95,
    )
  })
}

export default function ImageUpload({
  value,
  onChange,
}: {
  value: UploadResult | null
  onChange: (v: UploadResult | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingSrc, setPendingSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const closeCropModal = () => {
    if (pendingSrc) URL.revokeObjectURL(pendingSrc)
    setPendingFile(null)
    setPendingSrc(null)
    setCrop(undefined)
    setPixelCrop(null)
  }

  const handleFile = (file: File) => {
    setError(null)
    if (!ACCEPTED_MIMES.has(file.type)) {
      setError('只支持 WebP / JPEG / PNG')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('文件超过 50MB')
      return
    }
    setPendingFile(file)
    setPendingSrc(URL.createObjectURL(file))
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 })
    setPixelCrop({ unit: 'px', x: 0, y: 0, width, height })
  }

  const handleConfirmCrop = async () => {
    if (!pendingFile || !imageRef.current || !pixelCrop) return
    const file = pendingFile
    setError(null)
    setProgress(0)
    setUploading(true)
    try {
      const blob = await blobFromCrop(imageRef.current, pixelCrop, file.type)
      const cropped = new File([blob], file.name, { type: file.type })
      // 先关 modal 再上传 —— 上传进度在 uploader 占位里显示
      closeCropModal()
      const result = await adminApi.upload.albumImage(cropped, (pct) =>
        setProgress(pct),
      )
      onChange(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const openFilePicker = () => inputRef.current?.click()

  return (
    <div className={classes.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <div
        className={classes.uploader}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (uploading) return
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        onClick={() => {
          if (uploading) return
          openFilePicker()
        }}
      >
        {uploading ? (
          <div className={classes.uploadingWrap}>
            <div className={classes.hint}>上传中 {progress}%</div>
            <div className={classes.progressBar}>
              <div className={classes.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : value ? (
          <div className={classes.preview}>
            <div className={classes.imageWrap}>
              <img
                src={value.url}
                alt="preview"
                width={Math.round(244 * value.ratio)}
                height={244}
              />
              <button
                type="button"
                className={classes.clear}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
                aria-label="移除图片"
              >
                <IconX size={16} stroke={2.2} />
              </button>
            </div>
          </div>
        ) : (
          <div className={classes.hint}>点击或拖拽图片上传</div>
        )}
      </div>

      {error && <div className={classes.error}>{error}</div>}

      <Modal
        title="裁剪图片"
        opened={!!pendingSrc}
        onClose={closeCropModal}
      >
        {pendingSrc && (
          <div className={classes.cropModalBody}>
            <div className={classes.cropBox}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setPixelCrop(c)}
                keepSelection
              >
                <img
                  ref={imageRef}
                  src={pendingSrc}
                  alt="待裁剪"
                  onLoad={handleImageLoad}
                  style={{ maxHeight: '60dvh', maxWidth: '100%', display: 'block' }}
                />
              </ReactCrop>
            </div>
            <div className={classes.cropHint}>拖动边框调整；默认覆盖整张图</div>
            <div className={classes.cropActions}>
              <button
                type="button"
                className={classes.primary}
                onClick={handleConfirmCrop}
              >
                <IconCheck size={14} stroke={2.5} />
                确认上传
              </button>
              <button
                type="button"
                className={classes.secondary}
                onClick={closeCropModal}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
