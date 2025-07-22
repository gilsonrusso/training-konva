import { createTheme } from '@mui/material'
import { blue, purple } from '@mui/material/colors'

export const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: '#F5F5F5',
          paper: '#FFFFFF',
        },
        customGrid: {
          main: '#E0E0E0',
        },
        primary: {
          main: blue[500], // Azul escuro vibrante para botões, etc.
          light: blue[300], // Usado para hover/active estados em alguns componentes
          dark: blue[700], // Usado para hover/active estados em alguns componentes
          contrastText: '#fff', // Texto branco sobre o azul primário
        },
        secondary: {
          main: purple[500], // Um rosa forte para acentos
          light: purple[300],
          dark: purple[300],
          contrastText: '#fff',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#303030',
          paper: '#424242',
        },
        customGrid: {
          main: '#616161',
        },
        primary: {
          main: blue[200], // Um azul claro e suave para brilhar em fundos escuros
          light: blue[100],
          dark: blue[500],
          contrastText: '#000', // Texto preto sobre o azul primário claro (para contraste)
        },
        secondary: {
          main: purple[200], // Um rosa mais claro e suave
          light: purple[100],
          dark: purple[300],
          contrastText: '#000',
        },
      },
    },
  },
})
