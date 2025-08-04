import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import { useDrawerContext } from '@pages/NewRequirements'
import React, { memo, useCallback, useRef, useState } from 'react'
import { containerVariants } from '../../layout/animations/variants'
import { AppCheckboxList } from '../commons/AppCheckBoxList'
import { AppInputWihtIcon } from '../commons/AppInputWithIcon'
import { AppRectList } from '../commons/AppRectList'
import { AnimatedItemStyled } from '../commons/muiMotions/AnimatedItemStyled'

type AppDrawerPanelProps = {
  onHandleExporting: (exportType: 'image' | 'yolo') => void
  onHandleUploading: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStartTraining: () => void
}

export const AppDrawerPanel = memo(function AppDrawerPanel({
  onHandleExporting,
  onHandleUploading,
  onStartTraining,
}: AppDrawerPanelProps) {
  const [newClassName, setNewClassName] = useState('')
  // State to control the export menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openExportMenu = Boolean(anchorEl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { handleAddClassItem, images } = useDrawerContext()
  const theme = useTheme()

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

  const panelRef = useRef<HTMLDivElement | null>(null)

  return (
    <Stack
      sx={{ paddingBottom: 4 }}
      height="100%"
      maxHeight={`calc(100vh - ${theme.mixins.toolbar.minHeight}px - 40px)`}
      spacing={0.5}
      ref={panelRef}
    >
      {/* Export | Upload - Section  */}
      <AnimatedItemStyled
        variants={containerVariants}
        sx={{ borderRadius: '4px 0 0 0', flex: '0 0 20%' }}
      >
        <Box sx={{ display: 'flex', width: '100%' }}>
          <input
            type="file"
            ref={fileInputRef}
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
      </AnimatedItemStyled>
      {/* Classes List - Section  */}
      <AnimatedItemStyled
        layout
        variants={containerVariants}
        sx={{
          borderRadius: '0',
          flex: '0 0 32%',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
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
      </AnimatedItemStyled>
      {/* Rect List - Section  */}
      <AnimatedItemStyled
        variants={containerVariants}
        sx={{ borderRadius: '0', flex: '0 0 32%', overflowY: 'hidden' }}
      >
        <AppRectList />
      </AnimatedItemStyled>
      {/* Summary - Section  */}
      <AnimatedItemStyled
        variants={containerVariants}
        sx={{ borderRadius: '0 0 0 8px', flex: '0 0 10%' }}
      >
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
            <Button
              id="export-button"
              size="small"
              aria-controls={openExportMenu ? 'export-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openExportMenu ? 'true' : undefined}
              onClick={handleExportMenuClick}
              variant="outlined"
              disabled={images?.length === 0}
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
            <Button onClick={onStartTraining} size="small" color="secondary" variant="contained">
              Start Training
            </Button>
          </Grid>
        </Grid>
      </AnimatedItemStyled>
    </Stack>
  )
})
