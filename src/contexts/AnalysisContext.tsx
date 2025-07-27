import { YoloService } from '@/services/yoloUploadService'
import React, { createContext, useCallback, useContext, useState } from 'react'
import type { CreatedListItem, FetchedCreatedList } from '../types/requirements' // Ajuste o caminho conforme sua estrutura
import { useSnackbar } from './SnackBarContext' // Assumindo que você já tem um SnackbarContext

// -----------------------------------------------------------
// 1. Tipos para o Contexto
// -----------------------------------------------------------

interface AnalysisContextType {
  currentAnalysisId: string | null // para usar para busca o relatorio
  availableRequirementsNames: string[]
  createdLists: FetchedCreatedList[]
  selectedListForAppStepper: FetchedCreatedList | null
  // Funções que serão expostas pelo contexto
  setCurrentAnalysisId: (analysisId: string | null) => void // para usar no step 02 depois de submeter para analise
  createNewList: (name: string, requirementNames: string[]) => void
  deleteList: (listId: string) => void
  saveListEdits: (listToSave: FetchedCreatedList) => void
  selectListForAppStepper: (listId: string | null) => void // Para uso no AppStepper
  // Funções para manipulação de requisitos na PrimarySelectionList (se necessário globalmente, ou mantidas no AppStepOne)
  // checkedRequirementNames: string[]; // Se você decidir mover esse estado para cá
  // toggleRequirement: (value: string) => void;
  // toggleAllRequirements: (itemsToToggle: readonly string[]) => void;
  getAvailableRequirementsNames: () => void
  getListAvailableRequirementsList: () => void
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
  const [createdLists, setCreatedLists] = useState<FetchedCreatedList[]>([])
  const [selectedListForAppStepper, setSelectedListForAppStepper] =
    useState<FetchedCreatedList | null>(null)

  // Agora apenas o ID da análise é mantido aqui
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  const { showSnackbar } = useSnackbar()

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      showSnackbar(`Error requirements list : ${error.message}`)
    } else if (typeof error === 'string') {
      showSnackbar(`Error requirements list : ${error}`)
    } else {
      showSnackbar('Error requirements list: An unknown error occurred.')
    }
    showSnackbar('Error generics')
  }

  const getAvailableRequirementsNames = async () => {
    try {
      const response = await YoloService.getAvailableRequirements()
      setAvailableRequirementsNames(response)
      showSnackbar('Available requirements list loaded.')
    } catch (error: unknown) {
      handleError(error)
    }
  }

  const getListAvailableRequirementsList = async () => {
    try {
      const response = await YoloService.getCreatedLists()
      setCreatedLists(response)
      showSnackbar('Available requirements list loaded.')
    } catch (error: unknown) {
      handleError(error)
    }
  }

  // Funções de manipulação de listas
  const createNewList = useCallback(
    (name: string, requirementNames: string[]) => {
      const newId = `list-${Date.now()}`
      const newRequirements: CreatedListItem[] = requirementNames.map((reqName) => ({
        id_: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: reqName,
      }))
      const newList: FetchedCreatedList = {
        id: newId,
        name,
        requirements: newRequirements,
      }
      setCreatedLists((prev) => [...prev, newList])
      showSnackbar('Lista criada com sucesso!', 'success')
    },
    [showSnackbar]
  )

  const deleteList = useCallback(
    (listId: string) => {
      setCreatedLists((prev) => prev.filter((list) => list.id !== listId))
      // Se a lista deletada for a selecionada no stepper, deseleciona
      if (selectedListForAppStepper?.id === listId) {
        setSelectedListForAppStepper(null)
      }
      showSnackbar('Lista excluída com sucesso!', 'info')
    },
    [selectedListForAppStepper, showSnackbar]
  )

  const saveListEdits = useCallback(
    (listToSave: FetchedCreatedList) => {
      setCreatedLists((prev) => prev.map((list) => (list.id === listToSave.id ? listToSave : list)))
      showSnackbar('Lista salva com sucesso!', 'success')
    },
    [showSnackbar]
  )

  const selectListForAppStepper = useCallback(
    (listId: string | null) => {
      if (listId === null) {
        setSelectedListForAppStepper(null)
        return
      }
      const list = createdLists.find((l) => l.id === listId)
      setSelectedListForAppStepper(list || null)
    },
    [createdLists]
  )

  // O valor que será provido pelo contexto
  const contextValue: AnalysisContextType = {
    currentAnalysisId,
    availableRequirementsNames,
    createdLists,
    selectedListForAppStepper,
    setCurrentAnalysisId,
    createNewList,
    deleteList,
    saveListEdits,
    selectListForAppStepper,
    getAvailableRequirementsNames,
    getListAvailableRequirementsList,
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
