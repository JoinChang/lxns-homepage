import { faDiscord, faQq, faSteam } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const contactLinks = [
  {
    href: 'https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&inviteCode=1SJaD1&from=246610&biz=ka',
    icon: <FontAwesomeIcon icon={faQq} />,
    label: 'QQ'
  },
  {
    href: 'https://discord.gg/lxnet',
    icon: <FontAwesomeIcon icon={faDiscord} />,
    label: 'Discord'
  },
  {
    href: 'https://steamcommunity.com/groups/lxns',
    icon: <FontAwesomeIcon icon={faSteam} />,
    label: 'Steam'
  },
  {
    href: 'mailto:i@lxns.net',
    icon: <FontAwesomeIcon icon={faEnvelope} />,
    label: 'Email'
  }
];