import { PaletteColor, PaletteColorOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    customGrid?: PaletteColor
  }
  interface PaletteOptions {
    customGrid?: PaletteColorOptions
  }
}
