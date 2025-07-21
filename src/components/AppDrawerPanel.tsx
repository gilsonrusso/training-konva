import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Divider, Grid, Menu, MenuItem, Paper, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useDrawerContext } from '../pages/Training'
import { AppCheckboxList } from './commons/AppCheckBoxList'
import { AppInputWihtIcon } from './commons/AppInputWithIcon'
import { AppRectList } from './commons/AppRectList'
import { GridStyled } from './muiStyled/GridStyled'

type AppDrawerPanelProps = {
  onHandleExporting: (exportType: 'image' | 'yolo') => void
  onHandleUploading: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStartTraining: () => void
}

export const AppDrawerPanel = ({
  onHandleExporting,
  onHandleUploading,
  onStartTraining,
}: AppDrawerPanelProps) => {
  const [newClassName, setNewClassName] = useState('')
  // State to control the export menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openExportMenu = Boolean(anchorEl)

  const { handleAddClassItem, images } = useDrawerContext()

  const numberImagesLoaded = useCallback(() => {
    return images?.length || 0
  }, [images])

  const numberRectsCreated = useCallback(() => {
    return images.reduce((acc, rect) => acc + rect.rects.length, 0)
  }, [images])

  const handleAddClass = () => {
    if (newClassName.trim()) {
      handleAddClassItem({ name: newClassName.trim() })
      setNewClassName('')
    }
  }

  const handleExportMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleExportMenuClose = () => {
    setAnchorEl(null)
  }

  const handleExportOptionClick = (exportType: 'image' | 'yolo') => {
    onHandleExporting(exportType)
    handleExportMenuClose()
  }

  return (
    <Grid container spacing={0.5} flexDirection={'column'} size={{ xs: 12, sm: 12, md: 3 }}>
      {/* Classes List - Section  */}
      <GridStyled container spacing={0} flexDirection={'column'} sx={{ borderRadius: '8px 0 0 0' }}>
        <Grid padding={1}>
          <AppInputWihtIcon
            disabled={newClassName.length === 0}
            value={newClassName}
            icon={<AddIcon />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNewClassName(event.target.value)
            }}
            handleButtonClick={handleAddClass}
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
              <Typography variant="caption">Export</Typography>
              <Button
                id="export-button"
                size="small"
                aria-controls={openExportMenu ? 'export-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openExportMenu ? 'true' : undefined}
                onClick={handleExportMenuClick}
                variant="outlined"
                disabled={images.length === 0}
              >
                Export
              </Button>
              <Menu
                id="export-menu"
                anchorEl={anchorEl}
                open={openExportMenu}
                onClose={handleExportMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'export-button',
                }}
              >
                <MenuItem onClick={() => handleExportOptionClick('image')}>
                  Export Image (PNG)
                </MenuItem>
                <MenuItem onClick={() => handleExportOptionClick('yolo')}>
                  Export Anotations (YOLO)
                </MenuItem>
              </Menu>
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
                  <Button size="small" fullWidth variant="outlined" component="span">
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
              <Button onClick={onStartTraining} size="small" variant="contained">
                Start Training
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </GridStyled>
    </Grid>
  )
}
