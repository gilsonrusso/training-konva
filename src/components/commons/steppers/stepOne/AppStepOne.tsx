import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { Alert, Box, Button, Divider, Grid, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import type { FetchedCreatedList } from '../../../../types/requirements'
import { intersection, not, union } from '../../../../utils/commons'
import { CreatedListsSection } from './CreatedListsSection'
import { PrimarySelectionList } from './PrimarySelectionList'

// type AvailableRequirement = string

interface CreateListPayload {
  name: string
  requirements: string[]
}

interface AppStepOneProps {
  onListSelected: (list: FetchedCreatedList | null) => void // Nova prop para o stepper
  selectedListIdForStepper: string | null // Para manter o estado de seleção visual
}

export const AppStepOne = ({ onListSelected, selectedListIdForStepper }: AppStepOneProps) => {
  const [availableRequirementsNames, setAvailableRequirementsNames] = useState<string[]>([])
  const [checkedRequirementNames, setCheckedRequirementNames] = useState<readonly string[]>([])
  const [createdLists, setCreatedLists] = useState<FetchedCreatedList[]>([])
  const [newListName, setNewListName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedListIdForStep = selectedListIdForStepper

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

  // 2. Carregar listas já cadastradas (laterais)
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

  // Funções de manipulação de seleção de checkboxes (agora passadas para PrimarySelectionList)
  const handleToggle = (value: string) => () => {
    const currentIndex = checkedRequirementNames.indexOf(value)
    const newChecked = [...checkedRequirementNames]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    setCheckedRequirementNames(newChecked)
  }

  const numberOfChecked = (items: readonly string[]) =>
    intersection(checkedRequirementNames, items).length

  const handleToggleAll = (items: readonly string[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setCheckedRequirementNames(not(checkedRequirementNames, items))
    } else {
      setCheckedRequirementNames(union(checkedRequirementNames, items))
    }
  }

  // Funções de manipulação de listas criadas (integração com API)
  const handleCreateNewList = async () => {
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
  }

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta lista?')) return

    console.log('Enviando DELETE para a API para lista (simulado):', listId)
    try {
      setCreatedLists((prev) => prev.filter((list) => list.id !== listId))
      // Se a lista excluída for a selecionada para o stepper, deseleciona
      if (selectedListIdForStep === listId) {
        onListSelected(null)
      }
      setErrorMessage(null)
      alert('Lista excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir lista (simulado):', error)
      setErrorMessage('Erro ao excluir lista. Tente novamente.')
    }
  }

  // const handleAddItemToList = (listId: string, newItemName: string) => {
  //   setCreatedLists((prev) =>
  //     prev.map((list) =>
  //       list.id === listId
  //         ? {
  //             ...list,
  //             requirements: [
  //               ...list.requirements,
  //               { id_: `item-${Date.now()}-${list.requirements.length}`, name: newItemName },
  //             ],
  //           }
  //         : list
  //     )
  //   )
  // }

  // const handleRemoveItemFromList = (listId: string, itemId: string) => {
  //   setCreatedLists((prev) =>
  //     prev.map((list) =>
  //       list.id === listId
  //         ? {
  //             ...list,
  //             requirements: list.requirements.filter((item) => item.id_ !== itemId),
  //           }
  //         : list
  //     )
  //   )
  // }

  const handleSaveListEdits = async (listToSave: FetchedCreatedList) => {
    const payload: CreateListPayload = {
      name: listToSave.name,
      requirements: listToSave.requirements.map((req) => req.name),
    }

    console.log('Enviando atualizações para a API para lista (simulado):', listToSave.id, payload)
    try {
      setCreatedLists((prev) => prev.map((list) => (list.id === listToSave.id ? listToSave : list)))
      setErrorMessage(null)
      alert('Edições da lista salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar edições da lista (simulado):', error)
      setErrorMessage('Erro ao salvar edições da lista. Tente novamente.')
    }
  }
  const handleSelectCreatedList = (listId: string) => {
    const selected = createdLists.find((list) => list.id === listId)
    if (selected) {
      if (selectedListIdForStep === listId) {
        onListSelected(null)
      } else {
        onListSelected(selected)
      }
    }
  }

  // const handleProceedToNextStep = () => {
  //   if (!selectedListIdForStep) {
  //     setErrorMessage('Por favor, selecione uma lista para prosseguir.')
  //     return
  //   }
  //   alert(`Prosseguindo para o próximo passo com a lista selecionada: ${selectedListIdForStep}`)
  // }

  return (
    <Grid
      container
      columns={12}
      spacing={2}
      sx={{ alignItems: 'flex-start', p: 2, height: '100%', flexWrap: 'nowrap' }}
    >
      {errorMessage && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        </Grid>
      )}

      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            label="Nome da Nova Lista"
            variant="outlined"
            size="small"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleCreateNewList}
            disabled={checkedRequirementNames.length === 0 || newListName.trim() === ''}
            startIcon={<AddCircleOutlineIcon />}
            fullWidth
          >
            Criar Nova Lista
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <PrimarySelectionList
            title="Requisitos Disponíveis"
            items={availableRequirementsNames}
            checkedItems={checkedRequirementNames}
            onToggleItem={handleToggle}
            onToggleAll={handleToggleAll}
          />
        </Box>
      </Grid>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 2, display: { xs: 'none', md: 'block' } }}
      />

      <Grid
        size={{ xs: 12, md: 8 }}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CreatedListsSection
          createdLists={createdLists}
          availableAllRequirementNames={availableRequirementsNames}
          onDeleteList={handleDeleteList}
          onSaveListEdits={handleSaveListEdits}
          selectedListIdForStep={selectedListIdForStep}
          onSelectCreatedList={handleSelectCreatedList}
        />
      </Grid>
    </Grid>
  )
}
