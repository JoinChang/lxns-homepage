import classes from './Button.module.scss'
import clsx from "clsx"

import React from "react"

interface ButtonProps {
  label: string
  className?: string
  href?: string
  color?: 'primary' | 'white'
  leftIcon?: React.ReactNode
  onClick?: () => void
}

export default function Button({ label, className, href, color = 'primary', leftIcon, onClick }: ButtonProps) {
  const ButtonElement = href ? 'a' : 'div'

  return (
    <ButtonElement
      className={clsx(classes.button, className, {
        [classes.primary]: color === 'primary',
        [classes.white]: color === 'white',
      })}
      onClick={onClick}
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {leftIcon}
      {label}
    </ButtonElement>
  )
}
