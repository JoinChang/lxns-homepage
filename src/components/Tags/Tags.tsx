import classes from './Tags.module.css';

interface TagProps {
  label: string;
  href?: string;
}

export default function Tags({ tags }: { tags: TagProps[] }) {
  const tagElements = tags.map((tag, index) => {
    const TagElement = tag.href ? 'a' : 'span';
    const tagProps = tag.href ? { href: tag.href, target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <TagElement key={index} className={classes.tag} {...tagProps}>
        #{tag.label}
      </TagElement>
    );
  });

  return (
    <div className={classes.tags}>
      {tagElements}
    </div>
  )
}