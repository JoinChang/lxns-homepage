import classes from './Character.module.css'

import CharacterTabs from "@/components/CharacterTabs/CharacterTabs.tsx"
import CharacterTabContent from "@/components/CharacterTabs/CharacterTabContent.tsx"

import { CharacterProps, characters } from "@/data/characters.tsx"

import { useState } from "react"

export default function Character() {
  const [character, setCharacter] = useState<CharacterProps>(characters[0])

  return (
    <div className={classes.container}>
      <h1 className={classes.title} style={{ margin: '15px', marginBottom: '10px' }}>
        人物
      </h1>
      <CharacterTabs characters={characters} onCharacterChange={setCharacter} />
      <CharacterTabContent character={character} />
    </div>
  )
}
