import classes from './Skeleton.module.scss'
import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number | string
  circle?: boolean
  className?: string
  style?: CSSProperties
}

export default function Skeleton({
  width,
  height,
  radius,
  circle,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      className={`${classes.skeleton} ${className ?? ''}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : radius,
        ...style,
      }}
    />
  )
}
