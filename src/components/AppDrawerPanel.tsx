import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { useDrawerContext } from '../pages/Drawer'
import { AppCheckboxList } from './commons/AppCheckBoxList'
import { AppInputWihtIcon } from './commons/AppInputWithIcon'
import { AppRectList } from './commons/AppRectList'
import { GridStyled } from './muiStyled/GridStyled'

type AppDrawerPanelProps = {
  onHandleExporting: () => void
  onHandleUploading: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const AppDrawerPanel = ({ onHandleExporting, onHandleUploading }: AppDrawerPanelProps) => {
  const [name, setName] = useState('')

  const { handleAddClassItem } = useDrawerContext()

  const handleAddClass = () => {
    handleAddClassItem(name)
    setName('')
  }

  return (
    <Grid container spacing={0.5} flexDirection={'column'} size={{ xs: 12, sm: 12, md: 3 }}>
      <GridStyled container spacing={0} flexDirection={'column'} sx={{ borderRadius: '8px 0 0 0' }}>
        <Grid padding={1}>
          <AppInputWihtIcon
            disabled={name.length === 0}
            value={name}
            icon={<AddIcon />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setName(event.target.value)
            }}
            handleButtonClick={() => handleAddClass()}
          />
          <AppCheckboxList />
        </Grid>
      </GridStyled>
      <GridStyled
        container
        // sx={{ maxHeight: '288px' }}
        spacing={0}
        flexDirection={'column'}
        flexGrow={3}
      >
        <Box padding={1} flexGrow={1}>
          <AppRectList />
          {/* {!rects || rects.length === 0 ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {imageName
                  ? `Nenhum retângulo para ${imageName}.`
                  : 'Nenhum retângulo selecionado.'}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {imageName ? `Retângulos em: ${imageName}` : 'Retângulos da Imagem Selecionada'}
              </Typography>
              <List dense>
                {rects.map((rect) => (
                  <ListItem key={rect.id}>
                    <ListItemText
                      primary={`Label: ${rect.label}`}
                      secondary={`Dimensões: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)} | Posição: (X: ${rect.x.toFixed(0)}, Y: ${rect.y.toFixed(0)})`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )} */}
        </Box>
      </GridStyled>

      <GridStyled
        sx={{ borderRadius: '0 0 0 8px', maxHeight: '170px', padding: '4px' }}
        flexGrow={1}
      >
        <Typography>Resumo:</Typography>
        <Button onClick={onHandleExporting}>Export</Button>
        <Box>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onHandleUploading}
            style={{ display: 'none' }}
            id="image-upload-input"
          />
          <label htmlFor="image-upload-input">
            <Button variant="contained" component="span">
              Upload
            </Button>
          </label>
        </Box>
        <Button>Training</Button>
      </GridStyled>
    </Grid>
  )
}
