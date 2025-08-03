import { Box } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputBase, { type InputBaseProps } from '@mui/material/InputBase'
import type { ReactElement } from 'react'

type AppInputWihtIconProps = InputBaseProps & {
  icon: ReactElement
  handleButtonClick: () => void
}

export const AppInputWihtIcon = ({
  icon: Icon,
  handleButtonClick,
  disabled,
  ...rest
}: AppInputWihtIconProps) => {
  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: '0px',
        padding: '4px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#323232',
          paddingLeft: '8px',
          paddingRight: '8px',
        }}
      >
        <InputBase
          {...rest}
          sx={{
            ml: 1,
            flex: 1,
          }}
          placeholder="Add Requirement Name"
          inputProps={{ 'aria-label': 'add requirement' }}
        />
        <IconButton
          disabled={disabled}
          onClick={handleButtonClick}
          type="button"
          sx={{ p: '10px' }}
          aria-label="class"
        >
          {Icon}
        </IconButton>
      </Box>
    </Box>
  )
}
