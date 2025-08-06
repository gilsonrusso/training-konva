import { theme } from '@/layout/theme'
import { queryClient } from '@/lib/tanstack'
import { ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'
import { AuthProvider } from './AuthContext'
import { SnackbarProvider } from './SnackBarContext'
import { UnsavedChangesProvider } from './UnsavedChangesContext'

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme} noSsr>
      <AuthProvider>
        <UnsavedChangesProvider>
          <SnackbarProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </SnackbarProvider>
        </UnsavedChangesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
