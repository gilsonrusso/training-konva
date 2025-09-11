import { useSnackbar } from '@/contexts/SnackBarContext'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { Box, Button, Divider, Grid, TextField } from '@mui/material'
import { useCallback, useReducer } from 'react'
import { useAnalysis } from '../../../../contexts/AnalysisContext'
import { CreatedListsSection } from './CreatedListsSection'
import { PrimarySelectionList } from './PrimarySelectionList'
import { ActionTypes, appStepperOneReducer, type AppStepperOneState } from './reducer'

const initialState: AppStepperOneState = {
  checkedRequirementNames: [],
  newListName: '',
}

export const AppStepOne = () => {
  const { showSnackbar } = useSnackbar()
  const { availableRequirementsNames, createdLists, onCreateList } = useAnalysis()
  const [state, dispatch] = useReducer(appStepperOneReducer, initialState)
  const { newListName, checkedRequirementNames } = state

  const handleCreateNewList = useCallback(() => {
    if (newListName.trim() === '') {
      showSnackbar('O nome da lista não pode ser vazio.', 'error')
      return
    }

    if (createdLists.some((list) => list.name.toLowerCase() === newListName.toLowerCase())) {
      showSnackbar('Já existe uma lista com este nome. Por favor, escolha outro nome.', 'error')
      return
    }

    onCreateList(newListName, Array.from(checkedRequirementNames))
    dispatch({ type: ActionTypes.RESET_FORM })
  }, [checkedRequirementNames, createdLists, newListName, onCreateList, showSnackbar])

  const handleToggle = useCallback(
    (value: string) => () => {
      dispatch({ type: ActionTypes.TOGGLE_REQUIREMENT, payload: value })
    },
    []
  )

  const handleToggleAll = useCallback(
    (itemsToToggle: readonly string[]) => () => {
      dispatch({
        type: ActionTypes.TOGGLE_ALL_REQUIREMENTS,
        payload: { itemsToToggle },
      })
    },
    []
  )

  const handleNewListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ActionTypes.SET_NEW_LIST_NAME, payload: e.target.value })
  }

  return (
    <Grid
      container
      columns={12}
      spacing={2}
      sx={{ alignItems: 'flex-start', p: 2, height: '100%', flexWrap: 'nowrap' }}
    >
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
            onChange={handleNewListNameChange}
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
