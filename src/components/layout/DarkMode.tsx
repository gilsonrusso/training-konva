import { useColorScheme } from '@mui/material'
import Switch from '@mui/material/Switch'
import { useEffect, useState } from 'react'

const label = { inputProps: { 'aria-label': 'Switch demo' } }

export default function BasicSwitches() {
  const { setMode } = useColorScheme()
  const [dark, setDark] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    setMode(dark)
  }, [dark, setMode])

  return (
    <div>
      <Switch
        onChange={() => setDark((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        {...label}
        defaultChecked
        color={`${dark === 'dark' ? 'secondary' : 'warning'}`}
      />
    </div>
  )
}
