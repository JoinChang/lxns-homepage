import type { ReactNode } from 'react'
import classes from './PageShell.module.scss'

interface PageShellProps {
  title: ReactNode
  action?: ReactNode
  error?: string | null
  children: ReactNode
}

export default function PageShell({ title, action, error, children }: PageShellProps) {
  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <h1>{title}</h1>
        {action}
      </header>
      {error && <div className={classes.error}>{error}</div>}
      {children}
    </div>
  )
}
