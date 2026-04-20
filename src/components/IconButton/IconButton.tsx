import clsx from 'clsx'
import type { MouseEventHandler, ReactNode } from 'react'
import classes from './IconButton.module.scss'

interface IconButtonProps {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label': string
  size?: number
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function IconButton({
  children,
  onClick,
  size = 30,
  className,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      style={{ width: size, height: size }}
      className={clsx(classes.iconBtn, className)}
    >
      {children}
    </button>
  )
}
