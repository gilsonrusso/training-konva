import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useDrawerContext } from '../../pages/Drawer'

export const AppCheckboxList = () => {
  const { handleSetClassItem, classItemSelected, classItems, handleDeleteClassItem } =
    useDrawerContext()

  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        height: '220px',
        maxHeight: '220px',
        overflowY: 'auto',
      }}
    >
      {classItems.map((value, index) => {
        const labelId = `checkbox-list-label-${value}`

        return (
          <ListItem
            key={value}
            secondaryAction={
              <IconButton
                onClick={() => handleDeleteClassItem(index)}
                edge="end"
                aria-label="comments"
              >
                <DeleteForeverIcon />
              </IconButton>
            }
            disablePadding
          >
            <ListItemButton role={undefined} onClick={() => handleSetClassItem(index)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={index === classItemSelected}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value}`} />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}
