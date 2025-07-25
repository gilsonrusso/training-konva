import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { ThemeProvider } from '@mui/material'
import { RouterProvider } from 'react-router'
import Loading from './components/layout/Loading.tsx'
import { SnackbarProvider } from './contexts/SnackBarContext.tsx'
import { UnsavedChangesProvider } from './contexts/UnsavedChangesContext.tsx'
import { theme } from './layout/theme.ts'
import { router } from './router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <UnsavedChangesProvider>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
        <Loading />
      </UnsavedChangesProvider>
    </ThemeProvider>
  </StrictMode>
)
