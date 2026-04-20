import classes from './EmptyState.module.scss'

interface EmptyStateProps {
  label: string
  ctaLabel?: string
  onCta?: () => void
}

export default function EmptyState({ label, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className={classes.empty}>
      {label}
      {ctaLabel && onCta && (
        <>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onCta()
            }}
          >
            {ctaLabel}
          </a>
          。
        </>
      )}
    </div>
  )
}
