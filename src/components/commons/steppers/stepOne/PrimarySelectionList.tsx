import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

function intersection<T>(a: readonly T[], b: readonly T[]) {
  return a.filter((value) => b.includes(value))
}

interface PrimarySelectionListProps {
  title: React.ReactNode
  items: readonly string[]
  checkedItems: readonly string[]
  onToggleItem: (value: string) => () => void
  onToggleAll: (itemsToToggle: readonly string[]) => () => void
}

export const PrimarySelectionList = ({
  checkedItems,
  items,
  onToggleAll,
  onToggleItem,
  title,
}: PrimarySelectionListProps) => {
  const numberOfChecked = (itemsToCount: readonly string[]) =>
    intersection(checkedItems, itemsToCount).length

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            size="small"
            onClick={onToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selecionados`}
      />
      <Divider />
      <List
        sx={{
          flexGrow: 1,
          minHeight: 0,
          bgcolor: 'background.paper',
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 1,
        }}
        component="div"
        role="list"
        dense
      >
        {items.map((item: string) => {
          const labelId = `available-requirement-item-${item}-label`
          return (
            <ListItemButton key={item} role="listitem" onClick={onToggleItem(item)}>
              <ListItemIcon sx={{ padding: 0 }}>
                <Checkbox
                  size="small"
                  checked={checkedItems.includes(item)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={item} />
            </ListItemButton>
          )
        })}
      </List>
    </Card>
  )
}
