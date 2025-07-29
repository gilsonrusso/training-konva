import { useFetch } from '@/hooks/useFetch'
import { useMutation } from '@/hooks/useMutation'
import { AnalysisService } from '@/services/AnalysisServices'
import { RequirementsServices } from '@/services/RequirementsService'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AnalysisListUseState } from '../types/analysis.types' // Ajuste o caminho conforme sua estrutura
import { useSnackbar } from './SnackBarContext' // Assumindo que você já tem um SnackbarContext

// -----------------------------------------------------------
// 1. Tipos para o Contexto
// -----------------------------------------------------------

interface AnalysisContextType {
  currentAnalysisId: string | null // para usar para busca o relatorio
  availableRequirementsNames: string[]
  createdLists: AnalysisListUseState[]
  selectedLists: AnalysisListUseState[]

  // Estados de Carregamento para a UI reagir
  isLoadingRequirements: boolean
  isLoadingLists: boolean
  isCreatingList: boolean
  isEditingList: boolean
  isDeletingList: boolean
  // Funções que serão expostas pelo contexto
  // Funções para manipulação de requisitos na PrimarySelectionList (se necessário globalmente, ou mantidas no AppStepOne)
  // checkedRequirementNames: string[]; // Se você decidir mover esse estado para cá
  // toggleRequirement: (value: string) => void;
  // toggleAllRequirements: (itemsToToggle: readonly string[]) => void;
  setCurrentAnalysisId: (analysisId: string | null) => void // para usar no step 02 depois de submeter para analise
  onCreateList: (name: string, requirementNames: string[]) => Promise<void>
  onDeleteList: (listId: string) => Promise<void>
  onEditList: (listToSave: AnalysisListUseState) => Promise<void>
  onSelectingList: (listId: string) => void // Para uso no AppStepper
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
  // Estados que são puramente da UI e não vêm de uma API
  // const [createdLists, setCreatedLists] = useState<AnalysisListUseState[]>([])
  const [selectedLists, setSelectedLists] = useState<AnalysisListUseState[]>([])
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  const { showSnackbar } = useSnackbar()

  // 1. Crie uma versão estável da função para buscar as listas
  const getListsApiCall = useCallback((signal: AbortSignal) => {
    return AnalysisService.getLists(signal)
  }, []) // O array de dependências está vazio porque AnalysisService.getLists não muda

  // 2. Crie uma versão estável da função para buscar os requisitos
  const getRequirementsApiCall = useCallback((signal: AbortSignal) => {
    return RequirementsServices.getAvailableRequirements(signal)
  }, []) // Array de dependências também vazio

  // 1. Buscando Requisitos Disponíveis com useFetch
  const { data: availableRequirementsData, loading: isLoadingRequirements } = useFetch(
    getRequirementsApiCall // Passe a função memorizada
  )
  const availableRequirementsNames = availableRequirementsData ?? []

  // 2. Buscando as Listas Criadas com useFetch
  const {
    data: listsData,
    loading: isLoadingLists,
    refetch: onGetLists,
  } = useFetch(
    getListsApiCall // Passe a função memorizada
  )

  // Usamos useMemo para transformar os dados da API apenas quando eles mudam
  const createdLists = useMemo(() => {
    if (!listsData) return []
    return listsData.map(({ id, name, requirements }) => ({
      id,
      name,
      requirements: requirements.map((el) => ({
        id_: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: el,
      })),
    }))
  }, [listsData])

  // --- SUBSTITUIÇÃO DA LÓGICA DE MUTAÇÃO ---

  // 3. Criando uma nova lista com useMutation
  const { mutate: createListMutation, loading: isCreatingList } = useMutation(
    AnalysisService.createList
  )
  // 4. Editando uma lista com useMutation
  const { mutate: editListMutation, loading: isEditingList } = useMutation(AnalysisService.editList)

  // 5. Deletando uma lista com useMutation
  // Assumindo que você tenha `AnalysisService.deleteList(id)` no seu serviço
  const { mutate: deleteListMutation, loading: isDeletingList } = useMutation(
    AnalysisService.deleteList
  )

  // --- FUNÇÕES EXPOSTAS PELO CONTEXTO ---

  const onCreateList = async (name: string, requirementNames: string[]) => {
    try {
      await createListMutation({ name, requirements: requirementNames })
      showSnackbar('Lista criada com sucesso!', 'success')
      onGetLists() // Re-busca a lista de listas para atualizar a UI
    } catch (error: unknown) {
      showSnackbar('Erro ao criar a lista.', 'error')
      console.error('Erro ao criar lista:', error)
    }
  }

  const onEditList = async (listToSave: AnalysisListUseState) => {
    try {
      const payload = {
        id: listToSave.id,
        name: listToSave.name,
        requirements: listToSave.requirements.map((item) => item.name),
      }
      await editListMutation(payload)
      showSnackbar('Lista editada com sucesso!', 'success')
      onGetLists() // Re-busca para garantir a consistência
    } catch (error: unknown) {
      showSnackbar('Erro ao editar a lista.', 'error')
      console.error('Erro ao editar lista:', error)
    }
  }

  const onDeleteList = async (listId: string) => {
    try {
      await deleteListMutation({ id: listId })
      // Remove da lista de selecionados localmente (otimização)
      setSelectedLists((prev) => prev.filter((item) => item.id !== listId))
      showSnackbar('Lista excluída com sucesso!', 'info')
      onGetLists() // Re-busca para garantir a consistência
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir a lista.', 'error')
      console.error('Erro ao excluir lista:', error)
    }
  }

  // Função que não envolve API (lógica de UI)
  const onSelectingList = (listId: string) => {
    const list = createdLists.find((l) => l.id === listId)
    if (!list) return

    const itemAlreadySelected = selectedLists.some((l) => l.id === listId)
    if (itemAlreadySelected) {
      setSelectedLists((prev) => prev.filter((item) => item.id !== listId))
    } else {
      setSelectedLists((prev) => [...prev, list])
    }
  }

  // Chamada inicial para buscar os dados quando o provider montar
  useEffect(() => {
    onGetLists()
  }, []) // O array vazio garante que isso rode apenas uma vez

  // O valor que será provido pelo contexto
  const contextValue: AnalysisContextType = {
    availableRequirementsNames,
    createdLists,
    selectedLists,
    currentAnalysisId,
    isLoadingRequirements,
    isLoadingLists,
    isCreatingList,
    isEditingList,
    isDeletingList,
    setCurrentAnalysisId,
    onGetLists,
    onCreateList,
    onDeleteList,
    onEditList,
    onSelectingList,
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
