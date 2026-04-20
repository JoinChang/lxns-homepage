import classes from './Button.module.scss'
import clsx from 'clsx'

import React from 'react'
import Spinner from '@/components/Spinner/Spinner.tsx'

interface ButtonProps {
  label?: string
  children?: React.ReactNode
  className?: string
  href?: string
  color?: 'primary' | 'white' | 'danger'
  leftIcon?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  'aria-label'?: string
}

export default function Button({
  label,
  children,
  className,
  href,
  color = 'primary',
  leftIcon,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const content = children ?? label
  const variantClass = classes[color]

  if (href) {
    return (
      <a
        className={clsx(classes.button, variantClass, className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        aria-label={ariaLabel}
      >
        {leftIcon}
        {content}
      </a>
    )
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={clsx(classes.button, variantClass, className)}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      aria-label={ariaLabel}
    >
      {loading && (
        <span className={classes.loadingOverlay}>
          <Spinner size={14} />
        </span>
      )}
      <span className={loading ? classes.innerHidden : classes.inner}>
        {leftIcon}
        {content}
      </span>
    </button>
  )
}
