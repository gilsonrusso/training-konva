import { AnalysisService } from '@/services/AnalysisServices'
import { RequirementsServices } from '@/services/RequirementsService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AnalysisListResponse, AnalysisListUseState } from '../types/analysis.types'
import { useSnackbar } from './SnackBarContext'

interface AnalysisContextType {
  currentAnalysisId: string | null
  availableRequirementsNames: string[]
  createdLists: AnalysisListUseState[]
  selectedLists: AnalysisListUseState[]

  isLoadingRequirements: boolean
  isLoadingLists: boolean
  isCreatingList: boolean
  isEditingList: boolean
  isDeletingList: boolean

  setCurrentAnalysisId: (analysisId: string | null) => void
  onCreateList: (name: string, requirementNames: string[]) => Promise<void>
  onDeleteList: (listId: string) => Promise<void>
  onEditList: (listToSave: AnalysisListUseState) => Promise<void>
  onSelectingList: (listId: string) => void
  onGetLists: () => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

interface RequirementProviderProps {
  children: React.ReactNode
}

export const AnalysisProvider = ({ children }: RequirementProviderProps) => {
  const queryClient = useQueryClient()

  const [selectedLists, setSelectedLists] = useState<AnalysisListUseState[]>([])
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  const { showSnackbar } = useSnackbar()

  // --- BUSCA DE DADOS COM useQuery ---

  const { data: availableRequirementsData, isPending: isLoadingRequirements } = useQuery<
    string[],
    Error
  >({
    queryKey: ['requirements'],
    queryFn: ({ signal }) => RequirementsServices.getAvailableRequirements(signal),
  })

  // O 'data' de useQuery pode ser undefined durante o loading, então use '?? []'
  const availableRequirementsNames = availableRequirementsData ?? []

  const { data: listsData, isPending: isLoadingLists } = useQuery<AnalysisListResponse[], Error>({
    queryKey: ['lists'],
    queryFn: ({ signal }) => AnalysisService.getLists(signal),
  })

  // Transforme os dados brutos da lista para o formato de estado da UI (`AnalysisListUseState[]`)
  const createdLists = useMemo(() => {
    // 'listsData' é o array bruto de `AnalysisListResponse[]` retornado pelo TanStack Query.
    // Ele pode ser 'undefined' enquanto carregando, em erro, ou se a requisição ainda não ocorreu.
    if (!listsData) return []

    return listsData.map((item) => ({
      id: item.id,
      name: item.name,
      requirements: item.requirements.map((el) => ({
        id_: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID único para a UI
        name: el,
      })),
    }))
  }, [listsData])

  // --- MUTAÇÕES COM useMutation ---

  // 3. Criando uma nova lista
  const { mutateAsync: createListMutation, isPending: isCreatingList } = useMutation<
    AnalysisListResponse, // Tipo de retorno da mutação
    Error, // Tipo de erro
    { name: string; requirements: string[] } // Tipo do payload de entrada
  >({
    mutationFn: AnalysisService.createList, // <--- Sua função de serviço para criar lista
    onSuccess: () => {
      showSnackbar('Lista criada com sucesso!', 'success')
      // Invalide o cache da query 'lists' para forçar uma re-busca
      // Isso garantirá que a lista seja atualizada na UI.
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
    onError: (error: unknown) => {
      showSnackbar('Erro ao criar a lista.', 'error')
      console.error('Erro ao criar lista:', error)
    },
  })

  // 4. Editando uma lista
  const { mutateAsync: editListMutation, isPending: isEditingList } = useMutation<
    AnalysisListResponse, // Tipo de retorno
    Error,
    { id: string; name: string; requirements: string[] } // Tipo do payload
  >({
    mutationFn: AnalysisService.editList, // <--- Sua função de serviço para editar lista
    onSuccess: () => {
      showSnackbar('Lista editada com sucesso!', 'success')
      queryClient.invalidateQueries({ queryKey: ['lists'] }) // Invalida o cache
    },
    onError: (error: unknown) => {
      showSnackbar('Erro ao editar a lista.', 'error')
      console.error('Erro ao editar lista:', error)
    },
  })

  // 5. Deletando uma lista
  const { mutateAsync: deleteListMutation, isPending: isDeletingList } = useMutation<
    void, // Tipo de retorno (void, pois delete geralmente não retorna corpo)
    Error,
    { id: string } // Tipo do payload
  >({
    mutationFn: AnalysisService.deleteList, // <--- Sua função de serviço para deletar lista
    onSuccess: (_, variables) => {
      // Opcional: atualização otimista (removendo da lista de selecionados localmente)
      setSelectedLists((prev) => prev.filter((item) => item.id !== variables.id))
      showSnackbar('Lista excluída com sucesso!', 'info')
      queryClient.invalidateQueries({ queryKey: ['lists'] }) // Invalida o cache
    },
    onError: (error: unknown) => {
      showSnackbar('Erro ao excluir a lista.', 'error')
      console.error('Erro ao excluir lista:', error)
    },
  })

  // --- FUNÇÕES EXPOSTAS PELO CONTEXTO ---

  // Agora as funções chamam `mutateAsync` e não precisam mais de try/catch aqui,
  // pois o tratamento de erro está no `useMutation`
  const onCreateList = async (name: string, requirementNames: string[]) => {
    await createListMutation({ name, requirements: requirementNames })
  }

  const onEditList = async (listToSave: AnalysisListUseState) => {
    const payload = {
      id: listToSave.id,
      name: listToSave.name,
      requirements: listToSave.requirements.map((item) => item.name),
    }
    await editListMutation(payload)
  }

  const onDeleteList = async (listId: string) => {
    await deleteListMutation({ id: listId })
  }

  // Função para re-buscar as listas (apenas invoca a invalidação do cache)
  const onGetLists = useCallback(() => {
    // Força o TanStack Query a marcar a query 'lists' como stale e re-buscar
    queryClient.invalidateQueries({ queryKey: ['lists'] })
  }, [queryClient]) // Depende do queryClient

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
// 4. Hook Personalizado para Consumir o Contexto (inalterado)
// -----------------------------------------------------------

export const useAnalysis = () => {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within a AnalysisProvider')
  }
  return context
}
