import classes from './CharacterTabs.module.css';

import { CharacterProps } from "@/data/characters.tsx";

import { useEffect, useRef, useState } from 'react';

interface CharacterTabsProps {
  characters: CharacterProps[];
  onCharacterChange: (character: CharacterProps) => void;
}

export default function CharacterTabs({ characters, onCharacterChange }: CharacterTabsProps) {
  const [activeCharacter, setActiveCharacter] = useState(characters[0]);
  const characterTabsRef = useRef<HTMLDivElement>(null);

  const handleCharacterClick = (character: CharacterProps) => {
    setActiveCharacter(character);
    onCharacterChange(character);
  };

  useEffect(() => {
    const characterTabs = characterTabsRef.current;
    if (!characterTabs) return;

    const tabIndex = characters.findIndex(c => c === activeCharacter);
    const backgroundElement = characterTabs.querySelector<HTMLElement>(`.${classes.background}`)!;
    const translateX = tabIndex * 135;

    characterTabs.scroll({
      left: translateX - (document.documentElement.clientWidth / 2) + 67.5,
      behavior: 'smooth',
    });

    backgroundElement.style.transform = `translateX(${translateX}px)`;
  }, [characterTabsRef, activeCharacter]);

  const characterElements = characters.map((character, index) => (
    <div className={classes.characterTab} key={index} onClick={() => handleCharacterClick(character)}>
      <img src={character.iconUrl} alt={character.name} draggable={false} />
    </div>
  ));

  return (
    <div className={classes.characterTabs} ref={characterTabsRef}>
      <div className={[classes.characterTab, classes.background].join(' ')} />
      {characterElements}
    </div>
  )
}