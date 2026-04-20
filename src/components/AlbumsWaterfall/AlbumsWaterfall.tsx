import { useMemo, useRef } from 'react'
import classes from './AlbumsWaterfall.module.css'
import AlbumImage from './AlbumImage.tsx'
import type { AlbumImageProps } from '@/data/common.tsx'
import {
  distributeIntoColumns,
  useContainerColumnCount,
} from '@/components/Masonry/useMasonryColumns.ts'

interface AlbumsWaterfallProps {
  images: AlbumImageProps[]
}

function pickColumnCount(width: number): number {
  if (width <= 300) return 1
  if (width <= 580) return 2
  return 3
}

export default function AlbumsWaterfall({ images }: AlbumsWaterfallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const columnCount = useContainerColumnCount(containerRef, pickColumnCount, 3)

  const sortedImages = useMemo(() => {
    return images.slice().sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
  }, [images])

  const columned = useMemo(
    () => distributeIntoColumns(sortedImages, columnCount),
    [sortedImages, columnCount],
  )

  return (
    <div className={classes.albumWaterfall} ref={containerRef}>
      {columned.map((col, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {col.map((image) => (
            <AlbumImage key={image.file} {...image} />
          ))}
        </div>
      ))}
    </div>
  )
}
