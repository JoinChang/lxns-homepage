import classes from './Albums.module.css'

import { IconArrowsMaximize } from "@tabler/icons-react"
import AlbumsWaterfall from "@/components/AlbumsWaterfall/AlbumsWaterfall.tsx"
import Button from "@/components/Button/Button.tsx"
import Modal from "@/components/Modal/Modal.tsx"

import { albumLinks } from "@/data/albums.tsx"

import { useEffect, useState } from "react"

export default function Albums() {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      document.querySelector(`.${classes.container}`)?.scrollTo(0, 0)
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={classes.container}>
      <Modal
        title="回忆相册"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <div className={classes.description}>
          这里记录着我的一些稿件，往下滚动可以查看更多
        </div>
        <AlbumsWaterfall images={albumLinks}/>
      </Modal>
      <h1 className={classes.title}>
        回忆相册
      </h1>
      <p className={classes.description}>
        记录过往的点点滴滴
      </p>
      <AlbumsWaterfall images={albumLinks} />
      <div className={classes.showMore}>
        <div className={classes.mask} />
        <Button
          className={classes.button}
          label="查看更多"
          leftIcon={<IconArrowsMaximize size={16} />}
          onClick={() => setOpened(true)}
        />
      </div>
    </div>
  )
}
