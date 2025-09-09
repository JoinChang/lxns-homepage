import classes from './ContactLinks.module.scss';

import React from "react";

interface ContactLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export default function ContactLinks({ links }: { links: ContactLinkProps[] }) {
  const linkElements = links.map((link, index) => (
    <a key={index} className={classes.contactLink} href={link.href} title={link.label} target="_blank" rel="noopener noreferrer">
      {link.icon}
    </a>
  ));

  return (
    <div className={classes.contactLinks}>
      {linkElements}
    </div>
  )
}