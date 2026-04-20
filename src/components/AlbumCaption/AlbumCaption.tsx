import type { Artist } from '@/data/common.tsx'
import classes from './AlbumCaption.module.scss'

interface AlbumCaptionProps {
  artist: Artist | null
  date: string | null
}

export default function AlbumCaption({ artist, date }: AlbumCaptionProps) {
  return (
    <div className={classes.caption}>
      <span className={`${classes.artistName} ${artist ? '' : classes.muted}`}>
        {artist?.name ?? '未设置作者'}
      </span>
      {date && <span className={classes.date}>{date.slice(0, 10)}</span>}
    </div>
  )
}
