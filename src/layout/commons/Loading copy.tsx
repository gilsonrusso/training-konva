// src/components/Loading.jsx
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Loading = () => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${105}px)`,
      }}
    >
      <CircularProgress size={50} />
    </Box>
  )
}

export default Loading
