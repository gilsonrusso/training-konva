import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import AdUnitsOutlinedIcon from '@mui/icons-material/AdUnitsOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import Crop54Icon from '@mui/icons-material/Crop54'
import GestureOutlinedIcon from '@mui/icons-material/GestureOutlined'
import { Box, Grid, IconButton, Typography } from '@mui/material'
import type Konva from 'konva'
import { useCallback, useEffect, useRef, useState, type ElementType } from 'react'
import {
  Image as KonvaImage,
  Line as KonvaLine,
  Rect as KonvaRect,
  Text as KonvaText,
  Layer,
  Stage,
} from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import type { ImageWithRects, RectShape } from '../types/Shapes'
import { ImageCarousel } from './commons/AppCarouselImage'
import { GridStyled } from './muiStyled/GridStyled'

export enum DrawTools {
  Select = 'select',
  Rectangle = 'Rectangle',
  Circle = 'circle',
  Arrow = 'Arrow',
  Brush = 'brush',
  Eraser = 'eraser',
}

const downloadURI = ({ uri, name }: downloadURIProps) => {
  const link: HTMLAnchorElement = document.createElement('a')
  link.download = name
  link.href = uri || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const RGBA_COLORS = [
  'rgba(255, 0, 0, 0.3)', // Vermelho
  'rgba(0, 0, 255, 0.3)', // Azul
  'rgba(0, 255, 0, 0.3)', // Verde
  'rgba(255, 255, 0, 0.3)', // Amarelo
  'rgba(255, 0, 255, 0.3)', // Magenta
  'rgba(0, 255, 255, 0.3)', // Ciano
  'rgba(128, 0, 128, 0.3)', // Roxo
  'rgba(255, 165, 0, 0.3)', // Laranja
]

const SOLID_COLORS = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'purple', 'orange']

export const PAINT_OPTIONS: PaintOptions[] = [
  { id: DrawTools.Select, label: 'Select', icon: AdsClickOutlinedIcon },
  { id: DrawTools.Rectangle, label: 'Rectangle', icon: Crop54Icon },
  { id: DrawTools.Circle, label: 'Circle', icon: CircleOutlinedIcon },
  { id: DrawTools.Brush, label: 'Free Draw', icon: GestureOutlinedIcon },
  { id: DrawTools.Arrow, label: 'Arrow', icon: ArrowOutwardOutlinedIcon },
  { id: DrawTools.Eraser, label: 'Eraser', icon: AdUnitsOutlinedIcon },
]

// const SIZE_DEFAULT = 300

type downloadURIProps = {
  uri: string | undefined
  name: string
}

type PaintOptions = {
  id: DrawTools
  label: string
  icon: ElementType
  color?: string
}

type CurrentDrawTool = (typeof DrawTools)[keyof typeof DrawTools]

type AppDrawerStageProps = {
  images: ImageWithRects[]
  selectedImage: ImageWithRects | null
  currentLabel: string
  onSetSelectedImage: (image: ImageWithRects) => void
  onUpdateImageRects: (updatedImage: ImageWithRects) => void
  onSetCurrentLabel: (label: string) => void
  onSetExportFunction: (exportFn: () => void) => void
}

export const AppDrawerStage = ({
  images,
  currentLabel,
  selectedImage,
  onUpdateImageRects,
  onSetCurrentLabel,
  onSetExportFunction,
  onSetSelectedImage,
}: AppDrawerStageProps) => {
  const [currentTool, setCurrentTool] = useState<CurrentDrawTool>(DrawTools.Select)

  const [newRect, setNewRect] = useState<RectShape | null>(null)

  const [isDrawing, setIsDrawing] = useState<boolean>(false)

  const stageRef = useRef<Konva.Stage | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null)

  const exportCanvas = useCallback(() => {
    if (!stageRef.current) {
      alert('Nenhum estágio de desenho encontrado para exportar.')
      return
    }
    const dataUri = stageRef.current.toDataURL({ pixelRatio: 3 })
    downloadURI({
      uri: dataUri,
      name: `annotated_${selectedImage?.image.src.split('/').pop() || 'image'}.png`,
    })
  }, [selectedImage])

  const handleMouseDown = () => {
    const stage = stageRef.current
    // Garante que haja uma imagem selecionada antes de permitir o desenho
    if (!stage || !selectedImage) return

    // Condição para só permitir desenhar se houver uma label
    if (!currentLabel.trim()) {
      alert('Por favor, insira uma label para o retângulo antes de desenhar.')
      return
    }

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return
    setIsDrawing(true)
    const { x, y } = pointerPosition

    // Seleciona um índice aleatório
    const randomIndex = Math.floor(Math.random() * RGBA_COLORS.length)
    // Obtém a cor RGBA e a cor sólida correspondente
    const randomRgbaColor = RGBA_COLORS[randomIndex]
    const randomSolidColor = SOLID_COLORS[randomIndex]

    const newRect: RectShape = {
      x,
      y,
      width: 0,
      height: 0,
      label: currentLabel,
      id: `rect-${uuidv4()}`, // Use uuidv4 para IDs únicas
      color: randomRgbaColor, // Cor para o preenchimento (com opacidade)
      solidColor: randomSolidColor, // Cor para a borda e texto
    }
    setNewRect(newRect)
  }

  const handleMouseMove = () => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Atualiza a posição do crosshair
    setCrosshairPos(pointerPosition)

    if (!isDrawing || !newRect) return

    const { x, y } = pointerPosition
    const width = x - newRect.x
    const height = y - newRect.y

    setNewRect({
      ...newRect,
      width,
      height,
    })
  }

  const handleMouseUp = () => {
    // Garante que haja uma imagem selecionada e um newRect antes de salvar
    if (!newRect || !selectedImage) return

    // Cria uma cópia atualizada da imagem selecionada com o novo retângulo
    const updatedSelectedImage: ImageWithRects = {
      ...selectedImage,
      rects: [...selectedImage.rects, newRect],
    }

    // Chama a função passada pelo pai para atualizar a imagem no array de imagens principal
    onUpdateImageRects(updatedSelectedImage)

    setNewRect(null)
    setIsDrawing(false)
    onSetCurrentLabel('') // Limpa a label após criar o retângulo
  }

  useEffect(() => {
    onSetExportFunction(exportCanvas)
  }, [onSetExportFunction, exportCanvas])

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateSize() // chamada inicial
    window.addEventListener('resize', updateSize) // atualiza ao redimensionar
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <Grid container spacing={0.5} flexDirection={'column'} flexGrow={1} overflow={'hidden'}>
      <GridStyled
        sx={{
          borderRadius: '0 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: 'purple',
        }}
        flexGrow={3}
      >
        {/* Botões de ferramenta */}
        <Grid container spacing={1} columns={12} sx={{ marginY: 2 }}>
          {PAINT_OPTIONS.map(({ icon: Icon, id }) => (
            <>
              <Grid>
                <IconButton
                  onClick={() => setCurrentTool(id)}
                  color={currentTool === id ? 'primary' : 'default'}
                  disabled={!selectedImage} // Desabilita se não houver imagem selecionada
                >
                  <Icon />
                </IconButton>
              </Grid>
            </>
          ))}
        </Grid>
        <Box
          flexGrow={1}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'red',
          }}
        >
          {/* Área de desenho Konva */}
          <Box
            // height={SIZE_DEFAULT}
            // width={SIZE_DEFAULT}
            sx={{
              border: '1px solid red',
              overflow: 'hidden',
              width: '100%', // Garantir que o Box ocupe a largura total disponível
              height: '100%', // Garantir que o Box ocupe a altura total disponível do seu pai
              display: 'flex', // Usar flex para centralizar o conteúdo (Konva ou Typography)
              justifyContent: 'center',
              alignItems: 'center',
            }}
            ref={containerRef}
            // flexGrow={1}
          >
            {!selectedImage && (
              <Typography variant="h6" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                Por favor, selecione ou carregue uma imagem para começar a desenhar.
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
                  if (!stage) return
                  const pointer = stage.getPointerPosition()
                  if (pointer) setCrosshairPos(pointer)
                }}
              >
                <Layer>
                  {selectedImage && (
                    <KonvaImage
                      x={0}
                      y={0}
                      width={dimensions.width}
                      height={dimensions.height}
                      image={selectedImage.image}
                    />
                  )}
                  {crosshairPos && (
                    <>
                      {/* Linha vertical */}
                      <KonvaLine
                        points={[crosshairPos.x, 0, crosshairPos.x, window.innerHeight]}
                        stroke="blue"
                        strokeWidth={1}
                        dash={[4, 4]}
                      />
                      {/* Linha horizontal */}
                      <KonvaLine
                        points={[0, crosshairPos.y, window.innerWidth, crosshairPos.y]}
                        stroke="blue"
                        strokeWidth={1}
                        dash={[4, 4]}
                      />
                    </>
                  )}
                  {/* Renderiza os retângulos existentes da imagem selecionada */}
                  {selectedImage &&
                    selectedImage.rects.map((rc) => (
                      <>
                        <KonvaText
                          text={rc.label}
                          x={rc.x}
                          y={rc.y - 20}
                          width={rc.width}
                          fontSize={12}
                          fill={rc.solidColor || 'blue'}
                          align="flex-start"
                        />
                        <KonvaRect
                          key={rc.id} // É bom ter uma key única aqui também
                          {...rc}
                          stroke={rc.solidColor || 'red'}
                          strokeWidth={2}
                          fill={rc.color || 'rgba(255, 0, 0, 0.3)'}
                        />
                      </>
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
                        align="flex-start"
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
      </GridStyled>
      <GridStyled
        flexGrow={1}
        sx={{
          padding: '5px',
          width: '100%',
          maxHeight: '170px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '0 0 8px 0',
        }}
      >
        {/* Miniaturas das Imagens Carregadas para Seleção */}
        <ImageCarousel
          images={images}
          selectedImage={selectedImage}
          onSetSelectedImage={onSetSelectedImage}
        />
      </GridStyled>
    </Grid>
  )
}
