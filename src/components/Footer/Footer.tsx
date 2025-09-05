import classes from './Footer.module.scss';

import { socialLinks } from "@/data/socials.tsx";

export default function Footer() {
  const socialElements = socialLinks.map((social, index) => (
    <a key={index} className={classes.socialButton} href={social.href} style={{
      color: social.color
    }}>
      {social.icon}
    </a>
  ));

  return (
    <div className={classes.footer}>
      {socialElements}
      <p>Copyright &copy; {new Date().getFullYear()} <a href="https://lxns.net">Lxns Network</a></p>
      <p><a href="https://beian.miit.gov.cn">粤ICP备18035696号</a></p>
    </div>
  )
}