import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import classes from './Select.module.scss'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

interface Position {
  top: number
  left: number
  width: number
}

const ANIM_DURATION = 150

export default function Select({
  value,
  onChange,
  options,
  placeholder = '请选择',
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [pos, setPos] = useState<Position | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 动画状态机：open 变化时同步 rendered/closing
  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      return
    }
    if (rendered) {
      setClosing(true)
      const t = setTimeout(() => {
        setRendered(false)
        setClosing(false)
      }, ANIM_DURATION)
      return () => clearTimeout(t)
    }
  }, [open, rendered])

  useLayoutEffect(() => {
    if (!rendered || !triggerRef.current) return

    const update = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [rendered])

  useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div className={`${classes.wrapper} ${className ?? ''}`} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${classes.trigger} ${open ? classes.triggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? classes.value : classes.placeholder}>
          {selected?.label ?? placeholder}
        </span>
        <IconChevronDown size={16} stroke={2} className={classes.chevron} />
      </button>
      {rendered &&
        pos &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`${classes.dropdown} ${closing ? classes.dropdownClosing : ''}`}
            role="listbox"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {options.map((opt) => {
              const active = opt.value === value
              return (
                <button
                  type="button"
                  key={opt.value}
                  role="option"
                  aria-selected={active}
                  className={`${classes.option} ${active ? classes.optionActive : ''}`}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <span className={classes.optionLabel}>{opt.label}</span>
                  {active && <IconCheck size={14} stroke={2.5} />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
