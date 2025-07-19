import PlusOneOutlinedIcon from '@mui/icons-material/PlusOneOutlined'
import { Box, Button, Divider, Grid, List, ListItem, ListItemText, Typography } from '@mui/material'
import type { RectShape } from '../types/Shapes'
import { AppInputWihtIcon } from './commons/AppInputWithIcon'
import { GridStyled } from './muiStyled/GridStyled'

type AppDrawerPanelProps = {
  rects: RectShape[]
  imageName?: string
  currentLabel: string
  onHandleCurrentLabel: (value: string) => void
  onHandleExporting: () => void
  onHandleUploading: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const AppDrawerPanel = ({
  rects,
  imageName,
  currentLabel,
  onHandleCurrentLabel,
  onHandleExporting,
  onHandleUploading,
}: AppDrawerPanelProps) => {
  return (
    <Grid container spacing={0.5} flexDirection={'column'} size={{ xs: 12, sm: 12, md: 3 }}>
      <GridStyled
        container
        spacing={0}
        flexDirection={'column'}
        flexGrow={3}
        sx={{ borderRadius: '8px 0 0 0' }}
      >
        <Grid padding={1} flexGrow={1}>
          <AppInputWihtIcon
            icon={<PlusOneOutlinedIcon />}
            value={currentLabel}
            onChange={(e) => onHandleCurrentLabel(e.target.value)}
          />
        </Grid>
        <Divider />
        <Grid padding={1} flexGrow={1}>
          {!rects || rects.length === 0 ? (
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
          )}
        </Grid>
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
