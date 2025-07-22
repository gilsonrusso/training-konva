import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { ThemeProvider } from '@mui/material'
import { RouterProvider } from 'react-router'
import { SnackbarProvider } from './contexts/SnackBarContext.tsx'
import { theme } from './layout/theme.ts'
import { router } from './router.tsx'

// const theme = createTheme({
//   colorSchemes: {
//     dark: true,
//   },
//   palette: {
//     mode: 'light',
//     // primary: {
//     //   main: red[500],
//     // },
//     // secondary: {
//     //   main: blue[500],
//     // },
//     // background: {
//     //   default: '#232323',
//     //   paper: '#232323',
//     // },
//   },
//   components: {
//     MuiDrawer: {
//       styleOverrides: {
//         paper: {
//           width: 240,
//           borderRight: 'none',
//         },
//         root: {
//           width: 240,
//         },
//       },
//     },
//     MuiAppBar: {
//       styleOverrides: {
//         root: {
//           boxShadow: 'none',
//         },
//       },
//     },
//   },
// })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>
)
