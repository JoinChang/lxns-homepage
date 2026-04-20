import classes from "./Modal.module.scss"
import clsx from "clsx"

import { IconX } from "@tabler/icons-react"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  title: string
  children: React.ReactNode
  fullscreen?: boolean
  opened: boolean
  onClose: () => void
}

const ANIM_DURATION = 200

// 多 Modal 共用 body scroll lock —— ref-count 保证嵌套时不互相覆盖
let bodyScrollLockCount = 0
function acquireBodyScrollLock() {
  bodyScrollLockCount += 1
  if (bodyScrollLockCount === 1) {
    document.body.style.overflow = 'hidden'
  }
}
function releaseBodyScrollLock() {
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1)
  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = ''
  }
}

export default function Modal({ title, children, fullscreen = false, opened, onClose }: ModalProps) {
  const [rendered, setRendered] = useState(opened)
  const [closing, setClosing] = useState(false)

  // 外部 opened 切换时驱动进出动画
  useEffect(() => {
    if (opened) {
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
  }, [opened, rendered])

  useEffect(() => {
    if (!rendered || closing) return
    acquireBodyScrollLock()
    return () => releaseBodyScrollLock()
  }, [rendered, closing])

  if (!rendered) return null

  return createPortal(
    <div className={clsx(classes.modal, {
      [classes.fullscreen]: fullscreen,
      [classes.closing]: closing
    })}>
      <div className={classes.mask} onClick={onClose} />
      <div className={classes.content}>
        <div className={classes.header}>
          <h1 className={classes.title}>
            {title}
          </h1>
          <div className={classes.closeButton} onClick={onClose}>
            <IconX size={20}/>
          </div>
        </div>
        <div className={classes.body}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
