import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthState {
  isAuthenticated: boolean
  userEmail: string | null
  token: string | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: null,
    token: null,
    isLoading: true, // Começa como true para verificar o localStorage
  })

  // Efeito para carregar o estado do localStorage ao iniciar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedEmail = localStorage.getItem('userEmail')

    if (storedToken && storedEmail) {
      setAuthState({
        isAuthenticated: true,
        userEmail: storedEmail,
        token: storedToken,
        isLoading: false,
      })
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = (email: string, token: string) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userEmail', email)
    setAuthState({
      isAuthenticated: true,
      userEmail: email,
      token: token,
      isLoading: false,
    })
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    setAuthState({
      isAuthenticated: false,
      userEmail: null,
      token: null,
      isLoading: false,
    })
  }

  const value = {
    ...authState,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 5. Crie um Hook personalizado para consumir o contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
