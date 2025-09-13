import { memo, type ElementType } from 'react'
import React from 'react'

import { Grid, IconButton } from '@mui/material'

import type { StageAction } from './stageReducer'
import { DrawTools } from './stageReducer'

// In a further refactoring, we can move PaintOptions to a types file.
type PaintOptions = {
  id: DrawTools
  label: string
  icon: ElementType
  color?: string
  disabled: boolean
}

type StageToolbarProps = {
  paintOptions: PaintOptions[]
  currentTool: DrawTools
  dispatch: React.Dispatch<StageAction>
  isImageSelected: boolean
}

export const StageToolbar = memo(function StageToolbar({
  paintOptions,
  currentTool,
  dispatch,
  isImageSelected,
}: StageToolbarProps) {
  return (
    <Grid container spacing={1} columns={12} sx={{ marginY: 2, justifyContent: 'center' }}>
      {paintOptions.map(({ icon: Icon, id, disabled }) => (
        <React.Fragment key={id}>
          <Grid>
            <IconButton
              onClick={() => dispatch({ type: 'SET_TOOL', payload: id })}
              color={currentTool === id ? 'primary' : 'default'}
              disabled={!isImageSelected || disabled}
            >
              <Icon />
            </IconButton>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  )
})
