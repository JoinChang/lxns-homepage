import classes from './Tabs.module.scss';

import React from 'react';

interface TabContentProps {
  value: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function TabContent({ value, onClick, children }: TabContentProps) {
  return (
    <div className={classes.tabContent} data-tab-value={value} onClick={onClick}>
      {children}
    </div>
  )
}