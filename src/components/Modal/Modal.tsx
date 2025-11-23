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

export default function Modal({ title, children, fullscreen = false, opened, onClose }: ModalProps) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 200)
  }

  useEffect(() => {
    if (opened) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [opened])

  if (!opened) return null

  return createPortal(
    <div className={clsx(classes.modal, {
      [classes.fullscreen]: fullscreen,
      [classes.closing]: closing
    })}>
      <div className={classes.mask} onClick={handleClose} />
      <div className={classes.content}>
        <div className={classes.header}>
          <h1 className={classes.title}>
            {title}
          </h1>
          <div className={classes.closeButton} onClick={handleClose}>
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
