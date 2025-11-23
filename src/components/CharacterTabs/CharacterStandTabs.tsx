import classes from './CharacterTabs.module.css'

import { CharacterStandProps } from "@/data/characters.tsx"
import Button from "../Button/Button.tsx"

interface CharacterStandTabsProps {
  stands: CharacterStandProps[]
  onStandChange: (stand: CharacterStandProps) => void
}

export default function CharacterStandTabs({ stands, onStandChange }: CharacterStandTabsProps) {
  const tabElements = stands.map((stand, index) => (
    <Button
      key={index}
      label={`立绘 ${index + 1}`}
      color="white"
      onClick={() => onStandChange(stand)}
    />
  ))

  return (
    <div className={classes.characterStandTabs}>
      {tabElements}
    </div>
  )
}
