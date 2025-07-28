import { AnalysisService } from '@/services/AnalysisServices'
import { RequirementsServices } from '@/services/RequirementsService'
import { createContext, useCallback, useContext, useState } from 'react'
import type { AnalysisListUseState, RequirementItem } from '../types/analysis' // Ajuste o caminho conforme sua estrutura
import { useSnackbar } from './SnackBarContext' // Assumindo que você já tem um SnackbarContext

// -----------------------------------------------------------
// 1. Tipos para o Contexto
// -----------------------------------------------------------

interface AnalysisContextType {
  currentAnalysisId: string | null // para usar para busca o relatorio
  availableRequirementsNames: string[]
  createdLists: AnalysisListUseState[]
  selectedLists: AnalysisListUseState[]
  // Funções que serão expostas pelo contexto
  // Funções para manipulação de requisitos na PrimarySelectionList (se necessário globalmente, ou mantidas no AppStepOne)
  // checkedRequirementNames: string[]; // Se você decidir mover esse estado para cá
  // toggleRequirement: (value: string) => void;
  // toggleAllRequirements: (itemsToToggle: readonly string[]) => void;
  setCurrentAnalysisId: (analysisId: string | null) => void // para usar no step 02 depois de submeter para analise
  onCreateList: (name: string, requirementNames: string[]) => void
  onDeleteList: (listId: string) => void
  oneEditList: (listToSave: AnalysisListUseState) => void
  onSelectingList: (listId: string) => void // Para uso no AppStepper
  onGetAvailableRequirements: () => void
  onGetLists: () => void
}

// -----------------------------------------------------------
// 2. Criação do Contexto
// -----------------------------------------------------------

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

// -----------------------------------------------------------
// 3. Provedor do Contexto (RequirementProvider)
// -----------------------------------------------------------

interface RequirementProviderProps {
  children: React.ReactNode
}

export const AnalysisProvider = ({ children }: RequirementProviderProps) => {
  const [availableRequirementsNames, setAvailableRequirementsNames] = useState<string[]>([])
  const [createdLists, setCreatedLists] = useState<AnalysisListUseState[]>([])
  const [selectedLists, setSelectedLists] = useState<AnalysisListUseState[]>([])

  // Agora apenas o ID da análise é mantido aqui
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  const { showSnackbar } = useSnackbar()

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(`Error requirements list : ${error.message}`)
      } else if (typeof error === 'string') {
        showSnackbar(`Error requirements list : ${error}`)
      } else {
        showSnackbar('Error requirements list: An unknown error occurred.')
      }
      showSnackbar('Error generics')
    },
    [showSnackbar]
  )

  const onGetAvailableRequirements = async () => {
    try {
      const response = await RequirementsServices.getAvailableRequirements()
      setAvailableRequirementsNames(response)
      showSnackbar('Available requirements list loaded.')
    } catch (error: unknown) {
      handleError(error)
    }
  }

  const onGetLists = useCallback(async () => {
    try {
      const response = await AnalysisService.getLists()

      const list: AnalysisListUseState[] = response.map(({ id, name, requirements }) => {
        return {
          id,
          name,
          requirements: requirements.map((el) => {
            return {
              id_: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: el,
            }
          }),
        }
      })

      setCreatedLists(list)
      showSnackbar('Available requirements list loaded.')
    } catch (error: unknown) {
      handleError(error)
    }
  }, [handleError, showSnackbar])

  const onCreateList = useCallback(
    async (name: string, requirementNames: string[]) => {
      try {
        const response = await AnalysisService.createList({
          name,
          requirements: requirementNames,
        })

        const newRequirements: RequirementItem[] = response.requirements.map((res) => ({
          id_: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: res,
        }))

        const newList: AnalysisListUseState = {
          id: response.id,
          name,
          requirements: newRequirements,
        }
        setCreatedLists((prev) => [...prev, newList])
        showSnackbar('Lista criada com sucesso!', 'success')

        console.log(':::::respnse createNewList', { response })
      } catch (error) {
        handleError(error)
      }
    },
    [handleError, showSnackbar]
  )

  const onDeleteList = useCallback(
    (listId: string) => {
      setCreatedLists((prev) => prev.filter((list) => list.id !== listId))
      // Se a lista deletada for a selecionada no stepper, deseleciona
      setSelectedLists((prev) => [...prev.filter((item) => item.id !== listId)])
      showSnackbar('Lista excluída com sucesso!', 'info')
    },
    [showSnackbar, setCreatedLists, setSelectedLists]
  )

  const oneEditList = useCallback(
    async (listToSave: AnalysisListUseState) => {
      try {
        const response = await AnalysisService.editList({
          id: listToSave.id,
          name: listToSave.name,
          requirements: listToSave.requirements.map((item) => item.name),
        })

        onGetLists()
        showSnackbar('Lista editar com sucesso!', 'success')

        console.log(':::::list edit', { response })
      } catch (error) {
        handleError(error)
      }

      setCreatedLists((prev) => prev.map((list) => (list.id === listToSave.id ? listToSave : list)))
      showSnackbar('Lista salva com sucesso!', 'success')
    },
    [handleError, onGetLists, showSnackbar]
  )

  const onSelectingList = useCallback(
    (listId: string) => {
      const list = createdLists.find((l) => l.id === listId)

      if (!list) return

      const itemAlreadySelected = selectedLists.find((l) => l.id === listId)

      if (itemAlreadySelected) {
        setSelectedLists((prev) => [...prev.filter((item) => item.id !== listId)])
        return
      }

      setSelectedLists((prev) => [...prev, list])
    },
    [createdLists, selectedLists, setSelectedLists]
  )

  // O valor que será provido pelo contexto
  const contextValue: AnalysisContextType = {
    currentAnalysisId,
    availableRequirementsNames,
    createdLists,
    selectedLists,
    setCurrentAnalysisId,
    onGetLists,
    onCreateList,
    onDeleteList,
    oneEditList,
    onSelectingList,
    onGetAvailableRequirements,
  }

  return <AnalysisContext.Provider value={contextValue}>{children}</AnalysisContext.Provider>
}

// -----------------------------------------------------------
// 4. Hook Personalizado para Consumir o Contexto
// -----------------------------------------------------------

export const useAnalysis = () => {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within a AnalysisProvider')
  }
  return context
}
