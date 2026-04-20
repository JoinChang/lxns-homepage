import classes from './Spinner.module.scss'

export default function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className={classes.spinner}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(1, Math.round(size / 8)),
      }}
      aria-hidden
    />
  )
}
