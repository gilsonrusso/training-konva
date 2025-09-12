import type { RectShape } from '@/types/Shapes'

// Moved from AppDrawerStage.tsx for better separation of concerns
export enum DrawTools {
  Select = 'select',
  Rectangle = 'Rectangle',
  Circle = 'circle',
  Arrow = 'Arrow',
  Brush = 'brush',
  Eraser = 'eraser',
}

export interface StageState {
  currentTool: DrawTools
  newRect: RectShape | null
  isDrawing: boolean
  scale: number
  stageX: number
  stageY: number
}

export const initialState: StageState = {
  currentTool: DrawTools.Rectangle,
  newRect: null,
  isDrawing: false,
  scale: 0.1, // Start with the default reset scale
  stageX: 0,
  stageY: 0,
}

export type StageAction =
  | { type: 'SET_TOOL'; payload: DrawTools }
  | { type: 'START_DRAWING'; payload: { rect: RectShape } }
  | { type: 'UPDATE_DRAWING'; payload: { width: number; height: number } }
  | { type: 'FINISH_DRAWING' }
  | { type: 'SET_STAGE_TRANSFORM'; payload: { scale: number; x: number; y: number } }

export const stageReducer = (state: StageState, action: StageAction): StageState => {
  switch (action.type) {
    case 'SET_TOOL':
      return {
        ...state,
        currentTool: action.payload,
      }

    case 'START_DRAWING':
      return {
        ...state,
        isDrawing: true,
        newRect: action.payload.rect,
      }

    case 'UPDATE_DRAWING':
      if (!state.newRect) return state
      return {
        ...state,
        newRect: {
          ...state.newRect,
          width: action.payload.width,
          height: action.payload.height,
        },
      }

    case 'FINISH_DRAWING':
      return {
        ...state,
        isDrawing: false,
        newRect: null,
      }

    case 'SET_STAGE_TRANSFORM':
      return {
        ...state,
        scale: action.payload.scale,
        stageX: action.payload.x,
        stageY: action.payload.y,
      }

    default:
      return state
  }
}
