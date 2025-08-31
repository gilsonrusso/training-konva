import { Box, Toolbar, type BoxProps } from '@mui/material'
import { styled } from '@mui/material/styles'

import { Outlet } from 'react-router'
import { Navbar } from './components/ui/Navbar'

const BoxStyled = styled(Box)<BoxProps>(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}))

function App() {
  return (
    <BoxStyled>
      <Toolbar />
      <Navbar />
      <Box display={'flex'}>
        <Box sx={{ width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </BoxStyled>
  )
}

export default App
