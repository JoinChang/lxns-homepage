import classes from './CharacterTabs.module.scss'

import CharacterStandTabs from "./CharacterStandTabs.tsx"
import Link from "../Link/Link.tsx"

import { CharacterProps, CharacterStandProps } from "@/data/characters.tsx"

import React, { useEffect, useState } from "react"
import { IconLink } from "@tabler/icons-react"

function CharacterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={classes.characterSection} data-section-title={title}>
      {children}
    </div>
  )
}

export default function CharacterTabContent({ character }: { character: CharacterProps }) {
  const [stand, setStand] = useState<CharacterStandProps>(character.stands[0])
  const [standIndex, setStandIndex] = useState(0)

  useEffect(() => {
    setStand(character.stands[0])
    setStandIndex(0)
  }, [character])

  const handleStandChange = (newStand: CharacterStandProps, index: number) => {
    setStand(newStand)
    setStandIndex(index)
  }

  return (
    <div key={character.name} className={classes.characterTabContent}>
      <img key={stand.url} className={classes.characterStand} src={stand.url} alt={character.name} draggable={false} />
      <CharacterSection title="Name">
        {character.href ? (
          <h1>
            <Link href={character.href} icon={<IconLink size={28} stroke={3} />}>
              {character.name}
            </Link>
          </h1>
        ) : (
          <h1>{character.name}</h1>
        )}
        <p>{character.description}</p>
      </CharacterSection>
      <CharacterSection title="Birthday">
        <h2>{character.birthday}</h2>
      </CharacterSection>
      {character.profile && (
        <CharacterSection title="Profile">
          {character.profile}
        </CharacterSection>
      )}
      {character.story && (
        <CharacterSection title="Story">
          {character.story}
        </CharacterSection>
      )}
      <CharacterSection key={stand.artist.name} title="Artist">
        {stand.artist.href ? (
          <h3>
            <Link href={stand.artist.href} icon={stand.artist.icon}>
              {stand.artist.name}
            </Link>
          </h3>
        ) : (
          <h3>
            {stand.artist.name}
          </h3>
        )}
      </CharacterSection>
      <CharacterStandTabs stands={character.stands} activeIndex={standIndex} onStandChange={handleStandChange}/>
    </div>
  )
}
