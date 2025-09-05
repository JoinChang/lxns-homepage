import { IconBrandBilibili, IconBrandGithubFilled, IconBrandTwitterFilled, IconRss } from "@tabler/icons-react";

export const socialLinks = [
  {
    href: 'https://space.bilibili.com/1432317833',
    icon: <IconBrandBilibili size={24} stroke={3} />,
    color: '#F282A4',
    label: 'BiliBili'
  },
  {
    href: 'https://x.com/LxBot_Official',
    icon: <IconBrandTwitterFilled size={24} />,
    color: '#00ABEC',
    label: 'Twitter'
  },
  {
    href: 'https://blog.lxns.org',
    icon: <IconRss size={24} stroke={3} />,
    color: '#EF7E3C',
    label: 'Blog'
  },
  {
    href: 'https://github.com/Lxns-Network',
    icon: <IconBrandGithubFilled size={24} />,
    color: '#24292F',
    label: 'GitHub'
  }
];