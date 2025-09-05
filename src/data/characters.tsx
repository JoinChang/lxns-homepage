import { IconBrandBilibili, IconBrandTwitterFilled } from "@tabler/icons-react";
import Tags from "../components/Tags/Tags.tsx";

import React from "react";

export interface CharacterStandProps {
  artist: {
    name: string;
    icon?: React.ReactNode;
    href?: string;
  }
  url: string;
}

export interface CharacterProps {
  name: string;
  href?: string;
  description: string;
  birthday: string;
  profile?: React.ReactNode;
  story?: React.ReactNode;
  iconUrl: string;
  stands: CharacterStandProps[];
}

export const characters: CharacterProps[] = [
  {
    name: 'Lxns',
    description: '也被称作：灵皢、落雪ちゃん',
    birthday: '12-06',
    profile: <>
      <p>是一个大四的普通本科生。目前正在运营 maimai DX 查分器和软糖酱机器人，闲暇时会写些代码。
        <br/><br/>主玩的音游：
        <br/>舞萌DX、中二节奏
        <br/>Minecraft Java 版玩家，也玩一些视觉小说。</p>
      <Tags tags={[
        { label: '蓝月厨', href: 'https://twitter.com/NakuruAitsuki' },
        { label: '射手座' },
      ]}/>
    </>,
    iconUrl: '/static/character-icon-1.webp',
    stands: [
      {
        artist: {
          name: 'Ulrica_菌',
          icon: <IconBrandBilibili size={20} stroke={3} />,
          href: 'https://space.bilibili.com/7495112'
        },
        url: '/static/character-1-1.webp'
      },
      {
        artist: {
          name: 'マッシュピザ',
          icon: <IconBrandTwitterFilled size={20} stroke={3} />,
          href: 'https://x.com/Mupz__'
        },
        url: '/static/character-1-2.webp'
      },
      {
        artist: {
          name: '兔田樱樱',
          icon: <IconBrandBilibili size={20} stroke={3} />,
          href: 'https://space.bilibili.com/20266608'
        },
        url: '/static/character-1-3.webp'
      }
    ]
  },
  {
    name: '软糖酱',
    href: 'https://bot.lxns.org',
    description: '也被称作：LxBot',
    birthday: '03-26',
    story: <>
      <p>出生于■■，从软糖记事起父母就消失了，随后被雪見怜下（Yukimi Reika）收养随后跟其姓，十分尊重她并且称其为姐姐。
        <br/><br/>因为姐姐带来的一些契机，所以目前在落雪咖啡屋工作，有着三年的工作经验。同时在工作中，还遇到了可爱的后辈千酱。</p>
      <Tags tags={[
        { label: '粉毛猫' },
      ]}/>
    </>,
    iconUrl: '/static/character-icon-2.webp',
    stands: [
      {
        artist: {
          name: '亿只对立',
          icon: <IconBrandBilibili size={20} stroke={3} />,
          href: 'https://space.bilibili.com/317260186'
        },
        url: '/static/character-2-1.webp'
      },
      {
        artist: {
          name: '年明Cyan',
          icon: <IconBrandBilibili size={20} stroke={3} />,
          href: 'https://space.bilibili.com/415528028'
        },
        url: '/static/character-2-2.webp'
      },
      {
        artist: {
          name: '香草LUNA',
          icon: <IconBrandBilibili size={20} stroke={3} />,
          href: 'https://space.bilibili.com/34785075'
        },
        url: '/static/character-2-3.webp'
      }
    ]
  },
  {
    name: '花间莉萝',
    description: '也被称作：莉萝爱萝莉',
    birthday: '12-08',
    story: <>
      <p>在咖啡屋故事线中出现的谜之人物……？关于 TA 的信息仍然有所欠缺。</p>
      <Tags tags={[
        { label: '美少年' },
        { label: '电动狂' },
      ]}/>
    </>,
    iconUrl: '/static/character-icon-3.webp',
    stands: [
      {
        artist: {
          name: '自己'
        },
        url: '/static/character-3.webp'
      }
    ]
  }
];