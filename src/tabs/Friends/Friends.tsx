import classes from './Friends.module.css';

import Link from "@/components/Link/Link.tsx";

import { friendLinks } from "@/data/friends.tsx";

function FriendColumn({ friends }: { friends: typeof friendLinks }) {
  const friendElements = friends.map((friend) => (
    <div key={friend.name} className={classes.friendItem}>
      <h2>{friend.name}</h2>
      <p>{friend.description}</p>
      <Link
        href={friend.href}
        icon={<img src={`https://t2.gstatic.cn/faviconV2?client=SOCIAL&url=${friend.href}`} alt={friend.name} />
      }>
        {friend.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </Link>
    </div>
  ));

  return (
    <div className={classes.friendColumn}>
      {friendElements}
    </div>
  )
}

export default function Friends() {
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        朋友们
      </h1>
      <p className={classes.description}>
        这里是我的朋友们，按照字母顺序排序：
      </p>
      <FriendColumn friends={friendLinks} />
    </div>
  )
}