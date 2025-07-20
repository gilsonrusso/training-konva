import IconButton from '@mui/material/IconButton'
import InputBase, { type InputBaseProps } from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import type { ReactElement } from 'react'

type AppInputWihtIconProps = InputBaseProps & {
  icon: ReactElement
  handleButtonClick: () => void
}

export const AppInputWihtIcon = ({
  icon: Icon,
  handleButtonClick,
  ...rest
}: AppInputWihtIconProps) => {
  return (
    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
      <InputBase
        {...rest}
        sx={{ ml: 1, flex: 1 }}
        placeholder="Add Class"
        inputProps={{ 'aria-label': 'add class' }}
      />
      <IconButton onClick={handleButtonClick} type="button" sx={{ p: '10px' }} aria-label="class">
        {Icon}
      </IconButton>
    </Paper>
  )
}
