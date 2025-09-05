import Character from "../tabs/Chatacter/Character.tsx";
import Albums from "../tabs/Albums/Albums.tsx";
import Friends from "../tabs/Friends/Friends.tsx";

import { albumLinks } from "./albums.tsx";
import { friendLinks } from "./friends.tsx";

import React from "react";

export interface TabProps {
  label: string;
  value: string;
  count?: number;
  content: React.ReactNode;
}

export const tabs: TabProps[] = [
  {
    label: 'Character',
    value: 'character',
    content: <Character />,
  },
  {
    label: 'Albums',
    value: 'albums',
    count: albumLinks.length,
    content: <Albums />
  },
  {
    label: 'Friends',
    value: 'friends',
    count: friendLinks.length,
    content: <Friends />
  }
];