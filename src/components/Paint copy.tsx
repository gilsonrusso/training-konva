import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import AdUnitsOutlinedIcon from '@mui/icons-material/AdUnitsOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import Crop54Icon from '@mui/icons-material/Crop54'
import DownloadOutlined from '@mui/icons-material/DownloadOutlined'
import GestureOutlinedIcon from '@mui/icons-material/GestureOutlined'
import { Box, Button, Grid, IconButton } from '@mui/material'
import { useCallback, useRef, useState, type ElementType } from 'react'
import { Image as KonvaImage, Line as KonvasLine, Layer, Stage } from 'react-konva'

const SIZE_DEFAULT = 500

type downloadURIProps = {
  uri: string | undefined
  name: string
}

interface DrawingShape {
  currentTool: DrawTools
  points: number[]
  // Add other properties if needed, e.g., color, strokeWidth
}

export enum DrawTools {
  Select = 'select',
  Rectangle = 'Rectangle',
  Circle = 'circle',
  Arrow = 'Arrow',
  Brush = 'brush',
  Eraser = 'eraser',
}

type CurrentDrawTool = (typeof DrawTools)[keyof typeof DrawTools]

export enum PaintColorOptions {
  Black = '#000000',
  Red = '#FF0000',
  Green = '#00FF00',
  Blue = '#0000FF',
  Yellow = '#FFFF00',
  Magenta = '#FF00FF',
  Cyan = '#00FFFF',
}

type PaintOptions = {
  id: DrawTools
  label: string
  icon: ElementType
  color?: string
}

export const PAINT_OPTIONS: PaintOptions[] = [
  { id: DrawTools.Select, label: 'Select', icon: AdsClickOutlinedIcon },
  { id: DrawTools.Rectangle, label: 'Rectangle', icon: Crop54Icon },
  { id: DrawTools.Circle, label: 'Circle', icon: CircleOutlinedIcon },
  { id: DrawTools.Brush, label: 'Free Draw', icon: GestureOutlinedIcon },
  { id: DrawTools.Arrow, label: 'Arrow', icon: ArrowOutwardOutlinedIcon },
  { id: DrawTools.Eraser, label: 'Eraser', icon: AdUnitsOutlinedIcon },
]

const downloadURI = ({ uri, name }: downloadURIProps) => {
  const link = document.createElement('a')
  link.download = name
  link.href = uri || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const AppPaint = () => {
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)
  const [currentTool, setCurrentTool] = useState<CurrentDrawTool>(DrawTools.Select)

  const [lines, setLines] = useState<DrawingShape[]>([])

  const stageRef = useRef<any>(null)
  const isDrawing = useRef(false)

  const onExportClick = useCallback(() => {
    const dataUri = stageRef?.current?.toDataURL({ pixelRatio: 3 })
    downloadURI({ uri: dataUri, name: 'image.png' })
  }, [])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (e.target.files) {
      const fileUrls = files.map((file) => URL.createObjectURL(file))

      fileUrls.forEach((img) => {
        const element = new Image(SIZE_DEFAULT / 2, SIZE_DEFAULT / 2)
        element.src = img
        setImages((prev) => [...prev, element])
      })
    }
  }

  const handleMouseDown = (e) => {
    if (currentTool === DrawTools.Select) {
      return
    }

    console.log('handleMouseDown', currentTool)

    isDrawing.current = true
    const pos = e?.target?.getStage()?.getPointerPosition()

    switch (currentTool) {
      case DrawTools.Brush:
        setLines((prevLines) => [
          ...prevLines,
          { currentTool: DrawTools.Brush, points: [pos?.x || 0, pos?.y || 0] },
        ])
        break
    }
  }

  console.log('currentTool', currentTool)
  console.log('lines', lines)

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return
    }
    const stage = e.target.getStage()
    const point = stage?.getPointerPosition()

    // To draw line
    const lastLine = lines[lines.length - 1]
    // add point
    lastLine.points = lastLine.points.concat([point?.x || 0, point?.y || 0])

    // replace last
    lines.splice(lines.length - 1, 1, lastLine)
    setLines(lines.concat())
  }

  const handleMouseUp = () => {
    console.log('handleMouseUp')
    isDrawing.current = false
    // if (newRect) {
    //   setRects([...rects, newRect])
    //   setNewRect(null)
    // }
  }

  return (
    <Box>
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Grid container spacing={5}>
          <Grid size={12}>
            <input type="file" accept="image/*" multiple onChange={handleUpload} />
          </Grid>
          <Grid size={12}>
            <Button
              onClick={() => onExportClick()}
              variant="contained"
              color="primary"
              endIcon={<DownloadOutlined />}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={1} columns={12} sx={{ marginY: 2 }}>
        {images.map((el, index) => (
          <Grid key={index} size={1}>
            <img
              key={index}
              src={el.src}
              alt={`img-${index}`}
              width={'100%'}
              onClick={() => setSelectedImage(el)}
              style={{
                cursor: 'pointer',
                border: selectedImage === el ? '2px solid blue' : '1px solid gray',
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1} columns={12} sx={{ marginY: 2 }}>
        {PAINT_OPTIONS.map(({ icon: Icon, id, label, color }, index) => (
          <Grid key={index} size={1}>
            <IconButton
              onClick={() => setCurrentTool(id)}
              color={currentTool === id ? 'primary' : 'default'}
            >
              <Icon />
            </IconButton>
          </Grid>
        ))}
      </Grid>

      <Box
        height={SIZE_DEFAULT}
        width={SIZE_DEFAULT}
        sx={{ border: '1px solid red', overflow: 'hidden' }}
      >
        {selectedImage && (
          <Stage
            width={SIZE_DEFAULT}
            height={SIZE_DEFAULT}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer>
              {selectedImage && <KonvaImage image={selectedImage} />}
              {lines.map((line, i) => (
                <KonvasLine
                  key={i}
                  points={line.points}
                  stroke="#df4b26"
                  strokeWidth={5}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.currentTool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </Box>
    </Box>
  )
}
