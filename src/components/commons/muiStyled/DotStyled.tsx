import { Box, styled } from '@mui/material'

export const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[400],
  margin: '0 4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
}))
