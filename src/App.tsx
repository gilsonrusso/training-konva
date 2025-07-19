import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AppsIcon from '@mui/icons-material/Apps'
import MenuIcon from '@mui/icons-material/Menu'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import {
  AppBar,
  Box,
  Button,
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

import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
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

// const ListItemTextStyled = styled(ListItemText)<ListItemTextProps>(({ theme }) => ({
//   '& .MuiListItemText-primary': {
//     fontSize: '0.875rem',
//     fontWeight: 500,
//     color: theme.palette.text.primary,
//   },
// }))

// const ListItemStyled = styled(ListItem)(({ theme }) => ({
//   '&.MuiListItem-root': {
//     padding: theme.spacing(0),
//     '&:hover': {
//       backgroundColor: theme.palette.action.hover,
//     },
//   },
// }))

// const ICONS_LIST = [
//   { icon: <HomeIcon />, text: 'Home' },
//   { icon: <WhatShotIcon />, text: 'Trending' },
//   { icon: <SubscriptionsIcon />, text: 'Subscriptions' },
// ]
// const ICONS_LIST_2 = [
//   { icon: <VideoLibrary />, text: 'Library' },
//   { icon: <History />, text: 'History' },
// ]

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

  console.log('::::::users', users)

  return (
    <BoxStyled>
      <AppBarStyled>
        <Toolbar>
          <IconButton size="large" edge="start" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <img
            src={theme.palette.mode === 'dark' ? '/images/branco.png' : '/images/preto.png'}
            alt="logo"
            className="h-7"
          />
          <div className="flex-1" />
          <IconButtonStyled size="large" edge="start" aria-label="menu" sx={{ mr: 2 }}>
            <VideoCallIcon />
          </IconButtonStyled>
          <IconButtonStyled size="large" edge="start" aria-label="menu" sx={{ mr: 2 }}>
            <AppsIcon />
          </IconButtonStyled>
          <IconButtonStyled size="large" edge="start" aria-label="menu" sx={{ mr: 2 }}>
            <MoreVertIcon />
          </IconButtonStyled>
          <Button variant="outlined" color="secondary" startIcon={<AccountCircleIcon />}>
            Fazer Login
          </Button>
        </Toolbar>
      </AppBarStyled>
      <Toolbar />
      <Box display={'flex'}>
        {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Drawer
            sx={{
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <List>
              {ICONS_LIST.map(({ icon: Icon, text }) => (
                <ListItemStyled key={text} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>{Icon}</ListItemIcon>
                    <ListItemTextStyled primary={text} />
                  </ListItemButton>
                </ListItemStyled>
              ))}
            </List>
            <Divider />
            <List>
              {ICONS_LIST_2.map(({ icon: Icon, text }) => (
                <ListItemStyled key={text} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>{Icon}</ListItemIcon>
                    <ListItemTextStyled primary={text} />
                  </ListItemButton>
                </ListItemStyled>
              ))}
            </List>
            <Divider />
            <Box sx={{ padding: 4 }}>
              <Typography variant="body2">
                Faça login para curtir vídeos, comentar e se inscrever.
              </Typography>
              <Button variant="outlined" color="secondary" startIcon={<AccountCircleIcon />}>
                Fazer Login
              </Button>
            </Box>
            <Divider />
            <List
              component="nav"
              aria-labelledby="nested-list-subheader"
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  O Melhor do youtube
                </ListSubheader>
              }
            >
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Música'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Esportes'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Jogos'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Filmes'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Notícias'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Ao vivo'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Destaques'} />
              </ListItemStyled>
              <ListItemStyled>
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={'Videos 360'} />
              </ListItemStyled>
            </List>
          </Drawer>
        </Box> */}
        <Box sx={{ padding: 4, width: '100%' }}>
          <Typography color="textPrimary" variant="h5" sx={{ fontWeight: 800 }}>
            Recomendados
          </Typography>
          <Outlet />
        </Box>
      </Box>
    </BoxStyled>
  )
}

export default App
