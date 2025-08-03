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
        width: '100%',
        height: '100%',
        overflowY: 'hidden',
        paddingRight: '8px',
      }}
      subheader={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListSubheader sx={{ backgroundColor: 'transparent' }}>Requirements List</ListSubheader>
          <Badge badgeContent={`${classItems?.length || 0}`} color="primary"></Badge>
        </Box>
      }
    >
      {classItems?.length === 0 && (
        <>
          <Typography sx={{ paddingLeft: '16px' }} variant="body2" color="text.secondary">
            No Requirements created.
          </Typography>
        </>
      )}
      <Box
        sx={{
          width: '100%',
          height: '70%',
          overflowY: 'auto',
          paddingLeft: '8px',
        }}
      >
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
      </Box>
    </List>
  )
}
