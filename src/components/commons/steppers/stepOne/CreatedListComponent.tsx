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
import { useEffect, useState } from 'react'

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
  availableAllRequirementNames: string[] // Nomes dos requisitos disponíveis para Autocomplete
  onDeleteList: (listId: string) => void
  onSaveList: (listToSave: FetchedCreatedList) => void // Para salvar na API
  isSelected: boolean // Para controlar a seleção desta lista
  onSelect: (listId: string) => void // Callback para selecionar esta lista
}

export const CreatedListComponent = ({
  list,
  availableAllRequirementNames,
  onDeleteList,
  onSaveList,
  isSelected,
  onSelect,
}: CreatedListComponentProps) => {
  const [editingListName, setEditingListName] = useState<boolean>(false)
  const [editedListName, setEditedListName] = useState<string>(list.name)
  const [selectedNewRequirementName, setSelectedNewRequirementName] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [currentRequirements, setCurrentRequirements] = useState<CreatedListItem[]>(
    list.requirements
  )

  // Sincroniza o estado interno com as props e reseta o sinal de mudanças
  useEffect(() => {
    setEditedListName(list.name)
    setCurrentRequirements(list.requirements)
    setHasUnsavedChanges(false) // Reseta ao carregar uma nova lista ou quando a lista é salva externamente
  }, [list]) // Depende do objeto list inteiro, para detectar mudanças

  // Verifica mudanças no nome ou nos requisitos
  useEffect(() => {
    const isNameChanged = editedListName !== list.name
    const isRequirementsChanged =
      JSON.stringify(currentRequirements) !== JSON.stringify(list.requirements)
    setHasUnsavedChanges(isNameChanged || isRequirementsChanged)
  }, [editedListName, currentRequirements, list.name, list.requirements])

  const handleEditListNameClick = () => {
    setEditingListName(true)
  }

  const handleSaveListName = () => {
    // A verificação de mudança de nome já é feita no useEffect, aqui apenas aplica
    if (editingListName) {
      // Só salva se estiver no modo de edição
      setEditingListName(false)
    }
  }

  const handleAddChosenRequirement = () => {
    if (selectedNewRequirementName) {
      const isAlreadyInList = currentRequirements.some(
        (req) => req.name === selectedNewRequirementName
      )
      if (isAlreadyInList) {
        alert('Este requisito já está nesta lista.')
        return
      }
      const newReq: CreatedListItem = {
        id_: `item-${Date.now()}-${currentRequirements.length}`,
        name: selectedNewRequirementName,
      }
      setCurrentRequirements((prev) => [...prev, newReq])
      setSelectedNewRequirementName(null)
      // setHasUnsavedChanges(true) é feito pelo useEffect
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setCurrentRequirements((prev) => prev.filter((item) => item.id_ !== itemId))
    // setHasUnsavedChanges(true) é feito pelo useEffect
  }

  const handleSaveList = () => {
    onSaveList({ ...list, name: editedListName, requirements: currentRequirements })
    // setHasUnsavedChanges(false) é feito pelo useEffect quando a prop 'list' é atualizada
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
                editingListName ? (
                  <TextField
                    value={editedListName}
                    onChange={(e) => setEditedListName(e.target.value)}
                    onBlur={handleSaveListName}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveListName()
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
                    {list.name}
                    <IconButton size="small" sx={{ ml: 0.5 }} onClick={handleEditListNameClick}>
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
              <IconButton size="small" onClick={() => handleRemoveItem(req.id_)}>
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
}
