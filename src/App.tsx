import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Grid,
  IconButton,
  // ListItem,
  // ListItemText,
  Toolbar,
  Typography,
  type AppBarProps,
  type BoxProps,
  type IconButtonProps,
} from '@mui/material'
import { styled } from '@mui/material/styles'

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import HomeIcon from '@mui/icons-material/Home'
import TableViewIcon from '@mui/icons-material/TableView'
import { Outlet } from 'react-router'
import { StyledNavLink } from './components/commons/muiStyled/NavLinkStyled'
import BasicSwitches from './layout/commons/DarkMode'
import { theme } from './layout/theme'

const BoxStyled = styled(Box)<BoxProps>(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}))
const IconButtonStyled = styled(IconButton)<IconButtonProps>(() => ({
  // paddingRight:theme.spacing(5),
}))

const AppBarStyled = styled(AppBar)<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}))

function App() {
  return (
    <BoxStyled>
      <AppBarStyled>
        <Toolbar>
          <Grid container sx={{ display: 'flex', width: '100%' }}>
            <Grid
              flexGrow={1}
              sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            >
              <IconButton size="large" edge="start" aria-label="menu" sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <img
                src={theme.palette.mode === 'dark' ? '/images/logo.png' : '/images/logo.png'}
                alt="logo"
                className="h-7"
              />
              <Typography sx={{ marginLeft: '5px' }}>Sasy</Typography>
            </Grid>
            <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
              <StyledNavLink
                to={{
                  pathname: '/',
                }}
                className={({ isActive }) => `${isActive ? 'active' : ''}`}
              >
                <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon />
                  <Typography paddingTop={1}>Analysis</Typography>
                </Box>
              </StyledNavLink>
              <StyledNavLink
                to={{
                  pathname: '/new-requirements',
                }}
                className={({ isActive }) => `${isActive ? 'active' : ''}`}
              >
                <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessCenterIcon />
                  <Typography paddingTop={1}>New Requirements</Typography>
                </Box>
              </StyledNavLink>
              <StyledNavLink
                to={{
                  pathname: '/training-history',
                }}
                className={({ isActive }) => `${isActive ? 'active' : ''}`}
              >
                <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <TableViewIcon />
                  <Typography paddingTop={1}>Training History</Typography>
                </Box>
              </StyledNavLink>
            </Grid>
            <Grid
              flexGrow={1}
              sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
            >
              <IconButtonStyled>
                <AccountCircleIcon />
              </IconButtonStyled>
              <BasicSwitches />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBarStyled>
      <Toolbar />
      <Box display={'flex'}>
        <Box sx={{ width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </BoxStyled>
  )
}

export default App
