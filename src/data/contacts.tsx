import IconQq from '@/assets/icons/qq.svg?react'
import IconDiscord from '@/assets/icons/discord.svg?react'
import IconSteam from '@/assets/icons/steam.svg?react'
import { IconMailFilled } from "@tabler/icons-react"

export const contactLinks = [
  {
    href: 'https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&inviteCode=1SJaD1&from=246610&biz=ka',
    icon: <IconQq />,
    label: 'QQ'
  },
  {
    href: 'https://discord.gg/lxnet',
    icon: <IconDiscord />,
    label: 'Discord'
  },
  {
    href: 'https://steamcommunity.com/groups/lxns',
    icon: <IconSteam />,
    label: 'Steam'
  },
  {
    href: 'mailto:i@lxns.net',
    icon: <IconMailFilled />,
    label: 'Email'
  }
]
