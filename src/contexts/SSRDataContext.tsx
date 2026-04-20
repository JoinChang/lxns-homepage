import { createContext, useContext, type ReactNode } from 'react'
import type { AlbumImageProps, FriendLink } from '@/data/common.tsx'

export interface SSRData {
  albums: AlbumImageProps[]
  friends: FriendLink[]
}

const SSRDataContext = createContext<SSRData | null>(null)

export function SSRDataProvider({
  value,
  children,
}: {
  value: SSRData
  children: ReactNode
}) {
  return <SSRDataContext.Provider value={value}>{children}</SSRDataContext.Provider>
}

export function useSSRData(): SSRData {
  const ctx = useContext(SSRDataContext)
  if (!ctx) {
    throw new Error('useSSRData must be used within SSRDataProvider')
  }
  return ctx
}

declare global {
  interface Window {
    __SSR_DATA__?: SSRData
  }
}
