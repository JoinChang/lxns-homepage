import classes from './AlbumsWaterfall.module.css'

import AlbumImage from "./AlbumImage.tsx"

import { AlbumImageProps } from "@/data/albums.tsx"

import { useEffect, useMemo, useRef, useState } from "react"

interface AlbumsWaterfallProps {
  images: AlbumImageProps[]
}

export default function AlbumsWaterfall({ images }: AlbumsWaterfallProps) {
  const [columns, setColumns] = useState(3)
  const containerRef = useRef<HTMLDivElement>(null)

  const sortedImages = useMemo(() => {
    return images.slice().sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
  }, [images])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      const width = container.clientWidth
      if (width <= 300) {
        setColumns(1)
      } else if (width <= 580) {
        setColumns(2)
      } else {
        setColumns(3)
      }
    }

    handleResize()

    const observer = new ResizeObserver(handleResize)

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  const columned = useMemo(() => {
    const cols: AlbumImageProps[][] = Array.from({ length: columns }, () => [])
    const heights = Array(columns).fill(0)

    sortedImages.forEach((img) => {
      const min = heights.indexOf(Math.min(...heights))
      cols[min].push(img)
      heights[min] += 1 / img.ratio
    })

    return cols
  }, [sortedImages, columns])

  return (
    <div className={classes.albumWaterfall} ref={containerRef}>
      {columned.map((col, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
          {col.map((image) => (
            <AlbumImage key={image.file} {...image} />
          ))}
        </div>
      ))}
    </div>
  )
}
