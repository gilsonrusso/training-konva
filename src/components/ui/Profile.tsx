import AccountCircle from '@mui/icons-material/AccountCircle'
import { Box, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const menuId = 'primary-search-account-menu'

export const Profile = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { userEmail, logout } = useAuth()
  const navigate = useNavigate()

  const isMenuOpen = Boolean(anchorEl)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/login')
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem disabled>
        <Typography variant="subtitle2">{userEmail}</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>Sair</MenuItem>
    </Menu>
  )

  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
      </Box>
      {renderMenu}
    </>
  )
}
