import type { ImageWithRects, RectShape } from '@/types/Shapes'
import { useSnackbar } from '@contexts/SnackBarContext'
import { Box, Typography, useTheme } from '@mui/material'
import { useDrawerContext } from '@pages/NewRequirements'
import type Konva from 'konva'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  Image as KonvaImage,
  Line as KonvaLine,
  Rect as KonvaRect,
  Text as KonvaText,
  Layer,
  Stage,
} from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import type { StageAction, StageState } from './stageReducer'
import { DrawTools } from './stageReducer'

export type KonvaCanvasHandle = {
  exportStage: () => string | undefined
}

type KonvaCanvasProps = {
  dispatch: React.Dispatch<StageAction>
  stageState: StageState
  selectedImage: ImageWithRects | null
  onUpdateImageRects: (updatedImage: ImageWithRects) => void
}

export const KonvaCanvas = forwardRef<KonvaCanvasHandle, KonvaCanvasProps>(function KonvaCanvas(
  { dispatch, stageState, selectedImage, onUpdateImageRects },
  ref
) {
  const { currentTool, newRect, isDrawing, scale, stageX, stageY } = stageState
  const { classItems, classItemSelected } = useDrawerContext()
  const { showSnackbar } = useSnackbar()
  const theme = useTheme()

  const stageRef = useRef<Konva.Stage | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null)
  const cursorTimeoutRef = useRef<number | null>(null)

  useImperativeHandle(ref, () => ({
    exportStage: () => {
      return stageRef.current?.toDataURL({ pixelRatio: 3 })
    },
  }))

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const container = stage.container()
    if (currentTool === DrawTools.Rectangle) {
      container.style.cursor = 'crosshair'
    } else {
      container.style.cursor = 'default'
    }
  }, [currentTool])

  const handleMouseDown = () => {
    const stage = stageRef.current
    if (!stage || !selectedImage) return

    if (currentTool === DrawTools.Select) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const layer = stage.getLayers()[0]
    if (!layer) return

    const transform = layer.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const isWithinImage =
      pos.x >= 0 &&
      pos.x <= selectedImage.image.width &&
      pos.y >= 0 &&
      pos.y <= selectedImage.image.height

    if (!isWithinImage) {
      return
    }

    if (classItemSelected === -1) {
      showSnackbar('Please enter a requeriment name for the rectangle before drawing.', 'warning')
      return
    }

    const selectedClass = classItems.find((c) => c.id === classItemSelected)
    if (!selectedClass) {
      showSnackbar('Selected requeriment not found. Please select a valid requirement.', 'warning')
      return
    }

    const rect: RectShape = {
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      label: selectedClass.name,
      classId: selectedClass.id,
      id: `rect-${uuidv4()}`,
      color: selectedClass.rgbaColor,
      solidColor: selectedClass.solidBorderColor,
    }
    dispatch({ type: 'START_DRAWING', payload: { rect } })
  }

  const handleMouseMove = () => {
    const stage = stageRef.current
    if (!stage || !selectedImage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const layer = stage.getLayers()[0]
    if (!layer) return

    const transform = layer.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointerPosition)

    const isWithinImage =
      pos.x >= 0 &&
      pos.x <= selectedImage.image.width &&
      pos.y >= 0 &&
      pos.y <= selectedImage.image.height

    if (isWithinImage) {
      setCrosshairPos(pointerPosition)
    } else {
      setCrosshairPos(null)
    }

    if (currentTool === DrawTools.Select || !isDrawing || !newRect) {
      return
    }

    const clampedX = Math.max(0, Math.min(pos.x, selectedImage.image.width))
    const clampedY = Math.max(0, Math.min(pos.y, selectedImage.image.height))

    const width = clampedX - newRect.x
    const height = clampedY - newRect.y

    dispatch({ type: 'UPDATE_DRAWING', payload: { width, height } })
  }

  const handleMouseUp = () => {
    if (currentTool === DrawTools.Select || !isDrawing) {
      dispatch({ type: 'FINISH_DRAWING' })
      return
    }

    if (!newRect || !selectedImage) {
      dispatch({ type: 'FINISH_DRAWING' })
      return
    }

    const finalRect = {
      ...newRect,
      x: newRect.width < 0 ? newRect.x + newRect.width : newRect.x,
      y: newRect.height < 0 ? newRect.y + newRect.height : newRect.y,
      width: Math.abs(newRect.width),
      height: Math.abs(newRect.height),
    }

    if (finalRect.width > 5 && finalRect.height > 5) {
      const updatedSelectedImage: ImageWithRects = {
        ...selectedImage,
        rects: [...selectedImage.rects, finalRect],
      }
      onUpdateImageRects(updatedSelectedImage)
      // dispatch({ type: 'SET_TOOL', payload: DrawTools.Select })
    } else {
      showSnackbar('Rectangle too small. Draw a larger rectangle.', 'warning')
    }

    dispatch({ type: 'FINISH_DRAWING' })
  }

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const container = stage.container()
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current)
    }
    container.style.cursor = e.evt.deltaY < 0 ? 'zoom-in' : 'zoom-out'
    cursorTimeoutRef.current = window.setTimeout(() => {
      if (currentTool === DrawTools.Rectangle) {
        container.style.cursor = 'crosshair'
      } else {
        container.style.cursor = 'default'
      }
      cursorTimeoutRef.current = null
    }, 300)

    const scaleBy = 1.2
    const oldScale = scale

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const stageMouseX = pointer.x
    const stageMouseY = pointer.y

    const mousePointTo = {
      x: (stageMouseX - stageX) / oldScale,
      y: (stageMouseY - stageY) / oldScale,
    }

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    const minScale = 0.1
    const maxScale = 3
    newScale = Math.max(minScale, Math.min(newScale, maxScale))

    const newPos = {
      x: stageMouseX - mousePointTo.x * newScale,
      y: stageMouseY - mousePointTo.y * newScale,
    }

    dispatch({
      type: 'SET_STAGE_TRANSFORM',
      payload: { scale: newScale, x: newPos.x, y: newPos.y },
    })
  }

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (selectedImage && dimensions.width > 0 && dimensions.height > 0) {
      const newScale = 0.2
      const scaledImageWidth = selectedImage.image.width * newScale
      const scaledImageHeight = selectedImage.image.height * newScale

      const offsetX = (dimensions.width - scaledImageWidth) / 2
      const offsetY = (dimensions.height - scaledImageHeight) / 2

      dispatch({
        type: 'SET_STAGE_TRANSFORM',
        payload: { scale: newScale, x: offsetX, y: offsetY },
      })
    } else if (!selectedImage) {
      dispatch({ type: 'SET_STAGE_TRANSFORM', payload: { scale: 0.1, x: 0, y: 0 } })
    }
  }, [selectedImage, dimensions.width, dimensions.height, dispatch])

  return (
    <Box
      flexGrow={1}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          border: `1px dashed ${theme.palette.grey[400]}`,
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: 'calc(100% - 20px)',
          maxHeight: 'calc(100% - 20px)',
        }}
        ref={containerRef}
      >
        {!selectedImage && (
          <Typography variant="h6" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
            Please select or upload an image to start drawing.
          </Typography>
        )}
        {selectedImage && (
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onMouseLeave={() => setCrosshairPos(null)}
            onMouseEnter={() => {
              const stage = stageRef.current
              if (!stage || !selectedImage) return
              const pointer = stage.getPointerPosition()
              if (!pointer) return

              const layer = stage.getLayers()[0]
              if (!layer) return

              const transform = layer.getAbsoluteTransform().copy().invert()
              const pos = transform.point(pointer)

              const isWithinImage =
                pos.x >= 0 &&
                pos.x <= selectedImage.image.width &&
                pos.y >= 0 &&
                pos.y <= selectedImage.image.height

              if (isWithinImage) {
                setCrosshairPos(pointer)
              }
            }}
            onWheel={handleWheel}
          >
            <Layer scaleX={scale} scaleY={scale} x={stageX} y={stageY}>
              <KonvaImage
                x={0}
                y={0}
                width={selectedImage.image.width}
                height={selectedImage.image.height}
                image={selectedImage.image}
              />
              {crosshairPos && (
                <>
                  <KonvaLine
                    points={[
                      (crosshairPos.x - stageX) / scale,
                      0,
                      (crosshairPos.x - stageX) / scale,
                      selectedImage.image.height,
                    ]}
                    stroke="blue"
                    strokeWidth={1 / scale}
                    dash={[4 / scale, 4 / scale]}
                  />
                  <KonvaLine
                    points={[
                      0,
                      (crosshairPos.y - stageY) / scale,
                      selectedImage.image.width,
                      (crosshairPos.y - stageY) / scale,
                    ]}
                    stroke="blue"
                    strokeWidth={1 / scale}
                    dash={[4 / scale, 4 / scale]}
                  />
                </>
              )}
              {selectedImage.rects.map((rc) => (
                <React.Fragment key={rc.id}>
                  <KonvaText
                    text={rc.label}
                    x={rc.x}
                    y={rc.y - 20}
                    width={rc.width}
                    fontSize={12}
                    fill={rc.solidColor || 'blue'}
                    align="left"
                  />
                  <KonvaRect
                    {...rc}
                    stroke={rc.solidColor || 'red'}
                    strokeWidth={2}
                    fill={rc.color || 'rgba(255, 0, 0, 0.3)'}
                  />
                </React.Fragment>
              ))}
              {newRect && (
                <>
                  <KonvaText
                    text={newRect.label}
                    x={newRect.x}
                    y={newRect.y - 20}
                    width={newRect.width}
                    fontSize={12}
                    fill={newRect.solidColor || 'blue'}
                    align="left"
                  />
                  <KonvaRect
                    {...newRect}
                    stroke={newRect.solidColor || 'blue'}
                    strokeWidth={2}
                    fill={newRect.color || 'rgba(0, 0, 255, 0.3)'}
                  />
                </>
              )}
            </Layer>
          </Stage>
        )}
      </Box>
    </Box>
  )
})
