import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

type SnackbarContextType = {
  showMessage: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const showMessage = useCallback((msg: string) => {
    setMessage(msg)
    setOpen(true)
  }, [])

  const handleClose = (_: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message={message}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar deve ser usado dentro do SnackbarProvider')
  }
  return context
}
