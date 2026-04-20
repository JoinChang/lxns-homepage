import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { auth } from '@/lib/auth'
import DashboardSkeleton from '@/pages/dashboard/_shared/DashboardSkeleton.tsx'
import classes from './AdminRoute.module.scss'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = auth.useSession()

  if (isPending) {
    return <DashboardSkeleton />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') {
    return (
      <div className={classes.forbidden}>
        <div className={classes.forbiddenCard}>
          <h1>403 Forbidden</h1>
          <p>你没有访问管理面板的权限。</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
