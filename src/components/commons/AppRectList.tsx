import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Badge, Box, ListSubheader, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useDrawerContext } from '../../pages/NewRequirements'

export const AppRectList = () => {
  const { selectedImage, handlerDeleteRectangle } = useDrawerContext()

  return (
    <List
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '270px',
        overflowY: 'auto',
      }}
      subheader={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListSubheader sx={{ backgroundColor: 'transparent' }}>Labels List</ListSubheader>
          <Badge badgeContent={`${selectedImage?.rects.length || 0}`} color="primary"></Badge>
        </Box>
      }
    >
      {!selectedImage?.rects && (
        <>
          <Typography sx={{ paddingLeft: '16px' }} variant="body2" color="text.secondary">
            No labels created.
          </Typography>
        </>
      )}

      {selectedImage &&
        selectedImage.rects &&
        selectedImage.rects.map((rect) => {
          return (
            <ListItem
              dense
              key={rect.id}
              secondaryAction={
                <IconButton
                  onClick={() =>
                    handlerDeleteRectangle({ imageId: selectedImage.id, rectId: rect.id })
                  }
                  edge="end"
                  aria-label="comments"
                >
                  <DeleteForeverIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemText
                primary={`Classe: ${rect.label}`}
                secondary={`Dimension: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)} | Coords: (X: ${rect.x.toFixed(0)}, Y: ${rect.y.toFixed(0)})`}
                sx={{ paddingLeft: '16px' }}
              />
            </ListItem>
          )
        })}
    </List>
  )
}
