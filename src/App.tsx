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
import { styled, useTheme } from '@mui/material/styles'

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import HomeIcon from '@mui/icons-material/Home'
import TableViewIcon from '@mui/icons-material/TableView'
import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router'
import { UserService } from './services/userServices'
import type { User } from './types/user.types'

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
  const theme = useTheme()

  const [users, setUsers] = useState<User[]>([])
  const controller = new AbortController()

  async function fetchUsers() {
    try {
      const response = await UserService.getAll(controller.signal)
      setUsers(response)
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'CanceledError') {
        console.warn('Requisição cancelada')
      } else if (error instanceof Error) {
        console.error('Erro geral:', error.message)
      } else {
        console.error('Erro desconhecido:', error)
      }
    }
  }

  useEffect(() => {
    fetchUsers()

    return () => {
      controller.abort()
      // abortManager.abort('getAllUsers')
    }
  }, [])

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
            <Grid
              flexGrow={8}
              sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }}
            >
              <Link
                to={{
                  pathname: '/',
                }}
              >
                <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon />
                  <Typography paddingTop={1}>Home</Typography>
                </Box>
              </Link>
              <Link
                to={{
                  pathname: '/list',
                }}
              >
                <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <TableViewIcon />
                  <Typography paddingTop={1}>list</Typography>
                </Box>
              </Link>
              <Link
                to={{
                  pathname: '/training',
                }}
              >
                <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessCenterIcon />
                  <Typography paddingTop={1}>Training</Typography>
                </Box>
              </Link>
            </Grid>
            <Grid
              flexGrow={1}
              sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
            >
              <IconButtonStyled>
                <AccountCircleIcon />
              </IconButtonStyled>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBarStyled>
      <Toolbar />
      <Box display={'flex'}>
        <Box sx={{ padding: 4, width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </BoxStyled>
  )
}

export default App
