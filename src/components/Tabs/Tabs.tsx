import classes from './Tabs.module.scss'
import clsx from 'clsx'

import { TabProps } from "@/data/tabs.tsx"

interface TabsProps {
  tabs: TabProps[]
  activeTab: string
  onTabChange: (value: string) => void
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const handleTabClick = (tabValue: string) => {
    onTabChange(tabValue)
  }

  const tabElements = tabs.map((tab) => (
    <div
      key={tab.value}
      className={clsx(classes.tab, { [classes.active]: tab.value === activeTab })}
      data-count={tab.count && activeTab !== tab.value ? tab.count : undefined}
      onClick={() => handleTabClick(tab.value)}
    >
      {tab.label}
    </div>
  ))

  return (
    <div className={classes.tabs}>
      {tabElements}
    </div>
  )
}
