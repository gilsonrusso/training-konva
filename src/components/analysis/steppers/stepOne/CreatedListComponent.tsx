import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  TextField,
} from '@mui/material'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { memo, useEffect, useState } from 'react'

interface CreatedListItem {
  id_: string // ID do item dentro da lista criada (o '_id' do backend)
  name: string // Nome do item (ex: 'DesignInterface')
  // ... outras propriedades que possam vir no '...rest'
}

interface FetchedCreatedList {
  id: string // ID da lista (o ID gerado pelo backend)
  name: string
  requirements: CreatedListItem[] // A lista de itens com id_ e name
}

interface CreatedListComponentProps {
  list: FetchedCreatedList
  availableAllRequirementNames: string[] // Vem do CreatedListsSection (que pega do context)
  onDeleteList: (listId: string) => void // Vem do CreatedListsSection (que pega do context)
  onSaveList: (listToSave: FetchedCreatedList) => void // Vem do CreatedListsSection (que pega do context)
  isSelected: boolean
  onSelect: (listId: string) => void // Vem do CreatedListsSection (que pega do context)
}
export const CreatedListComponent = memo(function CreatedListComponent({
  list,
  availableAllRequirementNames,
  isSelected,
  onDeleteList,
  onSaveList,
  onSelect,
}: CreatedListComponentProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [currentListName, setCurrentListName] = useState(list.name)
  const [currentRequirements, setCurrentRequirements] = useState<CreatedListItem[]>(
    list.requirements
  )
  const [selectedNewRequirementName, setSelectedNewRequirementName] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Use useEffect para verificar mudanças
  useEffect(() => {
    const originalName = list.name
    const originalRequirements = list.requirements
      .map((r) => r.name)
      .sort()
      .join(',')
    const currentRequirementsSorted = currentRequirements
      .map((r) => r.name)
      .sort()
      .join(',')

    const nameChanged = originalName !== currentListName
    const requirementsChanged = originalRequirements !== currentRequirementsSorted

    setHasUnsavedChanges(nameChanged || requirementsChanged)
  }, [currentListName, currentRequirements, list.name, list.requirements])

  const handleSaveList = () => {
    onSaveList({
      ...list,
      name: currentListName,
      requirements: currentRequirements,
    })
    setIsEditingName(false) // Sai do modo de edição após salvar
    setHasUnsavedChanges(false) // Limpa o estado de mudanças
  }

  const handleAddChosenRequirement = () => {
    if (selectedNewRequirementName) {
      // Verifica se o requisito já existe na lista atual
      const isAlreadyAdded = currentRequirements.some(
        (req) => req.name === selectedNewRequirementName
      )

      if (!isAlreadyAdded) {
        const newRequirement: CreatedListItem = {
          id_: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: selectedNewRequirementName,
        }
        setCurrentRequirements((prev) => [...prev, newRequirement])
        setSelectedNewRequirementName(null) // Limpa o Autocomplete
        // setHasUnsavedChanges(true); // Já é tratado pelo useEffect acima
      }
    }
  }

  const handleDeleteRequirement = (idToDelete: string) => () => {
    setCurrentRequirements((prev) => prev.filter((req) => req.id_ !== idToDelete))
    // setHasUnsavedChanges(true); // Já é tratado pelo useEffect acima
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{
          py: 1,
          '& .MuiCardHeader-content': { overflow: 'hidden' },
        }}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <FormControlLabel
              control={
                <Checkbox checked={isSelected} onChange={() => onSelect(list.id)} size="small" />
              }
              label={
                isEditingName ? (
                  <TextField
                    value={currentListName}
                    onChange={(e) => {
                      setCurrentListName(e.target.value)
                      // setHasUnsavedChanges(true); // Já é tratado pelo useEffect acima
                    }}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingName(false)
                      }
                    }}
                    size="small"
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-input': { padding: '4px 8px' },
                      '& .MuiOutlinedInput-root': { height: '32px' },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.9rem',
                    }}
                  >
                    {currentListName}
                    <IconButton
                      sx={{ cursor: 'pointer', ml: 0.5 }}
                      size="small"
                      onClick={() => setIsEditingName(true)}
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                )
              }
            />
          </Box>
        }
        action={
          <IconButton onClick={() => onDeleteList(list.id)} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        }
      />
      <Divider />
      <List dense sx={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
        {currentRequirements.map((req) => (
          <ListItemButton key={req.id_} sx={{ py: 0.5 }}>
            <ListItemText
              primary={req.name}
              sx={{ '& .MuiListItemText-primary': { fontSize: '0.8rem' } }}
            />
            <Box sx={{ ml: 'auto' }}>
              <IconButton size="small" onClick={handleDeleteRequirement(req.id_)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Autocomplete
          fullWidth
          size="small"
          options={availableAllRequirementNames}
          value={selectedNewRequirementName}
          onChange={(_, newValue) => setSelectedNewRequirementName(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Adicionar Requisito"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          )}
          filterOptions={(options, state) =>
            options.filter(
              (option) =>
                !currentRequirements.some((req) => req.name === option) &&
                option.toLowerCase().includes(state.inputValue.toLowerCase())
            )
          }
        />
        <Button
          variant="outlined"
          onClick={handleAddChosenRequirement}
          disabled={!selectedNewRequirementName}
          sx={{ minWidth: 'auto', p: '6px' }}
        >
          <AddCircleOutlineIcon fontSize="small" />
        </Button>
      </Box>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
        <Button
          variant="contained"
          onClick={handleSaveList}
          size="small"
          disabled={!hasUnsavedChanges}
        >
          Save
        </Button>
      </Box>
    </Card>
  )
})
