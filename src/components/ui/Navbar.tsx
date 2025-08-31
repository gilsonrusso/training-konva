import BasicSwitches from '@/layout/commons/DarkMode'
import { theme } from '@/layout/theme'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu'
import TableViewIcon from '@mui/icons-material/TableView'
import { AppBar, Box, Grid, IconButton, Toolbar, Typography } from '@mui/material'
import { StyledNavLink } from '../commons/muiStyled/NavLinkStyled'
import { Profile } from './Profile'

export const Navbar = () => {
  return (
    <AppBar
      sx={() => ({
        zIndex: theme.zIndex.drawer + 1,
      })}
    >
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
            {/* <IconButton>
              <AccountCircleIcon />
            </IconButton> */}
            <BasicSwitches />
            <Profile />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}
