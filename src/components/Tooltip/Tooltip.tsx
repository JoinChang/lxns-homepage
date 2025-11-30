import classes from './Tooltip.module.scss'
import clsx from 'clsx'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: TooltipPosition
  showArrow?: boolean
  className?: string
}

const OFFSET = 8

export default function Tooltip({ children, content, position = 'top', showArrow = true, className }: TooltipProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, arrowOffset: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerStartRef = useRef<{ time: number; type: string }>({ time: 0, type: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (shouldRender && isOpen) {
      const rafId = requestAnimationFrame(() => {
        setAnimateIn(true)
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [shouldRender, isOpen])

  const handleTransitionEnd = useCallback(() => {
    if (!isOpen) {
      setShouldRender(false)
    }
  }, [isOpen])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const viewportWidth = document.documentElement.clientWidth

    let top = 0
    let left = 0
    let arrowOffset = 0

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - OFFSET
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + scrollY + OFFSET
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left + scrollX - tooltipRect.width - OFFSET
        break
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + scrollX + OFFSET
        break
    }

    const maxLeft = scrollX + viewportWidth - tooltipRect.width - 8
    if (left > maxLeft) {
      arrowOffset = left - maxLeft
      left = maxLeft
    }
    if (left < scrollX + 8) {
      arrowOffset = left - (scrollX + 8)
      left = scrollX + 8
    }

    const maxArrowOffset = tooltipRect.width / 2 - 12
    arrowOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, arrowOffset))

    setCoords({ top, left, arrowOffset })
  }, [position])

  useEffect(() => {
    if (shouldRender && isOpen) {
      const rafId = requestAnimationFrame(() => {
        updatePosition()
      })

      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        cancelAnimationFrame(rafId)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [shouldRender, isOpen, updatePosition])

  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }, [])

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return

    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return

    pointerStartRef.current = { time: Date.now(), type: e.pointerType }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 500)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (Date.now() - pointerStartRef.current.time < 500) {
      return
    }

    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 1500)
  }, [])

  const handlePointerCancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={triggerRef}
      className={clsx(classes.tooltipWrapper, className)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
      {mounted && shouldRender && createPortal(
        <div
          ref={tooltipRef}
          className={clsx(classes.tooltip, classes[position], {
            [classes.visible]: animateIn,
          })}
          style={{
            top: coords.top,
            left: coords.left,
            '--arrow-offset': `${coords.arrowOffset}px`,
          } as React.CSSProperties}
          role="tooltip"
          onTransitionEnd={handleTransitionEnd}
        >
          {content}
          {showArrow && <span className={classes.arrow} />}
        </div>,
        document.body
      )}
    </div>
  )
}
