import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import {
  adminApi,
  type AdminAlbum,
  type AdminArtist,
} from '@/lib/adminApi'
import ImageUpload, { type UploadResult } from '@/components/ImageUpload/ImageUpload'
import Select from '@/components/Select/Select.tsx'
import DatePicker from '@/components/DatePicker/DatePicker.tsx'
import Modal from '@/components/Modal/Modal.tsx'
import Button from '@/components/Button/Button.tsx'
import ArtistEditForm from '@/pages/dashboard/artists/ArtistEditForm.tsx'
import classes from './AlbumEdit.module.scss'

const MODAL_ANIM_MS = 250

interface AlbumEditFormProps {
  album?: AdminAlbum
  onClose: () => void
  onSaved: () => void
}

export default function AlbumEditForm({
  album,
  onClose,
  onSaved,
}: AlbumEditFormProps) {
  const isNew = !album
  // 原始 key：编辑模式下的已存 DB 的文件；新建模式下为空
  const originalKey = album?.file

  const [upload, setUpload] = useState<UploadResult | null>(
    album
      ? { key: album.file, url: album.url, ratio: album.ratio }
      : null,
  )
  const [artistId, setArtistId] = useState<string>(album?.artist?.id ?? '')
  const [date, setDate] = useState<string>(
    album?.date ? album.date.slice(0, 10) : '',
  )
  const [sortOrder, setSortOrder] = useState<number>(album?.sortOrder ?? 0)
  const [artists, setArtists] = useState<AdminArtist[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 嵌套 Modal：creatingArtist 控制开关，rendered 延后关闭避免内容闪切
  const [creatingArtist, setCreatingArtist] = useState(false)
  const [nestedRendered, setNestedRendered] = useState(false)
  const [openCount, setOpenCount] = useState(0)

  useEffect(() => {
    if (creatingArtist) {
      setNestedRendered(true)
      return
    }
    if (nestedRendered) {
      const t = setTimeout(() => setNestedRendered(false), MODAL_ANIM_MS)
      return () => clearTimeout(t)
    }
  }, [creatingArtist, nestedRendered])

  useEffect(() => {
    adminApi.artists.list().then(setArtists).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!upload) {
      setError('请先上传图片')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        file: upload.key,
        url: upload.url,
        ratio: upload.ratio,
        date: date || null,
        artistId: artistId || null,
        sortOrder,
      }
      if (isNew) {
        await adminApi.albums.create(payload)
      } else if (album) {
        await adminApi.albums.update(album.id, payload)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 把 key 从 COS 清除（孤儿清理；仅对新上传的、不是原始 DB 引用的 key 调用）
  const cleanupOrphanKey = (key: string | undefined) => {
    if (!key) return
    if (key === originalKey) return // 属于 DB 记录，不动
    adminApi.upload.deleteAlbumImage(key).catch((err) => {
      console.warn('[cleanup] failed to delete orphan', key, err)
    })
  }

  // 上传/替换/移除统一走这里：旧值若是新上传的孤儿则删
  const handleUploadChange = (next: UploadResult | null) => {
    if (upload && upload.key !== next?.key) {
      cleanupOrphanKey(upload.key)
    }
    setUpload(next)
  }

  // 取消时：若当前 upload 是新上传孤儿，删
  const handleCancel = () => {
    if (upload) cleanupOrphanKey(upload.key)
    onClose()
  }

  const handleOpenArtistCreate = () => {
    setOpenCount((c) => c + 1)
    setCreatingArtist(true)
  }

  const handleArtistCreated = async (savedId?: string) => {
    const fresh = await adminApi.artists.list().catch(() => null)
    if (fresh) setArtists(fresh)
    if (savedId) setArtistId(savedId)
  }

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <div className={classes.field}>
        <span>图片</span>
        <ImageUpload value={upload} onChange={handleUploadChange} />
      </div>

      <div className={classes.field}>
        <span>作者</span>
        <div className={classes.artistRow}>
          <Select
            value={artistId}
            onChange={setArtistId}
            options={[
              { value: '', label: '（未设置）' },
              ...artists.map((a) => ({ value: a.id, label: a.name })),
            ]}
            placeholder="选择作者"
          />
          <button
            type="button"
            className={classes.addArtistBtn}
            onClick={handleOpenArtistCreate}
            aria-label="新建作者"
          >
            <IconPlus size={16} stroke={2.5} />
          </button>
        </div>
      </div>

      <div className={classes.field}>
        <span>日期</span>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <label className={classes.field}>
        <span>排序</span>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          className={classes.input}
        />
      </label>

      {error && <div className={classes.error}>{error}</div>}

      <div className={classes.actions}>
        <Button type="submit" color="primary" loading={submitting}>
          保存
        </Button>
        <Button type="button" color="white" onClick={handleCancel} disabled={submitting}>
          取消
        </Button>
      </div>

      <Modal
        title="新建作者"
        opened={creatingArtist}
        onClose={() => setCreatingArtist(false)}
      >
        {nestedRendered && (
          <ArtistEditForm
            key={openCount}
            onClose={() => setCreatingArtist(false)}
            onSaved={handleArtistCreated}
          />
        )}
      </Modal>
    </form>
  )
}
