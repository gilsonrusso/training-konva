import { Grid, styled, type GridProps } from '@mui/material'

export const GridStyled = styled(Grid)<GridProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  // backgroundColor: theme.palette.customGrid?.main,
}))
