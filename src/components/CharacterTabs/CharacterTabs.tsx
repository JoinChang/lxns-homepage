import classes from './CharacterTabs.module.scss'

import { CharacterProps } from "@/data/characters.tsx"
import clsx from 'clsx'

import { useEffect, useRef, useState } from 'react'

interface CharacterTabsProps {
  characters: CharacterProps[]
  onCharacterChange: (character: CharacterProps) => void
}

export default function CharacterTabs({ characters, onCharacterChange }: CharacterTabsProps) {
  const [activeCharacter, setActiveCharacter] = useState(characters[0])
  const [leftMaskActive, setLeftMaskActive] = useState(false)
  const [rightMaskActive, setRightMaskActive] = useState(true)
  const characterTabsRef = useRef<HTMLDivElement>(null)

  const handleCharacterClick = (character: CharacterProps) => {
    setActiveCharacter(character)
    onCharacterChange(character)
  }

  useEffect(() => {
    const characterTabs = characterTabsRef.current
    if (!characterTabs) return

    const tabIndex = characters.findIndex(c => c === activeCharacter)
    const backgroundElement = characterTabs.querySelector<HTMLElement>(`.${classes.background}`)!
    const translateX = tabIndex * 135

    characterTabs.scroll({
      left: translateX - (document.documentElement.clientWidth / 2) + 67.5,
      behavior: 'smooth',
    })

    backgroundElement.style.transform = `translateX(${translateX}px)`

    // 处理遮罩显示
    const handleScroll = () => {
      const scrollLeft = Math.round(characterTabs.scrollLeft)
      setLeftMaskActive(scrollLeft > 0)
      setRightMaskActive(scrollLeft + characterTabs.clientWidth < characterTabs.scrollWidth)
    }
    
    characterTabs.addEventListener('scroll', handleScroll)

    return () => {
      characterTabs.removeEventListener('scroll', handleScroll)
    }
  }, [characterTabsRef, activeCharacter])

  const characterElements = characters.map((character, index) => (
    <div className={classes.characterTab} key={index} onClick={() => handleCharacterClick(character)}>
      <img src={character.iconUrl} alt={character.name} draggable={false} />
    </div>
  ))

  return (
    <div className={classes.characterTabs} ref={characterTabsRef}>
      <div className={[classes.characterTab, classes.background].join(' ')} />
      <div className={clsx(classes.leftMask, { [classes.active]: leftMaskActive })} />
      <div className={clsx(classes.rightMask, { [classes.active]: rightMaskActive })} />
      {characterElements}
    </div>
  )
}
