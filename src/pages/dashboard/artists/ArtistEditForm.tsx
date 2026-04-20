import { useState } from 'react'
import { adminApi, type AdminArtist } from '@/lib/adminApi'
import type { ArtistPlatform } from '@/data/common.tsx'
import { PLATFORM_LABELS } from '@/lib/artistIcon'
import Select from '@/components/Select/Select.tsx'
import Button from '@/components/Button/Button.tsx'
import classes from './ArtistEdit.module.scss'

const PLATFORM_OPTIONS = [
  { value: '', label: PLATFORM_LABELS.NONE },
  { value: 'BILIBILI', label: PLATFORM_LABELS.BILIBILI },
  { value: 'TWITTER', label: PLATFORM_LABELS.TWITTER },
  { value: 'WEIBO', label: PLATFORM_LABELS.WEIBO },
  { value: 'PIXIV', label: PLATFORM_LABELS.PIXIV },
  { value: 'OTHER', label: PLATFORM_LABELS.OTHER },
]

interface ArtistEditFormProps {
  artist?: AdminArtist
  onClose: () => void
  onSaved: (savedId?: string) => void
}

export default function ArtistEditForm({ artist, onClose, onSaved }: ArtistEditFormProps) {
  const isNew = !artist

  const [name, setName] = useState(artist?.name ?? '')
  const [platform, setPlatform] = useState<ArtistPlatform | ''>(artist?.platform ?? '')
  const [href, setHref] = useState(artist?.href ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // React 事件会跨 portal 冒泡 —— 防止嵌套在 AlbumEditForm 里时触发外层 form 的 submit
    e.stopPropagation()
    if (!name.trim()) {
      setError('名字不能为空')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        platform: platform || null,
        href: href.trim() || null,
      }
      let savedId: string | undefined
      if (isNew) {
        const created = await adminApi.artists.create(payload)
        savedId = created.id
      } else if (artist) {
        const updated = await adminApi.artists.update(artist.id, payload)
        savedId = updated.id
      }
      onSaved(savedId)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <label className={classes.field}>
        <span>名字</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={classes.input}
          required
        />
      </label>

      <div className={classes.field}>
        <span>平台</span>
        <Select
          value={platform}
          onChange={(v) => setPlatform(v as ArtistPlatform | '')}
          options={PLATFORM_OPTIONS}
        />
      </div>

      <label className={classes.field}>
        <span>链接</span>
        <input
          type="url"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className={classes.input}
          placeholder="https://..."
        />
      </label>

      {error && <div className={classes.error}>{error}</div>}

      <div className={classes.actions}>
        <Button type="submit" color="primary" loading={submitting}>
          保存
        </Button>
        <Button type="button" color="white" onClick={onClose} disabled={submitting}>
          取消
        </Button>
      </div>
    </form>
  )
}
