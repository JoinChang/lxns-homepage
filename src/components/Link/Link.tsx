import classes from './Link.module.scss';

import { IconLink } from "@tabler/icons-react";

import React from "react";

interface LinkProps {
  href: string;
  icon?: React.ReactNode;
  children: string;
}

export default function Link({ href, icon = <IconLink size={16} stroke={3} />, children }: LinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes.link}>
      {icon}
      {children}
    </a>
  )
}