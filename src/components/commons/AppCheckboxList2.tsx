import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Button, Card, CardHeader, Divider, Grid, IconButton, TextField } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import * as React from 'react'

// --- Tipos para maior clareza ---
interface MyListItem {
  id: number
  label: string
}

interface CreatedList {
  id: string // ID único para a lista (ex: timestamp)
  name: string
  items: MyListItem[]
}

// --- Funções Auxiliares (mantidas as originais, mas 'right' não é mais usado da mesma forma) ---
function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => !b.includes(value))
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.includes(value))
}

function union(a: readonly number[], b: readonly number[]) {
  return [...a, ...not(b, a)]
}

// --- Componente para uma lista criada ---
const CreatedListComponent: React.FC<{
  list: CreatedList
  onDeleteList: (listId: string) => void
  onAddItem: (listId: string, newItemLabel: string) => void
  onRemoveItem: (listId: string, itemId: number) => void
  onEditItem: (listId: string, itemId: number, newLabel: string) => void
}> = ({ list, onDeleteList, onAddItem, onRemoveItem, onEditItem }) => {
  const [editingItemId, setEditingItemId] = React.useState<number | null>(null)
  const [editedLabel, setEditedLabel] = React.useState<string>('')
  // const [newItemLabel, setNewItemLabel] = React.useState<string>('')

  // const handleEditClick = (item: MyListItem) => {
  //   setEditingItemId(item.id)
  //   setEditedLabel(item.label)
  // }

  const handleSaveEdit = (itemId: number) => {
    if (editedLabel.trim() !== '') {
      onEditItem(list.id, itemId, editedLabel)
    }
    setEditingItemId(null)
    setEditedLabel('')
  }

  // const handleAddItem = () => {
  //   if (newItemLabel.trim() !== '') {
  //     onAddItem(list.id, newItemLabel)
  //     setNewItemLabel('')
  //   }
  // }

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={list.name}
        action={
          <IconButton onClick={() => onDeleteList(list.id)} color="error">
            <DeleteIcon />
          </IconButton>
        }
      />
      <Divider />
      <List dense sx={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden' }}>
        {list.items.map((item) => (
          <ListItemButton key={item.id}>
            {editingItemId === item.id ? (
              <TextField
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                onBlur={() => handleSaveEdit(item.id)} // Salva ao perder o foco
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit(item.id)
                  }
                }}
                size="small"
                variant="outlined"
                fullWidth
              />
            ) : (
              <ListItemText primary={item.label} />
            )}
            <Box sx={{ ml: 'auto' }}>
              {' '}
              {/* Empurra os botões para a direita */}
              {/* {editingItemId !== item.id && (
                <IconButton size="small" onClick={() => handleEditClick(item)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )} */}
              <IconButton size="small" onClick={() => onRemoveItem(list.id, item.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItemButton>
        ))}
        {/* Adicionar novo campo */}
        {/* <ListItemButton>
          <TextField
            label="Novo Campo"
            variant="outlined"
            size="small"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddItem()
              }
            }}
            fullWidth
            sx={{ mr: 1 }}
          />
          <Button variant="outlined" onClick={handleAddItem} startIcon={<AddCircleOutlineIcon />}>
            Adicionar
          </Button>
        </ListItemButton> */}
      </List>
    </Card>
  )
}

// --- Componente Principal ---
export const AppCheckboxList2 = () => {
  // Alterado 'left' para 'availableItems' com labels descritivos
  const [availableItems, _] = React.useState<MyListItem[]>([
    { id: 0, label: 'Comprar pão' },
    { id: 1, label: 'Pagar contas de luz' },
    { id: 2, label: 'Ligar para o encanador' },
    { id: 3, label: 'Estudar para a prova' },
    { id: 4, label: 'Agendar consulta médica' },
    { id: 5, label: 'Limpar a casa' },
    { id: 6, label: 'Preparar apresentação' },
    { id: 7, label: 'Responder e-mails importantes' },
  ])

  const [checked, setChecked] = React.useState<readonly number[]>([])
  const [createdLists, setCreatedLists] = React.useState<CreatedList[]>([])
  const [newListName, setNewListName] = React.useState<string>('')

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    setChecked(newChecked)
  }

  const handleToggleAll = (itemIds: readonly number[]) => () => {
    if (numberOfChecked(itemIds) === itemIds.length) {
      setChecked(not(checked, itemIds))
    } else {
      setChecked(union(checked, itemIds))
    }
  }

  const numberOfChecked = (items: readonly number[]) => intersection(checked, items).length

  const customList = (title: React.ReactNode, itemIds: readonly number[]) => (
    <Card>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            size="small"
            onClick={handleToggleAll(itemIds)}
            checked={numberOfChecked(itemIds) === itemIds.length && itemIds.length !== 0}
            indeterminate={
              numberOfChecked(itemIds) !== itemIds.length && numberOfChecked(itemIds) !== 0
            }
            disabled={itemIds.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(itemIds)}/${itemIds.length} selecionados`}
      />
      <Divider />
      <List
        sx={{
          // width: 280, // Ajustado para melhor visualização dos labels maiores
          height: '300px',
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        component="div"
        role="list"
        dense
      >
        {itemIds.map((itemId: number) => {
          const item = availableItems.find((i) => i.id === itemId)
          if (!item) return null // Para garantir que o item existe

          const labelId = `transfer-list-all-item-${item.id}-label`

          return (
            <ListItemButton key={item.id} role="listitem" onClick={handleToggle(item.id)}>
              <ListItemIcon sx={{ padding: 0 }}>
                <Checkbox
                  size="small"
                  checked={checked.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
    </Card>
  )

  const handleCreateNewList = () => {
    if (checked.length === 0) {
      alert('Selecione pelo menos um item para criar uma nova lista.')
      return
    }
    if (newListName.trim() === '') {
      alert('Por favor, dê um nome para a nova lista.')
      return
    }

    const selectedItemsDetails = availableItems.filter((item) => checked.includes(item.id))

    const newList: CreatedList = {
      id: `list-${Date.now()}`,
      name: newListName,
      items: selectedItemsDetails,
    }

    setCreatedLists((prev) => [...prev, newList])
    setChecked([]) // Limpa a seleção após criar a lista
    setNewListName('') // Limpa o nome da nova lista
  }

  const handleDeleteList = (listId: string) => {
    setCreatedLists((prev) => prev.filter((list) => list.id !== listId))
  }

  const handleAddItemToList = (listId: string, newItemLabel: string) => {
    setCreatedLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [...list.items, { id: Date.now(), label: newItemLabel }],
            }
          : list
      )
    )
  }

  const handleRemoveItemFromList = (listId: string, itemId: number) => {
    setCreatedLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((item) => item.id !== itemId),
            }
          : list
      )
    )
  }

  const handleEditItemInList = (listId: string, itemId: number, newLabel: string) => {
    setCreatedLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, label: newLabel } : item
              ),
            }
          : list
      )
    )
  }

  return (
    <Grid
      container
      columns={12}
      flexDirection={'row'}
      spacing={2}
      sx={{ alignItems: 'flex-start', p: 2 }}
    >
      <Grid size={6} sx={{ width: '100%' }} maxWidth={280}>
        {/* Seção de criação de nova lista */}
        <Grid>
          {/* Ajuste o tamanho da coluna para melhor layout */}
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
              disabled={checked.length === 0 || newListName.trim() === ''}
              startIcon={<AddCircleOutlineIcon />}
              fullWidth
            >
              Criar Nova Lista
            </Button>
          </Box>
        </Grid>
        <Grid>
          {customList(
            'Itens Disponíveis',
            availableItems.map((item) => item.id)
          )}
        </Grid>
      </Grid>
      <Divider orientation="vertical" sx={{ my: 2 }} />
      <Grid size={6} flexGrow={1} sx={{}}>
        <Box
          sx={{
            overflowY: 'auto',
            paddingRight: 2,
            maxHeight: '500px',
            height: '100%',
          }}
        >
          <h2>Minhas Listas Personalizadas</h2>
          {createdLists.length === 0 ? (
            <p>Nenhuma lista foi criada ainda. Selecione itens e clique em Criar Nova Lista!</p>
          ) : (
            <Grid container spacing={1} columns={4}>
              {createdLists.map((list) => (
                <Grid
                  // maxWidth={'260px'}
                  size={1}
                  key={list.id}
                >
                  {/* Cada lista em sua própria coluna */}
                  <CreatedListComponent
                    list={list}
                    onDeleteList={handleDeleteList}
                    onAddItem={handleAddItemToList}
                    onRemoveItem={handleRemoveItemFromList}
                    onEditItem={handleEditItemInList}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
