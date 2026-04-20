import {
  IconBrandBilibili,
  IconBrandTwitterFilled,
  IconBrandWeibo,
  IconPalette,
  IconUser,
} from '@tabler/icons-react'
import type { ArtistPlatform } from '@/data/common.tsx'

export function ArtistIcon({
  platform,
  size = 20,
  stroke = 3,
}: {
  platform: ArtistPlatform | null
  size?: number
  stroke?: number
}) {
  switch (platform) {
    case 'BILIBILI':
      return <IconBrandBilibili size={size} stroke={stroke} />
    case 'TWITTER':
      return <IconBrandTwitterFilled size={size} stroke={stroke} />
    case 'WEIBO':
      return <IconBrandWeibo size={size} stroke={stroke} />
    case 'PIXIV':
      return <IconPalette size={size} stroke={stroke} />
    default:
      return <IconUser size={size} stroke={stroke} />
  }
}

export const PLATFORM_LABELS: Record<ArtistPlatform | 'NONE', string> = {
  BILIBILI: '哔哩哔哩',
  TWITTER: 'Twitter / X',
  WEIBO: '微博',
  PIXIV: 'pixiv',
  OTHER: '其他',
  NONE: '无',
}
