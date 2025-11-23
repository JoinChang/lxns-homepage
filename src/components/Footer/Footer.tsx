import classes from './Footer.module.scss'

import { socialLinks } from "@/data/socials.tsx"

export default function Footer() {
  const socialElements = socialLinks.map((social, index) => (
    <a key={index} className={classes.socialButton} href={social.href} title={social.label} target="_blank" rel="noopener noreferrer" style={{
      color: social.color
    }}>
      {social.icon}
    </a>
  ))

  return (
    <div className={classes.footerWrapper}>
      <svg 
        className={classes.waves}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
      >
        <defs>
          <path 
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" 
          />
        </defs>
        <g>
          <use xlinkHref="#gentle-wave" x="50" y="0" fill="#7a7ca8" className={[classes.waveUse, classes.waveUse1].join(' ')} />
          <use xlinkHref="#gentle-wave" x="50" y="3" fill="#6e709c" className={[classes.waveUse, classes.waveUse2].join(' ')} />
          <use xlinkHref="#gentle-wave" x="50" y="6" fill="#646692" className={[classes.waveUse, classes.waveUse3].join(' ')} />
        </g>
      </svg>
      <div className={classes.footer}>
        {socialElements}
        <p>Copyright &copy; {new Date().getFullYear()} <a href="https://lxns.net">Lxns Network</a></p>
        <p><a href="https://beian.miit.gov.cn">粤ICP备18035696号</a></p>
      </div>
    </div>
  )
}
