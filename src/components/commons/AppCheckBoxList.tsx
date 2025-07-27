import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Badge, Box, ListSubheader, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useDrawerContext } from '../../pages/NewRequirements'

export const AppCheckboxList = () => {
  const { handleSetClassItem, classItemSelected, classItems, handleDeleteClassItem } =
    useDrawerContext()

  return (
    <List
      sx={{
        marginTop: '8px',
        width: '100%',
        bgcolor: 'background.paper',
        height: '220px',
        maxHeight: '220px',
        overflowY: 'auto',
      }}
      subheader={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListSubheader>Classes List</ListSubheader>
          <Badge badgeContent={`${classItems?.length || 0}`} color="primary"></Badge>
        </Box>
      }
    >
      {classItems?.length === 0 && (
        <>
          <Typography sx={{ paddingLeft: '16px' }} variant="body2" color="text.secondary">
            No classes created.
          </Typography>
        </>
      )}

      {classItems?.map(({ id, name }, index) => {
        const labelId = `checkbox-list-label-${id}`

        return (
          <ListItem
            dense
            key={id}
            secondaryAction={
              <IconButton
                onClick={() => handleDeleteClassItem(id)}
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
              <ListItemText id={labelId} primary={`${name}`} />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}
