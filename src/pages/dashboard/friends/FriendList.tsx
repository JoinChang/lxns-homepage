import { useEffect, useRef, useState } from 'react'
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconGripVertical,
} from '@tabler/icons-react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { adminApi, type AdminFriend } from '@/lib/adminApi'
import Modal from '@/components/Modal/Modal.tsx'
import Skeleton from '@/components/Skeleton/Skeleton.tsx'
import Button from '@/components/Button/Button.tsx'
import IconButton from '@/components/IconButton/IconButton.tsx'
import PageShell from '@/pages/dashboard/_shared/PageShell.tsx'
import EmptyState from '@/pages/dashboard/_shared/EmptyState.tsx'
import FriendEditForm from './FriendEditForm.tsx'
import classes from './FriendList.module.scss'

type EditorState =
  | { type: 'closed' }
  | { type: 'new' }
  | { type: 'edit'; friend: AdminFriend }

const SKELETON_ROWS = 4

function SortableFriendRow({
  friend,
  onEdit,
  onDelete,
}: {
  friend: AdminFriend
  onEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: friend.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} className={classes.row}>
      <button
        type="button"
        className={classes.gripCell}
        aria-label="拖拽排序"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={16} stroke={2} />
      </button>
      <div className={classes.nameCell}>
        <div className={classes.name}>{friend.name}</div>
        <div className={classes.description}>{friend.description}</div>
      </div>
      <div className={classes.hrefCell}>
        <a href={friend.href} target="_blank" rel="noreferrer">
          {friend.href}
        </a>
      </div>
      <div className={classes.actions}>
        <IconButton aria-label="编辑" onClick={onEdit}>
          <IconPencil size={16} stroke={2.2} />
        </IconButton>
        <IconButton aria-label="删除" onClick={onDelete}>
          <IconTrash size={16} stroke={2.2} />
        </IconButton>
      </div>
    </div>
  )
}

export default function FriendList() {
  const [friends, setFriends] = useState<AdminFriend[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>({ type: 'closed' })

  const lastOpenRef = useRef<EditorState>({ type: 'closed' })
  if (editor.type !== 'closed') {
    lastOpenRef.current = editor
  }

  const sensors = useSensors(
    // 需要移动 5px 才开始拖拽，避免误触吃掉普通点击
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const load = () => {
    adminApi.friends.list().then(setFriends).catch((e) => setError(e.message))
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个友链吗？')) return
    try {
      await adminApi.friends.remove(id)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id || !friends) return

    const from = friends.findIndex((f) => f.id === active.id)
    const to = friends.findIndex((f) => f.id === over.id)
    if (from < 0 || to < 0) return

    const prev = friends
    const next = arrayMove(friends, from, to)
    setFriends(next)

    try {
      await adminApi.friends.reorder(next.map((f) => f.id))
    } catch (err) {
      setFriends(prev)
      setError(err instanceof Error ? err.message : '排序保存失败')
    }
  }

  const closeEditor = () => setEditor({ type: 'closed' })
  const activeEditor = lastOpenRef.current
  const openNew = () => setEditor({ type: 'new' })

  return (
    <PageShell
      title="友链"
      error={error}
      action={
        <Button
          color="primary"
          onClick={openNew}
          leftIcon={<IconPlus size={16} stroke={3} />}
        >
          新建友链
        </Button>
      }
    >
      {!friends ? (
        <div className={classes.list}>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className={classes.row}>
              <div className={classes.gripCell}>
                <Skeleton width={16} height={16} />
              </div>
              <div className={classes.nameCell}>
                <Skeleton width="45%" height={22} />
                <Skeleton width="70%" height={16} />
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
      ) : friends.length === 0 ? (
        <EmptyState label="还没有友链。" ctaLabel="立即新建" onCta={openNew} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={friends.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={classes.list}>
              {friends.map((friend) => (
                <SortableFriendRow
                  key={friend.id}
                  friend={friend}
                  onEdit={() => setEditor({ type: 'edit', friend })}
                  onDelete={() => handleDelete(friend.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        title={activeEditor.type === 'edit' ? '编辑友链' : '新建友链'}
        opened={editor.type !== 'closed'}
        onClose={closeEditor}
      >
        {activeEditor.type !== 'closed' && (
          <FriendEditForm
            friend={activeEditor.type === 'edit' ? activeEditor.friend : undefined}
            onClose={closeEditor}
            onSaved={load}
          />
        )}
      </Modal>
    </PageShell>
  )
}
