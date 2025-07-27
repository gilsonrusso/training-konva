import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useEffect, useState } from 'react'

const Loading = () => {
  // const theme = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleShowLoading = () => setIsLoading(true)
    const handleHideLoading = () => setIsLoading(false)

    window.addEventListener('loading:show', handleShowLoading)
    window.addEventListener('loading:hide', handleHideLoading)

    return () => {
      window.removeEventListener('loading:show', handleShowLoading)
      window.removeEventListener('loading:hide', handleHideLoading)
    }
  }, [])

  if (!isLoading) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={50} color="primary" />
    </Box>
  )
}

export default Loading
