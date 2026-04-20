import { useEffect, useRef, useState, type RefObject } from 'react'

export function distributeIntoColumns<T extends { ratio: number }>(
  items: readonly T[],
  columnCount: number,
): T[][] {
  const cols: T[][] = Array.from({ length: columnCount }, () => [])
  const heights = Array(columnCount).fill(0)
  items.forEach((it) => {
    const minIdx = heights.indexOf(Math.min(...heights))
    cols[minIdx].push(it)
    heights[minIdx] += 1 / it.ratio
  })
  return cols
}

export function useContainerColumnCount(
  containerRef: RefObject<HTMLElement | null>,
  pick: (width: number) => number,
  initial = 3,
): number {
  const [count, setCount] = useState(initial)
  // pick 通过 ref 读，允许调用方传 inline 闭包而不拆 ResizeObserver
  const pickRef = useRef(pick)
  pickRef.current = pick

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const apply = () => setCount(pickRef.current(el.clientWidth))
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  return count
}
