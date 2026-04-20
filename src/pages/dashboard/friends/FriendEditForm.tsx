import { useState } from 'react'
import { adminApi, type AdminFriend } from '@/lib/adminApi'
import Button from '@/components/Button/Button.tsx'
import classes from './FriendEdit.module.scss'

interface FriendEditFormProps {
  friend?: AdminFriend
  onClose: () => void
  onSaved: () => void
}

export default function FriendEditForm({ friend, onClose, onSaved }: FriendEditFormProps) {
  const isNew = !friend

  const [name, setName] = useState(friend?.name ?? '')
  const [description, setDescription] = useState(friend?.description ?? '')
  const [href, setHref] = useState(friend?.href ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!name.trim()) {
      setError('名字不能为空')
      return
    }
    if (!href.trim()) {
      setError('链接不能为空')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        href: href.trim(),
      }
      if (isNew) {
        await adminApi.friends.create(payload)
      } else if (friend) {
        await adminApi.friends.update(friend.id, payload)
      }
      onSaved()
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

      <label className={classes.field}>
        <span>描述</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={classes.input}
          placeholder="一句话介绍"
        />
      </label>

      <label className={classes.field}>
        <span>链接</span>
        <input
          type="url"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className={classes.input}
          placeholder="https://..."
          required
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
