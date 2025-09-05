import classes from './Header.module.css';

import Link from "../Link/Link.tsx";

export default function Header() {
  return (
    <div>
      <img className={classes.avatar} src="/favicon.webp" alt="avatar"/>
      <div className={classes.mainDescription}>
        <h1 className={classes.name}>
          落雪咖啡屋
        </h1>
        <p className={classes.alias}>
          Lxns Network
        </p>
        <p className={classes.simpleProfile}>
          国外站：<Link href="https://lxns.org">lxns.org</Link>
        </p>
      </div>
    </div>
  )
}