import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { IconArrowLeft, IconLogout, IconUser } from '@tabler/icons-react'
import { auth } from '@/lib/auth'
import classes from './DashboardLayout.module.scss'

const NAV_ITEMS = [
  { to: '/dashboard', label: '概览', end: true },
  { to: '/dashboard/albums', label: '相册', end: false },
  { to: '/dashboard/artists', label: '作者', end: false },
  { to: '/dashboard/friends', label: '友链', end: false },
  { to: '/dashboard/settings', label: '设置', end: false },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { data: session } = auth.useSession()

  const handleSignOut = async () => {
    await auth.signOut()
    navigate('/login')
  }

  return (
    <div className={classes.layout}>
      <div className={classes.panel}>
        <header className={classes.identity}>
          <div
            className={classes.avatar}
            style={{ backgroundImage: 'url(/favicon.webp)' }}
          />
          <div className={classes.brandText}>
            <h1 className={classes.brandName}>管理面板</h1>
            <Link to="/" reloadDocument className={classes.brandSub}>
              <IconArrowLeft size={14} stroke={2.5} />
              返回首页
            </Link>
          </div>
          <div className={classes.userBlock}>
            <div className={classes.userAvatar}>
              {session?.user?.image ? (
                <img src={session.user.image} alt="" />
              ) : (
                <IconUser size={16} stroke={2.2} />
              )}
            </div>
            <span className={classes.userName}>
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              type="button"
              className={classes.signOut}
              onClick={handleSignOut}
              aria-label="退出"
            >
              <IconLogout size={16} stroke={2.2} />
            </button>
          </div>
        </header>

        <nav className={classes.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${classes.navItem} ${isActive ? classes.navItemActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className={classes.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
