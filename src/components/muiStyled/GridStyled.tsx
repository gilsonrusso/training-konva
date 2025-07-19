import { Grid, styled, type GridProps } from '@mui/material'

export const GridStyled = styled(Grid)<GridProps>(({ theme }) => ({
  backgroundColor: theme.palette.grey[800],
}))
