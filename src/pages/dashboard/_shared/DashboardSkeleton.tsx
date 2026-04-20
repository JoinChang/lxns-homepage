import Skeleton from '@/components/Skeleton/Skeleton.tsx'
import layout from '../DashboardLayout.module.scss'
import classes from './DashboardSkeleton.module.scss'

const NAV_COUNT = 5

export default function DashboardSkeleton() {
  return (
    <div className={layout.layout}>
      <div className={layout.panel}>
        <header className={layout.identity}>
          <div
            className={layout.avatar}
            style={{ backgroundImage: 'url(/favicon.webp)' }}
          />
          <div className={layout.brandText}>
            <h1 className={layout.brandName}>管理面板</h1>
            <span className={classes.brandSubPlaceholder}>
              <Skeleton width={64} height={12} />
            </span>
          </div>
          <div className={layout.userBlock}>
            <div className={layout.userAvatar} />
            <span className={layout.userName}>
              <Skeleton width={96} height={14} />
            </span>
            <div className={layout.signOut} />
          </div>
        </header>

        <nav className={layout.nav}>
          {Array.from({ length: NAV_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`${layout.navItem} ${classes.navItemPlaceholder}`}
            />
          ))}
        </nav>

        <main className={layout.content}>
          <div className={classes.contentBlock}>
            <Skeleton width="40%" height={20} />
            <Skeleton width="70%" height={14} />
            <Skeleton width="60%" height={14} />
          </div>
        </main>
      </div>
    </div>
  )
}
