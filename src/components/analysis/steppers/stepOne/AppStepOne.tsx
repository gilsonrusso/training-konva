import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { Alert, Box, Button, Divider, Grid, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import { useAnalysis } from '../../../../contexts/AnalysisContext'
import { intersection, not, union } from '../../../../utils/commons'
import { CreatedListsSection } from './CreatedListsSection'
import { PrimarySelectionList } from './PrimarySelectionList'

// type AvailableRequirement = string

// interface CreateListPayload {
//   name: string
//   requirements: string[]
// }

export const AppStepOne = () => {
  const [checkedRequirementNames, setCheckedRequirementNames] = useState<readonly string[]>([])
  const [newListName, setNewListName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { availableRequirementsNames, createdLists, createNewList } = useAnalysis()

  // Funções que agora interagem com o contexto
  const handleCreateNewList = useCallback(() => {
    if (newListName.trim() === '') {
      setErrorMessage('O nome da lista não pode ser vazio.')
      return
    }
    if (createdLists.some((list) => list.name.toLowerCase() === newListName.toLowerCase())) {
      setErrorMessage('Já existe uma lista com este nome. Por favor, escolha outro nome.')
      return
    }
    setErrorMessage(null)

    createNewList(newListName, Array.from(checkedRequirementNames)) // Usa a função do contexto
    setNewListName('')
    setCheckedRequirementNames([])
  }, [newListName, checkedRequirementNames, createNewList, createdLists])

  const handleToggle = useCallback(
    (value: string) => () => {
      const currentIndex = checkedRequirementNames.indexOf(value)
      const newChecked = [...checkedRequirementNames]

      if (currentIndex === -1) {
        newChecked.push(value)
      } else {
        newChecked.splice(currentIndex, 1)
      }

      setCheckedRequirementNames(newChecked)
    },
    [checkedRequirementNames]
  )

  const handleToggleAll = useCallback(
    (itemsToToggle: readonly string[]) => () => {
      if (intersection(checkedRequirementNames, itemsToToggle).length === itemsToToggle.length) {
        setCheckedRequirementNames(not(checkedRequirementNames, itemsToToggle))
      } else {
        setCheckedRequirementNames(union(checkedRequirementNames, itemsToToggle))
      }
    },
    [checkedRequirementNames]
  )

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
        <CreatedListsSection />
      </Grid>
    </Grid>
  )
}
