import { styled } from '@mui/material'
import { NavLink } from 'react-router'

export const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,

  '&.active': {
    color: theme.palette.secondary.main,
  },
}))
