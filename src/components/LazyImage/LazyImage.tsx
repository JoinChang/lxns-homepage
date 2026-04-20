import { useEffect, useRef } from 'react'
import type { ImgHTMLAttributes, RefObject } from 'react'

/**
 * 共享 lazy-load 实现：在 img ref 上挂 IntersectionObserver，
 * 进入视口（带 rootMargin 预取）时把 data-src 赋给 src。
 */
export function useLazyImageSrc(
  ref: RefObject<HTMLImageElement | null>,
  src: string,
  rootMargin: string = '100px',
) {
  useEffect(() => {
    const img = ref.current
    if (!img) return
    // React 更新 data-src 是在 attribute 上；observer 触发时才把它写到 src
    img.dataset.src = src

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement
            target.src = target.dataset.src || ''
            observer.unobserve(target)
          }
        })
      },
      { rootMargin },
    )

    observer.observe(img)
    return () => observer.disconnect()
  }, [ref, src, rootMargin])
}

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> & {
  src: string
  rootMargin?: string
}

export default function LazyImage({
  src,
  rootMargin = '100px',
  ...imgProps
}: LazyImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  useLazyImageSrc(ref, src, rootMargin)
  return <img ref={ref} data-src={src} decoding="async" {...imgProps} />
}
