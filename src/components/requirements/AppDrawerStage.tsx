import type { ImageWithRects } from '@/types/Shapes'
import { downloadURI } from '@/utils/downloadURI'
import { formatToYolo } from '@/utils/yoloFormatter'
import { createTextFile, zipFiles } from '@/utils/zipFiles'
import { useSnackbar } from '@contexts/SnackBarContext'
import { slideInFromLeft } from '@layout/animations/variants'
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import AdUnitsOutlinedIcon from '@mui/icons-material/AdUnitsOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import Crop54Icon from '@mui/icons-material/Crop54'
import GestureOutlinedIcon from '@mui/icons-material/GestureOutlined'
import { useDrawerContext } from '@pages/NewRequirements'
import { memo, useCallback, useEffect, useReducer, useRef, type ElementType } from 'react'
import { ImageCarousel } from '../commons/AppCarouselImage'
import { AnimatedGridStyled } from '../commons/muiMotions/AnimatedGridStyled'
import { GridStyled } from '../commons/muiStyled/GridStyled'
import { KonvaCanvas, type KonvaCanvasHandle } from './KonvaCanvas'
import { DrawTools, initialState, stageReducer } from './stageReducer'
import { StageToolbar } from './StageToolbar'

export const PAINT_OPTIONS: PaintOptions[] = [
  { id: DrawTools.Select, label: 'Select', icon: AdsClickOutlinedIcon, disabled: false },
  { id: DrawTools.Rectangle, label: 'Rectangle', icon: Crop54Icon, disabled: false },
  { id: DrawTools.Circle, label: 'Circle', icon: CircleOutlinedIcon, disabled: true },
  { id: DrawTools.Brush, label: 'Free Draw', icon: GestureOutlinedIcon, disabled: true },
  { id: DrawTools.Arrow, label: 'Arrow', icon: ArrowOutwardOutlinedIcon, disabled: true },
  { id: DrawTools.Eraser, label: 'Eraser', icon: AdUnitsOutlinedIcon, disabled: true },
]

type PaintOptions = {
  id: DrawTools
  label: string
  icon: ElementType
  color?: string
  disabled: boolean
}

type AppDrawerStageProps = {
  images: ImageWithRects[]
  selectedImage: ImageWithRects | null
  onSetSelectedImage: (image: ImageWithRects) => void
  onUpdateImageRects: (updatedImage: ImageWithRects) => void
  onSetExportFunction: (exportFn: (exportType: 'image' | 'yolo') => Promise<Blob | void>) => void
}

export const AppDrawerStage = memo(function AppDrawerStage({
  images,
  selectedImage,
  onUpdateImageRects,
  onSetExportFunction,
  onSetSelectedImage,
}: AppDrawerStageProps) {
  const [stageState, dispatch] = useReducer(stageReducer, initialState)
  const { classItems } = useDrawerContext()
  const { showSnackbar } = useSnackbar()
  const konvaCanvasRef = useRef<KonvaCanvasHandle>(null)

  const exportAnnotations = useCallback(
    async (exportType: 'image' | 'yolo'): Promise<Blob | void> => {
      if (!selectedImage) {
        showSnackbar('No image selected to export.')
        return
      }

      if (exportType === 'image') {
        const dataUri = konvaCanvasRef.current?.exportStage()
        if (dataUri) {
          downloadURI({
            uri: dataUri,
            name: `annotated_${selectedImage?.image.src.split('/').pop() || 'image'}`,
          })
          showSnackbar('Image successfully exported!')
          return
        }
        showSnackbar('Could not export image.')
        return
      }

      const annotationFiles: File[] = []

      images.forEach((img) => {
        if (img.rects.length > 0) {
          const imageFileName = img.image.src.split('/').pop()?.split('.')[0] || `image_${img.id}`
          const yoloContent = formatToYolo(img.rects, classItems, {
            width: img.image.width,
            height: img.image.height,
          })
          if (yoloContent) {
            annotationFiles.push(createTextFile(yoloContent, `${imageFileName}.txt`))
          }
        }
      })

      if (annotationFiles.length === 0) {
        showSnackbar('No annotated rectangles found for export in YOLO format')
        return
      }

      const allOriginalImageFiles = images.map((img) => img.originalFile)
      const filesToZip = [...annotationFiles, ...allOriginalImageFiles]

      const blob = await zipFiles(filesToZip, 'yolo_annotations.zip')
      showSnackbar('YOLO notes successfully exported as ZIP!')
      return blob
    },
    [selectedImage, images, classItems, showSnackbar]
  )

  useEffect(() => {
    onSetExportFunction(exportAnnotations)
  }, [onSetExportFunction, exportAnnotations])

  return (
    <AnimatedGridStyled
      variants={slideInFromLeft}
      container
      spacing={0.5}
      flexDirection={'column'}
      flexGrow={1}
      overflow={'hidden'}
      size={{ xs: 12, sm: 12, md: 9, lg: 9 }}
      sx={{
        width: '100%',
        display: 'flex',
        padding: 0,
      }}
    >
      <GridStyled
        sx={{
          borderRadius: '0 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
        flexGrow={3}
      >
        <StageToolbar
          paintOptions={PAINT_OPTIONS}
          currentTool={stageState.currentTool}
          dispatch={dispatch}
          isImageSelected={!!selectedImage}
        />
        <KonvaCanvas
          ref={konvaCanvasRef}
          dispatch={dispatch}
          stageState={stageState}
          selectedImage={selectedImage}
          onUpdateImageRects={onUpdateImageRects}
        />
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
        <ImageCarousel
          images={images}
          selectedImage={selectedImage}
          onSetSelectedImage={onSetSelectedImage}
        />
      </GridStyled>
    </AnimatedGridStyled>
  )
})
