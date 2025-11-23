import classes from "./AlbumsWaterfall.module.css"

import { AlbumImageProps } from "@/data/albums.tsx"

import { useEffect, useRef } from "react"

export default function AlbumImage({ file, ratio }: AlbumImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLImageElement>(null)

  // 图片懒加载
  useEffect(() => {
    const img = ref.current
    if (!img) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement
          target.src = target.dataset.src || ''
          observer.unobserve(target)
        }
      })
    }, {
      rootMargin: '100px',
    })

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [ref])

  // 鼠标跟随与点击效果
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let bounds = { x: 0, y: 0, width: 0, height: 0 }
    let rafId: number
    let isPressed = false
    let isMouseInteraction = false

    const image = container.querySelector<HTMLElement>(`.${classes.image}`)!
    const glow = image.querySelector<HTMLElement>(`.${classes.glow}`)!

    const applyTransform = (center: { x: number, y: number }, distance: number) => {
      let scale = isPressed ? 1.05 : 1.07
      if (!isMouseInteraction) {
        scale = isPressed ? 0.98 : 1
      }
      const angle = isPressed ? Math.log(distance || 1) * 1.2 : Math.log(distance || 1) * 2

      container.style.zIndex = '1'
      image.style.transform = `
        scale3d(${scale}, ${scale}, ${scale})
        ${isMouseInteraction ? `rotate3d(
          ${center.y / 100},
          ${-center.x / 100},
          0,
          ${angle}deg
        )` : ''}
      `

      if (!isMouseInteraction) {
        glow.style.background = ''
      } else {
        glow.style.background = `
          radial-gradient(
            circle at
            ${center.x * 2 + bounds.width / 2}px
            ${center.y * 2 + bounds.height / 2}px,
            #ffffff55,
            #0000000f
          )
        `
      }
    }

    const rotateToMouse = (e: PointerEvent) => {
      isMouseInteraction = e.pointerType === 'mouse'
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const mouseX = e.clientX
        const mouseY = e.clientY
        const leftX = mouseX - bounds.x
        const topY = mouseY - bounds.y
        const center = {
          x: leftX - bounds.width / 2,
          y: topY - bounds.height / 2
        }
        const distance = Math.sqrt(center.x ** 2 + center.y ** 2)
        applyTransform(center, distance)
      })
    }

    const handleEnter = () => {
      bounds = image.getBoundingClientRect()
      document.addEventListener('pointermove', rotateToMouse)
    }

    const handleLeave = () => {
      document.removeEventListener('pointermove', rotateToMouse)
      cancelAnimationFrame(rafId)
      setTimeout(() => {
        container.style.zIndex = ''
      }, 200)
      image.style.transform = ''
      glow.style.background = ''
    }

    const handleDown = (e: PointerEvent) => {
      isPressed = true
      rotateToMouse(e)
    }

    const handleUp = (e: PointerEvent) => {
      if (!isPressed) return
      isPressed = false
      rotateToMouse(e)
    }

    image.addEventListener('pointerenter', handleEnter)
    image.addEventListener('pointerleave', handleLeave)
    image.addEventListener('pointerdown', handleDown)
    document.addEventListener('pointerup', handleUp)

    return () => {
      document.removeEventListener('pointermove', rotateToMouse)
      image.removeEventListener('pointerenter', handleEnter)
      image.removeEventListener('pointerleave', handleLeave)
      image.removeEventListener('pointerdown', handleDown)
      document.removeEventListener('pointerup', handleUp)
      cancelAnimationFrame(rafId)
    }
  }, [containerRef])

  return (
    <div style={{ perspective: '1500px' }} ref={containerRef}>
      <div className={classes.image} style={{ paddingTop: `${100 / ratio}%` }}>
        <img
          data-src={`https://assets.lxns.net/homepage/albums/${file}`}
          ref={ref}
          alt={file}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div className={classes.glow}/>
      </div>
    </div>
  )
}
