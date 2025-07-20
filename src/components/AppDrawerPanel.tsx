import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useDrawerContext } from '../pages/Training'
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

  const { handleAddClassItem, images } = useDrawerContext()

  const numberImagesLoaded = useCallback(() => {
    return images?.length || 0
  }, [images])

  const numberRectsCreated = useCallback(() => {
    return images.reduce((acc, rect) => acc + rect.rects.length, 0)
  }, [images])

  const handleAddClass = () => {
    handleAddClassItem(name)
    setName('')
  }

  return (
    <Grid container spacing={0.5} flexDirection={'column'} size={{ xs: 12, sm: 12, md: 3 }}>
      {/* Classes List - Section  */}
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
      {/* Rect List - Section  */}

      <GridStyled
        container
        // sx={{ maxHeight: '288px' }}
        spacing={0}
        flexDirection={'column'}
        flexGrow={3}
      >
        <Box padding={1} flexGrow={1}>
          <AppRectList />
        </Box>
      </GridStyled>
      {/* Export | Upload - Section  */}
      <GridStyled sx={{ maxHeight: '170px', padding: '4px' }} flexGrow={1}>
        <Paper sx={{ height: '100%', padding: 1 }}>
          <Grid container display={'flex'} flexDirection={'column'}>
            <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption">Export Current Image</Typography>
              <Button onClick={onHandleExporting}>Export</Button>
            </Grid>
            <Divider sx={{ marginY: 1 }} />
            <Grid>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onHandleUploading}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                />
                <label style={{ width: '100%' }} htmlFor="image-upload-input">
                  <Button fullWidth variant="outlined" component="span">
                    Upload
                  </Button>
                </label>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </GridStyled>
      {/* Summary - Section  */}
      <GridStyled
        sx={{ borderRadius: '0 0 0 8px', maxHeight: '80px', padding: '4px' }}
        flexGrow={1}
      >
        <Paper sx={{ height: '100%', padding: 1 }}>
          <Typography variant="caption">Summary</Typography>
          <Grid
            container
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
          >
            <Grid sx={{ display: 'flex', gap: 5 }}>
              <Typography variant="body2">{`Images: ${numberImagesLoaded() || 0}`}</Typography>
              <Typography variant="body2">{`Rects: ${numberRectsCreated() || 0}`}</Typography>
            </Grid>
            <Grid sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button size="small" variant="contained">
                Training
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </GridStyled>
    </Grid>
  )
}
