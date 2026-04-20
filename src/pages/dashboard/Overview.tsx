import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconPhoto,
  IconBrush,
  IconLink,
  IconEye,
  IconUsers,
  IconClock,
  IconCalendar,
  IconChartBar,
  IconClockHour4,
  IconWorld,
} from '@tabler/icons-react'
import {
  adminApi,
  type AdminAlbum,
  type AdminArtist,
  type AdminFriend,
} from '@/lib/adminApi'
import Skeleton from '@/components/Skeleton/Skeleton.tsx'
import classes from './Overview.module.scss'

interface Analytics {
  totalViews: number
  uniqueViews: number
  last24hViews: number
  last7dViews: number
  daily: { date: string; views: number }[]
  hourly: number[]
  topReferrers: { host: string; views: number }[]
  directViews: number
}

function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN')
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

export default function Overview() {
  const [albums, setAlbums] = useState<AdminAlbum[]>([])
  const [artists, setArtists] = useState<AdminArtist[]>([])
  const [friends, setFriends] = useState<AdminFriend[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.albums.list(),
      adminApi.artists.list(),
      adminApi.friends.list(),
      adminApi.analytics.get(),
    ])
      .then(([a, b, c, d]) => {
        setAlbums(a)
        setArtists(b)
        setFriends(c)
        setAnalytics(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const maxDaily = useMemo(
    () => analytics?.daily.reduce((m, d) => Math.max(m, d.views), 0) ?? 0,
    [analytics],
  )
  const maxHourly = useMemo(
    () => analytics?.hourly.reduce((m, v) => Math.max(m, v), 0) ?? 0,
    [analytics],
  )
  const maxReferrer = useMemo(() => {
    if (!analytics) return 0
    return Math.max(
      analytics.directViews,
      ...analytics.topReferrers.map((r) => r.views),
    )
  }, [analytics])

  return (
    <div className={classes.overview}>
      <h2 className={classes.heading}>概览</h2>

      {error && <div className={classes.error}>{error}</div>}

      <div className={classes.cards}>
        <Link to="/dashboard/albums" className={classes.card}>
          <span className={classes.cardIcon}>
            <IconPhoto size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>相册图片</span>
            <span className={classes.cardValue}>
              {loading ? <Skeleton width={60} height={28} /> : albums.length}
            </span>
          </div>
        </Link>
        <Link to="/dashboard/artists" className={classes.card}>
          <span className={classes.cardIcon}>
            <IconBrush size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>作者</span>
            <span className={classes.cardValue}>
              {loading ? <Skeleton width={60} height={28} /> : artists.length}
            </span>
          </div>
        </Link>
        <Link to="/dashboard/friends" className={classes.card}>
          <span className={classes.cardIcon}>
            <IconLink size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>友链</span>
            <span className={classes.cardValue}>
              {loading ? <Skeleton width={60} height={28} /> : friends.length}
            </span>
          </div>
        </Link>
      </div>

      <h2 className={classes.heading}>访问量</h2>

      <div className={classes.cards}>
        <div className={classes.card}>
          <span className={classes.cardIcon}>
            <IconEye size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>总访问</span>
            <span className={classes.cardValue}>
              {loading ? (
                <Skeleton width={80} height={28} />
              ) : (
                formatNumber(analytics?.totalViews ?? 0)
              )}
            </span>
          </div>
        </div>
        <div className={classes.card}>
          <span className={classes.cardIcon}>
            <IconUsers size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>独立访客</span>
            <span className={classes.cardValue}>
              {loading ? (
                <Skeleton width={80} height={28} />
              ) : (
                formatNumber(analytics?.uniqueViews ?? 0)
              )}
            </span>
          </div>
        </div>
        <div className={classes.card}>
          <span className={classes.cardIcon}>
            <IconClock size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>24 小时</span>
            <span className={classes.cardValue}>
              {loading ? (
                <Skeleton width={60} height={28} />
              ) : (
                formatNumber(analytics?.last24hViews ?? 0)
              )}
            </span>
          </div>
        </div>
        <div className={classes.card}>
          <span className={classes.cardIcon}>
            <IconCalendar size={18} stroke={2.2} />
          </span>
          <div className={classes.cardBody}>
            <span className={classes.cardLabel}>近 7 天</span>
            <span className={classes.cardValue}>
              {loading ? (
                <Skeleton width={60} height={28} />
              ) : (
                formatNumber(analytics?.last7dViews ?? 0)
              )}
            </span>
          </div>
        </div>
      </div>

      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <h3 className={classes.sectionTitle}>
            <IconChartBar size={14} stroke={2.5} />
            最近 14 天
          </h3>
        </div>
        {loading || !analytics ? (
          <div className={classes.chart}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={classes.barCol}>
                <div className={classes.barTrack}>
                  <Skeleton width="100%" height="40%" radius={0} />
                </div>
                <span className={classes.barLabel}>
                  <Skeleton width={22} height={10} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={classes.chart}>
            {analytics.daily.map((d) => {
              const pct = maxDaily > 0 ? (d.views / maxDaily) * 100 : 0
              return (
                <div key={d.date} className={classes.barCol}>
                  <div className={classes.barTrack} title={`${d.date} · ${d.views}`}>
                    <div
                      className={classes.bar}
                      style={{ height: `${Math.max(pct, d.views > 0 ? 4 : 0)}%` }}
                    >
                      <span className={classes.barValue}>{d.views || ''}</span>
                    </div>
                  </div>
                  <span className={classes.barLabel}>{shortDate(d.date)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <h3 className={classes.sectionTitle}>
            <IconClockHour4 size={14} stroke={2.5} />
            访问时段
          </h3>
          <span className={classes.sectionHint}>近 7 天</span>
        </div>
        {loading || !analytics ? (
          <div className={classes.hourChart}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={classes.hourCol}>
                <div className={classes.barTrack}>
                  <Skeleton width="100%" height="40%" radius={0} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={classes.hourChart}>
              {analytics.hourly.map((v, h) => {
                const pct = maxHourly > 0 ? (v / maxHourly) * 100 : 0
                return (
                  <div key={h} className={classes.hourCol}>
                    <div className={classes.barTrack} title={`${h}:00 · ${v}`}>
                      <div
                        className={classes.bar}
                        style={{ height: `${Math.max(pct, v > 0 ? 4 : 0)}%` }}
                      >
                        <span className={classes.barValue}>{v || ''}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={classes.hourAxis}>
              <span>0</span>
              <span>6</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          </>
        )}
      </div>

      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <h3 className={classes.sectionTitle}>
            <IconWorld size={14} stroke={2.5} />
            流量来源
          </h3>
          <span className={classes.sectionHint}>近 7 天</span>
        </div>
        {loading || !analytics ? (
          <ul className={classes.refList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className={classes.refRow}>
                <Skeleton width="55%" height={16} />
                <Skeleton width={40} height={16} />
              </li>
            ))}
          </ul>
        ) : analytics.topReferrers.length === 0 && analytics.directViews === 0 ? (
          <div className={classes.refEmpty}>暂无访问记录。</div>
        ) : (
          <ul className={classes.refList}>
            {analytics.directViews > 0 && (
              <li className={`${classes.refRow} ${classes.refDirect}`}>
                <span
                  className={classes.refFill}
                  style={{
                    width: `${
                      maxReferrer > 0 ? (analytics.directViews / maxReferrer) * 100 : 0
                    }%`,
                  }}
                  aria-hidden
                />
                <span className={classes.refName}>直接访问 / 无来源</span>
                <span className={classes.refCount}>
                  {formatNumber(analytics.directViews)}
                </span>
              </li>
            )}
            {analytics.topReferrers.map((r) => {
              const pct = maxReferrer > 0 ? (r.views / maxReferrer) * 100 : 0
              return (
                <li key={r.host} className={classes.refRow}>
                  <span
                    className={classes.refFill}
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                  <span className={classes.refName}>{r.host}</span>
                  <span className={classes.refCount}>{formatNumber(r.views)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
