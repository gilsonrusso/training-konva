import { Alert } from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'

// Definição dos tipos de severidade para o Alert
export type SnackbarSeverity = 'error' | 'warning' | 'info' | 'success'
interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity, backgroundColor?: string) => void
}

// 2. Criação do Context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

// 3. Interface para o estado do Snackbar
interface SnackbarState {
  open: boolean
  message: string
  severity: SnackbarSeverity
  backgroundColor?: string
}

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info', // Padrão
    backgroundColor: undefined,
  })

  const showSnackbar = useCallback(
    (
      message: string,
      severity: SnackbarSeverity = 'info', // Padrão 'info'
      backgroundColor?: string
    ) => {
      setSnackbarState({
        open: true,
        message,
        severity,
        backgroundColor,
      })
    },
    []
  )

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarState((prev) => ({ ...prev, open: false }))
  }

  const alertSx = useMemo(
    () => ({
      width: '100%',
      backgroundColor: snackbarState.backgroundColor, // Aplica a cor de fundo customizada
      // Você pode querer ajustar a cor do texto para contraste se a cor de fundo for escura
      // color: snackbarState.backgroundColor ? 'white' : undefined,
    }),
    [snackbarState.backgroundColor]
  )

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000} // Duração em milissegundos
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Posição
        sx={{ zIndex: (theme) => theme.zIndex?.snackbar || 1400 }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarState.severity}
          variant="filled"
          sx={alertSx}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
