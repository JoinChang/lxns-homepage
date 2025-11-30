import classes from './CharacterTabs.module.scss'

import { CharacterStandProps } from "@/data/characters.tsx"
import { IconSwitchHorizontal } from "@tabler/icons-react"
import { useState } from "react"
import Tooltip from "../Tooltip/Tooltip.tsx"

interface CharacterStandTabsProps {
  stands: CharacterStandProps[]
  activeIndex: number
  onStandChange: (stand: CharacterStandProps, index: number) => void
}

export default function CharacterStandTabs({ stands, activeIndex, onStandChange }: CharacterStandTabsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (stands.length <= 1) return null

  const handleItemClick = (stand: CharacterStandProps, index: number) => {
    onStandChange(stand, index)
    setIsOpen(false)
  }

  return (
    <div className={classes.fabContainer}>
      <div className={`${classes.fabMenu} ${isOpen ? classes.fabMenuOpen : ''}`}>
        {stands.map((stand, index) => (
          <button
            key={index}
            className={`${classes.fabMenuItem} ${activeIndex === index ? classes.fabMenuItemActive : ''}`}
            style={{
              '--item-index': index,
              '--total-items': stands.length,
            } as React.CSSProperties}
            onClick={() => handleItemClick(stand, index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <Tooltip
        content="切换立绘"
        position="bottom"
        className={classes.fabButtonWrapper}
      >
        <button
          className={`${classes.fabButton} ${isOpen ? classes.fabButtonOpen : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <IconSwitchHorizontal size={20} stroke={2} />
        </button>
      </Tooltip>
    </div>
  )
}
