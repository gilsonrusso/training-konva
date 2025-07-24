import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

// 1. Definição do tipo para o valor do Contexto
interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (isDirty: boolean) => void
  markAsDirty: () => void // Função conveniente para marcar como sujo
  markAsClean: () => void // Função conveniente para marcar como limpo
}

// 2. Criação do Contexto
const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined)

// 3. Componente Provedor do Contexto
interface UnsavedChangesProviderProps {
  children: ReactNode
}

export const UnsavedChangesProvider = ({ children }: UnsavedChangesProviderProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)

  // Funções de conveniência
  const markAsDirty = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  const markAsClean = useCallback(() => {
    setHasUnsavedChanges(false)
  }, [])

  // Efeito para adicionar e remover o listener 'beforeunload'
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Padrão para navegadores modernos
        event.preventDefault()
        event.returnValue = '' // Exibe o diálogo de confirmação padrão do navegador

        // Para navegadores mais antigos (embora a mensagem personalizada seja frequentemente ignorada hoje)
        return 'Você tem dados não salvos. Tem certeza que deseja sair?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Função de limpeza para remover o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges]) // Depende do estado hasUnsavedChanges

  const contextValue = React.useMemo(
    () => ({
      hasUnsavedChanges,
      setHasUnsavedChanges,
      markAsDirty,
      markAsClean,
    }),
    [hasUnsavedChanges, setHasUnsavedChanges, markAsDirty, markAsClean]
  )

  return (
    <UnsavedChangesContext.Provider value={contextValue}>{children}</UnsavedChangesContext.Provider>
  )
}

// 4. Hook personalizado para consumir o Contexto
export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext)
  if (context === undefined) {
    throw new Error('useUnsavedChanges deve ser usado dentro de um UnsavedChangesProvider')
  }
  return context
}
