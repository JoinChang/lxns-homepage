import { useEffect, useRef, useState } from 'react'
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react'
import { adminApi, type AdminArtist } from '@/lib/adminApi'
import { ArtistIcon, PLATFORM_LABELS } from '@/lib/artistIcon'
import Modal from '@/components/Modal/Modal.tsx'
import Skeleton from '@/components/Skeleton/Skeleton.tsx'
import Button from '@/components/Button/Button.tsx'
import IconButton from '@/components/IconButton/IconButton.tsx'
import PageShell from '@/pages/dashboard/_shared/PageShell.tsx'
import EmptyState from '@/pages/dashboard/_shared/EmptyState.tsx'
import ArtistEditForm from './ArtistEditForm.tsx'
import classes from './ArtistList.module.scss'

type EditorState =
  | { type: 'closed' }
  | { type: 'new' }
  | { type: 'edit'; artist: AdminArtist }

const SKELETON_ROWS = 4

export default function ArtistList() {
  const [artists, setArtists] = useState<AdminArtist[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>({ type: 'closed' })

  const lastOpenRef = useRef<EditorState>({ type: 'closed' })
  if (editor.type !== 'closed') {
    lastOpenRef.current = editor
  }

  const load = () => {
    adminApi.artists.list().then(setArtists).catch((e) => setError(e.message))
  }

  useEffect(load, [])

  const handleDelete = async (id: string, albumCount: number) => {
    const msg =
      albumCount > 0
        ? `确定删除？其 ${albumCount} 张关联图片的作者字段会被置空。`
        : '确定删除这个作者吗？'
    if (!confirm(msg)) return
    try {
      await adminApi.artists.remove(id)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  const closeEditor = () => setEditor({ type: 'closed' })
  const activeEditor = lastOpenRef.current
  const openNew = () => setEditor({ type: 'new' })

  return (
    <PageShell
      title="作者"
      error={error}
      action={
        <Button
          color="primary"
          onClick={openNew}
          leftIcon={<IconPlus size={16} stroke={3} />}
        >
          新建作者
        </Button>
      }
    >
      {!artists ? (
        <div className={classes.list}>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className={classes.row}>
              <div className={classes.nameCell}>
                <Skeleton width="45%" height={22} />
                <Skeleton width="60%" height={16} />
              </div>
              <div className={classes.hrefCell}>
                <Skeleton width="75%" height={16} />
              </div>
              <div className={classes.actions}>
                <Skeleton circle width={28} height={28} />
                <Skeleton circle width={28} height={28} />
              </div>
            </div>
          ))}
        </div>
      ) : artists.length === 0 ? (
        <EmptyState label="还没有作者。" ctaLabel="立即新建" onCta={openNew} />
      ) : (
        <div className={classes.list}>
          {artists.map((artist) => (
            <div key={artist.id} className={classes.row}>
              <div className={classes.nameCell}>
                <div className={classes.name}>{artist.name}</div>
                <div className={classes.meta}>
                  <ArtistIcon platform={artist.platform} size={13} stroke={2} />
                  <span className={classes.platform}>
                    {PLATFORM_LABELS[artist.platform ?? 'NONE']}
                  </span>
                  <span className={classes.dot}>·</span>
                  <span className={classes.count}>{artist._count.albums} 张图</span>
                </div>
              </div>
              <div className={classes.hrefCell}>
                {artist.href ? (
                  <a href={artist.href} target="_blank" rel="noreferrer">
                    {artist.href}
                  </a>
                ) : (
                  <span className={classes.muted}>—</span>
                )}
              </div>
              <div className={classes.actions}>
                <IconButton
                  aria-label="编辑"
                  onClick={() => setEditor({ type: 'edit', artist })}
                >
                  <IconPencil size={16} stroke={2.2} />
                </IconButton>
                <IconButton
                  aria-label="删除"
                  onClick={() => handleDelete(artist.id, artist._count.albums)}
                >
                  <IconTrash size={16} stroke={2.2} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={activeEditor.type === 'edit' ? '编辑作者' : '新建作者'}
        opened={editor.type !== 'closed'}
        onClose={closeEditor}
      >
        {activeEditor.type !== 'closed' && (
          <ArtistEditForm
            artist={activeEditor.type === 'edit' ? activeEditor.artist : undefined}
            onClose={closeEditor}
            onSaved={load}
          />
        )}
      </Modal>
    </PageShell>
  )
}
