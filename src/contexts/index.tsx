import { theme } from '@/layout/theme'
import { queryClient } from '@/lib/tanstack'
import { ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'
import { AnalysisProvider } from './AnalysisContext'
import { SnackbarProvider } from './SnackBarContext'
import { UnsavedChangesProvider } from './UnsavedChangesContext'

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme} noSsr>
      <UnsavedChangesProvider>
        <SnackbarProvider>
          <QueryClientProvider client={queryClient}>
            <AnalysisProvider>{children}</AnalysisProvider>
          </QueryClientProvider>
        </SnackbarProvider>
      </UnsavedChangesProvider>
    </ThemeProvider>
  )
}
