// src/contexts/RequirementsContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { FetchedCreatedList } from '../types/requirements'
import { intersection, not, union } from '../utils/commons'

interface CreateListPayload {
  name: string
  requirements: string[]
}

// Definição do tipo para o valor do contexto
interface RequirementsContextType {
  availableRequirementsNames: string[]
  checkedRequirementNames: readonly string[]
  createdLists: FetchedCreatedList[]
  newListName: string
  errorMessage: string | null
  // Novo estado para a lista selecionada para análise
  selectedListForAnalysis: FetchedCreatedList | null
  setNewListName: (name: string) => void
  setErrorMessage: (message: string | null) => void
  handleToggle: (value: string) => () => void
  handleToggleAll: (itemsToToggle: readonly string[]) => () => void
  handleCreateNewList: () => Promise<void>
  handleDeleteList: (listId: string) => Promise<void>
  handleSaveListEdits: (listToSave: FetchedCreatedList) => Promise<void>
  handleSelectCreatedList: (listId: string) => void
  // A função para o stepper selecionar a lista
  handleSetSelectedListForAnalysis: (list: FetchedCreatedList | null) => void
}

const RequirementsContext = createContext<RequirementsContextType | undefined>(undefined)

interface RequirementsProviderProps {
  children: React.ReactNode
}

export const RequirementsProvider = ({ children }: RequirementsProviderProps) => {
  const [availableRequirementsNames, setAvailableRequirementsNames] = useState<string[]>([])
  const [checkedRequirementNames, setCheckedRequirementNames] = useState<readonly string[]>([])
  const [createdLists, setCreatedLists] = useState<FetchedCreatedList[]>([])
  const [newListName, setNewListName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedListForAnalysis, setSelectedListForAnalysis] = useState<FetchedCreatedList | null>(
    null
  )

  useEffect(() => {
    const fetchAvailableRequirements = async () => {
      try {
        const data: string[] = [
          'DesignInterface',
          'LogicaNegocios',
          'BancoDeDados',
          'TestesDeIntegracao',
          'AutenticacaoForte',
          'AutorizacaoGranular',
          'CriptografiaDeDados',
          'AuditoriaDeAcesso',
          'TempoDeRespostaRapido',
          'Escalabilidade',
          'OtimizacaoDeConsultas',
          'CacheDeDados',
        ]
        setAvailableRequirementsNames(data)
      } catch (error) {
        console.error('Error fetching available requirements:', error)
        setErrorMessage('Erro ao carregar requisitos disponíveis.')
      }
    }
    fetchAvailableRequirements()
  }, [])

  useEffect(() => {
    const fetchCreatedLists = async () => {
      try {
        const data: FetchedCreatedList[] = [
          {
            id: 'list-pre-001',
            name: 'Lista de Tarefas Diárias',
            requirements: [
              { id_: 'item-task-001', name: 'DesignInterface' },
              { id_: 'item-sec-001', name: 'AutenticacaoForte' },
            ],
          },
          {
            id: 'list-pre-002',
            name: 'Lista de Segurança Crítica',
            requirements: [
              { id_: 'item-sec-002', name: 'AutorizacaoGranular' },
              { id_: 'item-sec-003', name: 'CriptografiaDeDados' },
            ],
          },
          {
            id: 'list-pre-003',
            name: 'Lista de Desempenho',
            requirements: [
              { id_: 'item-perf-001', name: 'TempoDeRespostaRapido' },
              { id_: 'item-perf-002', name: 'Escalabilidade' },
            ],
          },
          {
            id: 'list-pre-004',
            name: 'Lista de Teste Extra',
            requirements: [{ id_: 'item-extra-001', name: 'TestesDeIntegracao' }],
          },
          {
            id: 'list-pre-005',
            name: 'Lista de Exemplos Longos de Nome para Testar o Overflow do Título da Lista',
            requirements: [
              { id_: 'item-long-001', name: 'DesignInterface' },
              { id_: 'item-long-002', name: 'AutenticacaoForte' },
            ],
          },
        ]
        setCreatedLists(data)
      } catch (error) {
        console.error('Error fetching created lists:', error)
        setErrorMessage('Erro ao carregar listas existentes.')
      }
    }
    fetchCreatedLists()
  }, [])

  const handleToggle = useCallback(
    (value: string) => () => {
      const currentIndex = checkedRequirementNames.indexOf(value)
      const newChecked = [...checkedRequirementNames]

      if (currentIndex === -1) {
        newChecked.push(value)
      } else {
        newChecked.splice(1, newChecked.length - 1) // Correção para remover apenas um elemento
        newChecked.splice(currentIndex, 1)
      }
      setCheckedRequirementNames(newChecked)
    },
    [checkedRequirementNames]
  )

  const numberOfChecked = useCallback(
    (items: readonly string[]) => intersection(checkedRequirementNames, items).length,
    [checkedRequirementNames]
  )

  const handleToggleAll = useCallback(
    (itemsToToggle: readonly string[]) => () => {
      if (numberOfChecked(itemsToToggle) === itemsToToggle.length) {
        setCheckedRequirementNames(not(checkedRequirementNames, itemsToToggle))
      } else {
        setCheckedRequirementNames(union(checkedRequirementNames, itemsToToggle))
      }
    },
    [checkedRequirementNames, numberOfChecked]
  )

  // Funções de manipulação de listas criadas (permanecem as mesmas)
  const handleCreateNewList = useCallback(async () => {
    if (checkedRequirementNames.length === 0) {
      setErrorMessage('Selecione pelo menos um requisito para criar uma nova lista.')
      return
    }
    if (newListName.trim() === '') {
      setErrorMessage('Por favor, dê um nome para a nova lista.')
      return
    }

    const payload: CreateListPayload = {
      name: newListName,
      requirements: Array.from(checkedRequirementNames),
    }

    console.log('Enviando nova lista para a API (simulado):', payload)
    try {
      const savedList: FetchedCreatedList = {
        id: `api-list-${Date.now()}`,
        name: newListName,
        requirements: checkedRequirementNames.map((reqName, index) => ({
          id_: `item-${Date.now()}-${index}`,
          name: reqName,
        })),
      }

      setCreatedLists((prev) => [...prev, savedList])
      setCheckedRequirementNames([])
      setNewListName('')
      setErrorMessage(null)
      alert('Lista criada e salva com sucesso!')
    } catch (error) {
      console.error('Erro ao criar lista (simulado):', error)
      setErrorMessage('Erro ao criar lista. Tente novamente.')
    }
  }, [
    checkedRequirementNames,
    newListName,
    setCreatedLists,
    setCheckedRequirementNames,
    setNewListName,
    setErrorMessage,
  ])

  const handleDeleteList = useCallback(
    async (listId: string) => {
      if (!window.confirm('Tem certeza que deseja excluir esta lista?')) return

      console.log('Enviando DELETE para a API para lista (simulado):', listId)
      try {
        setCreatedLists((prev) => prev.filter((list) => list.id !== listId))
        // Se a lista excluída for a selecionada para o stepper, deseleciona
        if (selectedListForAnalysis && selectedListForAnalysis.id === listId) {
          setSelectedListForAnalysis(null)
        }
        setErrorMessage(null)
        alert('Lista excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir lista (simulado):', error)
        setErrorMessage('Erro ao excluir lista. Tente novamente.')
      }
    },
    [selectedListForAnalysis, setSelectedListForAnalysis, setCreatedLists, setErrorMessage]
  )

  const handleSaveListEdits = useCallback(
    async (listToSave: FetchedCreatedList) => {
      const payload: CreateListPayload = {
        name: listToSave.name,
        requirements: listToSave.requirements.map((req) => req.name),
      }

      console.log('Enviando atualizações para a API para lista (simulado):', listToSave.id, payload)
      try {
        setCreatedLists((prev) =>
          prev.map((list) => (list.id === listToSave.id ? listToSave : list))
        )
        setErrorMessage(null)
        alert('Edições da lista salvas com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar edições da lista (simulado):', error)
        setErrorMessage('Erro ao salvar edições da lista. Tente novamente.')
      }
    },
    [setCreatedLists, setErrorMessage]
  )
  // Esta função será chamada pelo CreatedListComponent para selecionar uma lista
  const handleSelectCreatedList = useCallback(
    (listId: string) => {
      const selected = createdLists.find((list) => list.id === listId)
      if (selected) {
        // Se a lista já estiver selecionada, deseleciona. Caso contrário, seleciona.
        setSelectedListForAnalysis((prev) => (prev?.id === listId ? null : selected))
      }
    },
    [createdLists]
  ) // Dependência: createdLists

  // Esta função é para o AppStepper definir a lista selecionada para análise
  const handleSetSelectedListForAnalysis = useCallback((list: FetchedCreatedList | null) => {
    setSelectedListForAnalysis(list)
  }, []) // Sem dependências diretas de estado, pois só usa o setter

  // Memoriza o objeto de valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = useMemo(
    () => ({
      availableRequirementsNames,
      checkedRequirementNames,
      createdLists,
      newListName,
      errorMessage,
      selectedListForAnalysis, // Incluído no valor do contexto
      setNewListName,
      setErrorMessage,
      handleToggle,
      handleToggleAll,
      handleCreateNewList,
      handleDeleteList,
      handleSaveListEdits,
      handleSelectCreatedList,
      handleSetSelectedListForAnalysis, // Incluído no valor do contexto
    }),
    [
      availableRequirementsNames,
      checkedRequirementNames,
      createdLists,
      newListName,
      errorMessage,
      selectedListForAnalysis,
      setNewListName,
      setErrorMessage,
      handleToggle,
      handleToggleAll,
      handleCreateNewList,
      handleDeleteList,
      handleSaveListEdits,
      handleSelectCreatedList,
      handleSetSelectedListForAnalysis,
    ]
  )

  return (
    <RequirementsContext.Provider value={contextValue}>{children}</RequirementsContext.Provider>
  )
}

// Hook customizado para consumir o contexto
export const useRequirementsContext = () => {
  const context = useContext(RequirementsContext)
  if (context === undefined) {
    throw new Error('useRequirementsContext must be used within a RequirementsProvider')
  }
  return context
}
