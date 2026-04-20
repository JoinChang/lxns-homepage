import { useEffect, useMemo, useRef, useState } from 'react'
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react'
import { adminApi, type AdminAlbum } from '@/lib/adminApi'
import Modal from '@/components/Modal/Modal.tsx'
import Skeleton from '@/components/Skeleton/Skeleton.tsx'
import LazyImage from '@/components/LazyImage/LazyImage.tsx'
import Button from '@/components/Button/Button.tsx'
import IconButton from '@/components/IconButton/IconButton.tsx'
import AlbumCaption from '@/components/AlbumCaption/AlbumCaption.tsx'
import {
  distributeIntoColumns,
  useContainerColumnCount,
} from '@/components/Masonry/useMasonryColumns.ts'
import PageShell from '@/pages/dashboard/_shared/PageShell.tsx'
import EmptyState from '@/pages/dashboard/_shared/EmptyState.tsx'
import AlbumEditForm from './AlbumEditForm.tsx'
import classes from './AlbumList.module.scss'

type EditorState =
  | { type: 'closed' }
  | { type: 'new' }
  | { type: 'edit'; album: AdminAlbum }

const SKELETON_RATIOS = [3 / 4, 4 / 5, 2 / 3, 1, 3 / 4, 5 / 7, 3 / 5, 4 / 5]

function pickColumnCount(width: number): number {
  if (width <= 320) return 1
  if (width <= 560) return 2
  if (width <= 800) return 3
  if (width <= 1040) return 4
  return 5
}

export default function AlbumList() {
  const [albumsRaw, setAlbumsRaw] = useState<AdminAlbum[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>({ type: 'closed' })

  const gridRef = useRef<HTMLDivElement>(null)
  const columnCount = useContainerColumnCount(gridRef, pickColumnCount, 3)

  const sortedAlbums = useMemo(() => {
    if (!albumsRaw) return null
    return albumsRaw.slice().sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
  }, [albumsRaw])

  const columns = useMemo(
    () => (sortedAlbums ? distributeIntoColumns(sortedAlbums, columnCount) : null),
    [sortedAlbums, columnCount],
  )

  const skeletonColumns = useMemo(() => {
    const fakes = SKELETON_RATIOS.map((ratio, i) => ({ id: `sk-${i}`, ratio }))
    return distributeIntoColumns(fakes, columnCount)
  }, [columnCount])

  const lastOpenRef = useRef<EditorState>({ type: 'closed' })
  if (editor.type !== 'closed') {
    lastOpenRef.current = editor
  }

  const load = () => {
    adminApi.albums.list().then(setAlbumsRaw).catch((e) => setError(e.message))
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这张图片吗？COS 上对应的文件也会被清理。')) return
    try {
      await adminApi.albums.remove(id)
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
      title="相册"
      error={error}
      action={
        <Button
          color="primary"
          onClick={openNew}
          leftIcon={<IconPlus size={16} stroke={3} />}
        >
          上传图片
        </Button>
      }
    >
      {!columns ? (
        <div ref={gridRef} className={classes.grid}>
          {skeletonColumns.map((col, i) => (
            <div key={i} className={classes.column}>
              {col.map((sk) => (
                <div key={sk.id} className={classes.item} style={{ aspectRatio: sk.ratio }}>
                  <Skeleton width="100%" height="100%" radius={0} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : columns.every((c) => c.length === 0) ? (
        <EmptyState label="相册还是空的。" ctaLabel="立即上传" onCta={openNew} />
      ) : (
        <div ref={gridRef} className={classes.grid}>
          {columns.map((col, i) => (
            <div key={i} className={classes.column}>
              {col.map((album) => (
                <div
                  key={album.id}
                  className={classes.item}
                  style={{ aspectRatio: album.ratio }}
                >
                  <LazyImage
                    className={classes.image}
                    src={album.url}
                    alt={album.file}
                  />
                  <div className={classes.overlay}>
                    <IconButton
                      size={30}
                      aria-label="编辑"
                      onClick={() => setEditor({ type: 'edit', album })}
                    >
                      <IconPencil size={16} stroke={2.2} />
                    </IconButton>
                    <IconButton
                      size={30}
                      aria-label="删除"
                      onClick={() => handleDelete(album.id)}
                    >
                      <IconTrash size={16} stroke={2.2} />
                    </IconButton>
                  </div>
                  <AlbumCaption artist={album.artist} date={album.date} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal
        title={activeEditor.type === 'edit' ? '编辑图片' : '上传图片'}
        opened={editor.type !== 'closed'}
        onClose={closeEditor}
      >
        {activeEditor.type !== 'closed' && (
          <AlbumEditForm
            album={activeEditor.type === 'edit' ? activeEditor.album : undefined}
            onClose={closeEditor}
            onSaved={load}
          />
        )}
      </Modal>
    </PageShell>
  )
}
