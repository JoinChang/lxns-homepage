import { useEffect, useMemo, useState } from 'react'
import Select from '@/components/Select/Select.tsx'
import classes from './DatePicker.module.scss'

interface DatePickerProps {
  value: string // "YYYY-MM-DD" or ""
  onChange: (v: string) => void
  minYear?: number
  maxYear?: number
}

const pad = (n: number) => n.toString().padStart(2, '0')

function daysInMonth(year: number, month: number) {
  // month: 1-12
  return new Date(year, month, 0).getDate()
}

function parseValue(value: string): [string, string, string] {
  if (!value) return ['', '', '']
  const [y, m, d] = value.split('-')
  return [y ?? '', m ?? '', d ?? '']
}

export default function DatePicker({
  value,
  onChange,
  minYear,
  maxYear,
}: DatePickerProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const yearMin = minYear ?? 2018
  const yearMax = maxYear ?? currentYear + 1

  // 本地三个分段各自维持状态；只有三项都有值才把合并结果传给父组件。
  // 这样用户选了"年"但还没选"月"时，局部选择不会被父组件重置。
  const [yStr, setYStr] = useState<string>(() => parseValue(value)[0])
  const [mStr, setMStr] = useState<string>(() => parseValue(value)[1])
  const [dStr, setDStr] = useState<string>(() => parseValue(value)[2])

  useEffect(() => {
    const [y, m, d] = parseValue(value)
    setYStr(y)
    setMStr(m)
    setDStr(d)
  }, [value])

  const yearOptions = useMemo(() => {
    const opts = [{ value: '', label: '年' }]
    for (let i = yearMax; i >= yearMin; i--) {
      opts.push({ value: String(i), label: `${i}` })
    }
    return opts
  }, [yearMin, yearMax])

  const monthOptions = useMemo(() => {
    const opts = [{ value: '', label: '月' }]
    for (let i = 1; i <= 12; i++) {
      opts.push({ value: pad(i), label: `${i}` })
    }
    return opts
  }, [])

  const dayOptions = useMemo(() => {
    const opts = [{ value: '', label: '日' }]
    const y = yStr ? Number(yStr) : 0
    const m = mStr ? Number(mStr) : 0
    const max = y && m ? daysInMonth(y, m) : 31
    for (let i = 1; i <= max; i++) {
      opts.push({ value: pad(i), label: `${i}` })
    }
    return opts
  }, [yStr, mStr])

  const emit = (ny: string, nm: string, nd: string) => {
    if (ny && nm && nd) {
      onChange(`${ny}-${nm}-${nd}`)
    } else if (!ny && !nm && !nd) {
      onChange('')
    }
    // 三项未齐：只动局部 state，父 value 不变。这样用户选完"年"再选"月"时，上一项不会被 parseValue('') 清掉。
  }

  const handleYearChange = (v: string) => {
    let nd = dStr
    if (v && mStr && nd) {
      const max = daysInMonth(Number(v), Number(mStr))
      if (Number(nd) > max) nd = pad(max)
    }
    setYStr(v)
    setDStr(nd)
    emit(v, mStr, nd)
  }

  const handleMonthChange = (v: string) => {
    let nd = dStr
    if (yStr && v && nd) {
      const max = daysInMonth(Number(yStr), Number(v))
      if (Number(nd) > max) nd = pad(max)
    }
    setMStr(v)
    setDStr(nd)
    emit(yStr, v, nd)
  }

  const handleDayChange = (v: string) => {
    setDStr(v)
    emit(yStr, mStr, v)
  }

  const handleClear = () => {
    setYStr('')
    setMStr('')
    setDStr('')
    onChange('')
  }

  const hasAnyValue = yStr || mStr || dStr

  return (
    <div className={classes.picker}>
      <div className={classes.cell}>
        <Select
          value={yStr}
          onChange={handleYearChange}
          options={yearOptions}
          placeholder="年"
        />
      </div>
      <div className={classes.cell}>
        <Select
          value={mStr}
          onChange={handleMonthChange}
          options={monthOptions}
          placeholder="月"
        />
      </div>
      <div className={classes.cell}>
        <Select
          value={dStr}
          onChange={handleDayChange}
          options={dayOptions}
          placeholder="日"
        />
      </div>
      {hasAnyValue && (
        <button type="button" className={classes.clear} onClick={handleClear}>
          清除
        </button>
      )}
    </div>
  )
}
