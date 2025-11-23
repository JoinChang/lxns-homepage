import classes from './Content.module.css'

export default function Content({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className={classes.border} />
      <div className={classes.content}>
        {children}
      </div>
    </>
  )
}
