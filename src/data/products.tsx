import {
  IconBrandBilibili, IconBrandPatreonFilled, IconBrandSteamFilled, IconHeadphonesFilled, IconPlus, IconSearch,
  IconShoppingCartFilled
} from "@tabler/icons-react";
import Link from "../components/Link/Link.tsx";

import React from "react";

export interface ProductProps {
  title: string;
  description: React.ReactNode;
  imageUrl: string;
  links: {
    name: string;
    href?: string;
    icon: React.ReactNode;
    label: string;
  }[];
}

export const products = [
  {
    title: '系列表情包《落雪咖啡屋3》',
    description: <>
      由 <Link href="https://space.bilibili.com/6706624" icon={<IconBrandBilibili size={16} stroke={3} />}>虞十七_Yuichi</Link> 绘制，本系列展现落雪与软糖的冬日新装和日常趣事。
    </>,
    imageUrl: 'https://i0.hdslb.com/bfs/new_dyn/29121d574815a1e8814a7354325e456c1432317833.jpg@.webp',
    links: [
      {
        name: 'QQ',
        icon: <IconSearch size={16} stroke={3} />,
        label: '落雪软糖3'
      },
      {
        name: '微信',
        href: 'https://weixin.qq.com/jumpemoticonstore?token=AAshJxQFAAABAAAAAADmRniI3t5dfVCBEAWzaBAAAABQfF0uS5S5suWyaDJKBpGHisXwpZG9P3DJmF7Gq6_-WumSz_L8zPMGqRKxd6csT1z1abympU20-O02FT9mcNtCg5bVTp-iv-p9bZm1lnJj_CLvzItwYNAVYKhipJ7cH8rEEetGV6AmdGBV8qoSZDH_xjqw9Zbesr7V',
        icon: <IconShoppingCartFilled size={16} />,
        label: '访问商店'
      }
    ]
  },
  {
    title: '系列表情包《落雪咖啡屋2》',
    description: <>
      由 <Link href="https://space.bilibili.com/6706624" icon={<IconBrandBilibili size={16} stroke={3} />}>虞十七_Yuichi</Link> 绘制，讲述落雪与软糖的日常故事。
    </>,
    imageUrl: 'https://i0.hdslb.com/bfs/new_dyn/82873e0c77b278b29dc53316473e90181432317833.png@.webp',
    links: [
      {
        name: 'QQ',
        icon: <IconSearch size={16} stroke={3} />,
        label: '落雪软糖2'
      },
      {
        name: '微信',
        href: 'https://weixin.qq.com/jumpemoticonstore?token=AAshJxQFAAABAAAAAAByasaf5tl5emFYaz1DZxAAAABQfF0uS5S5suWyaDJKBpGHkBLvmxA8vDfDmVOR92BYlP0Iv3OQ7OkQX8SpBlpdtGkeIulmrlNtiZOAdvvx%2B0qNWEIslMUYIFFO2b7my9RxC%2Bv2KNCLZIkXWiyQmELIzNQZzOmHbOrEg3Le5sOWPpW6Z7T45x5YtQGU',
        icon: <IconShoppingCartFilled size={16} />,
        label: '访问商店'
      }
    ]
  },
  {
    title: '系列表情包《落雪咖啡屋》',
    description: <>
      主要由 <Link href="https://space.bilibili.com/29159647" icon={<IconBrandBilibili size={16} stroke={3} />}>HijoDeLaLuna_</Link> 绘制，记录落雪与软糖的温馨日常。
    </>,
    imageUrl: 'https://i0.hdslb.com/bfs/new_dyn/88e661ac87b95f3b4dd28082fe5eff1b1432317833.jpg@.webp',
    links: [
      {
        name: 'QQ',
        href: 'https://zb.vip.qq.com/hybrid/emoticonmall/detail?id=232413&to=recommend&traceDetail=base64-eyJhcHBpZCI6Im91dHNpZGUiLCJwYWdlX2lkIjoiNDciLCJpdGVtX2lkIjoiIiwiaXRlbV90eXBlIjoiIn0=',
        icon: <IconShoppingCartFilled size={16} />,
        label: '访问商店'
      },
      {
        name: '微信',
        href: 'https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/emoticonview?oper=single&t=shop/detail&productid=aL2PCfwK/89qO7sF6/+I+UDhfwEjhec2ZNvdnLLJRd/OfN9/XCiNlCZxbOrx1we9G2IAVsevFMPIdggg456Owa3cpVI+aAdA1AfWZM19yadk=',
        icon: <IconShoppingCartFilled size={16} />,
        label: '访问商店'
      },
      {
        name: 'Telegram',
        href: 'https://t.me/addstickers/lxbot',
        icon: <IconPlus size={16} stroke={3} />,
        label: '添加贴纸'
      }
    ]
  },
  {
    title: '软糖同名歌曲《JeLLy DroP!!!》',
    description: '该曲是由 VOCALOID P 主 SUMi 为软糖一周年创作的原创祝福曲，由初音未来演唱。',
    imageUrl: 'https://p1.music.126.net/t48zc2Stmr26eioZeDSccQ==/109951164736984737.jpg',
    links: [
      {
        name: 'QQ 音乐',
        href: 'https://y.qq.com/n/ryqq/songDetail/002zElqo44b8a8',
        icon: <IconHeadphonesFilled size={16} />,
        label: '进入试听'
      },
      {
        name: '网易云音乐',
        href: 'https://music.163.com/#/song?id=1433900140',
        icon: <IconHeadphonesFilled size={16} />,
        label: '进入试听'
      },
      {
        name: 'YouTube',
        href: 'https://www.youtube.com/watch?v=_IHQ-Own7c8',
        icon: <IconHeadphonesFilled size={16} />,
        label: '进入试听'
      }
    ]
  },
  {
    title: '冒险小游戏《佩尔霍宁》',
    description: <>
      由 <Link href="http://www.liluoailuoli.cn" icon={<IconBrandBilibili size={16} stroke={3} />}>莉萝工作室</Link> 开发的一个缝合略微恐怖、射击、解谜的冒险小游戏，玩家将作为落雪探索名为“佩尔霍宁”的地下世界。
    </>,
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/1988630/header_schinese.jpg',
    links: [
      {
        name: 'Windows',
        href: 'https://store.steampowered.com/app/1988630/_/?l=schinese',
        icon: <IconBrandSteamFilled size={16} />,
        label: 'Steam 下载'
      },
      {
        name: 'Android',
        href: 'https://www.taptap.cn/app/233158',
        icon: <IconShoppingCartFilled size={16} />,
        label: 'TapTap 下载'
      }
    ]
  },
  {
    title: '原创漫画《落雪趴！》',
    description: <>
      由 <Link href="https://space.bilibili.com/21792043" icon={<IconBrandBilibili size={16} stroke={3} />}>花间莉萝</Link> 绘制，讲述一个刚高中毕业的准大学生，落雪在一次昏迷后醒来，发现自己竟然变成了一个美少女。他意识到自己的思维似乎也受到了身体的影响，决定尽快找到这一切的原因，结束这场闹剧。
    </>,
    imageUrl: 'https://i0.hdslb.com/bfs/new_dyn/3f40aeff3437c6afbcda0258d721e79e9216331.png@1036w_!web-dynamic.webp',
    links: [
      {
        name: '简体中文',
        href: 'https://www.bilibili.com/read/cv24290414',
        icon: <IconBrandBilibili size={16} stroke={3} />,
        label: '在哔哩哔哩阅览'
      },
      {
        name: 'English',
        href: 'https://www.patreon.com/posts/paripi-reika-1-84944611',
        icon: <IconBrandPatreonFilled size={16} />,
        label: '在 Patreon 阅览'
      }
    ]
  }
]