import classes from './Friends.module.css'

import Link from "@/components/Link/Link.tsx"
import { useSSRData } from "@/contexts/SSRDataContext.tsx"
import type { FriendLink } from "@/data/common.tsx"

function FriendColumn({ friends }: { friends: FriendLink[] }) {
  const friendElements = friends.map((friend) => (
    <div key={friend.id} className={classes.friendItem}>
      <h2>{friend.name}</h2>
      <p>{friend.description}</p>
      <Link
        href={friend.href}
        icon={<img src={`/api/favicon?url=${encodeURIComponent(friend.href)}`} alt={friend.name} />}
      >
        {friend.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </Link>
    </div>
  ))

  return (
    <div className={classes.friendColumn}>
      {friendElements}
    </div>
  )
}

export default function Friends() {
  const { friends } = useSSRData()

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        朋友们
      </h1>
      <p className={classes.description}>
        这里是我的朋友们，按照字母顺序排序：
      </p>
      <FriendColumn friends={friends} />
    </div>
  )
}
