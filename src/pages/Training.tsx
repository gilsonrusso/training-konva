import { Box, Grid, styled, type GridProps } from '@mui/material'
import saveAs from 'file-saver'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AppDrawerPanel } from '../components/AppDrawerPanel'
import { AppDrawerStage } from '../components/AppDrawerStage'
import { RANDOM_RGBA_COLORS, RANDOM_SOLID_COLORS } from '../constants/rgbaOptions'
import { useSnackbar } from '../contexts/SnackBarContext'
import { yoloUploadService } from '../services/yoloUploadService'
import type { ClassDefinition, ImageWithRects } from '../types/Shapes'

const GridStyled = styled(Grid)<GridProps>(({ theme }) => ({
  height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${105}px)`,
}))

type DeleteRectangleProps = {
  imageId: string
  rectId: string
}
type AddClassItemProps = {
  name: string
}

type DrawerContextType = {
  selectedImage: ImageWithRects | null
  classItemSelected: number
  classItems: ClassDefinition[]
  images: ImageWithRects[]
  handleSetClassItem: (classId: number) => void
  handleAddClassItem: ({ name }: AddClassItemProps) => void
  handleDeleteClassItem: (classId: number) => void
  handlerDeleteRectangle: ({ imageId, rectId }: DeleteRectangleProps) => void
}

const DrawerContext = createContext({} as DrawerContextType)

const TrainingPage = () => {
  const [images, setImages] = useState<ImageWithRects[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageWithRects | null>(null)

  const [classItemSelected, setClassItemSelected] = useState<number>(-1)
  const [classItems, setClassItems] = useState<ClassDefinition[]>([])

  const appDrawerExportRef = useRef<
    ((exportType: 'image' | 'yolo') => Promise<Blob | void>) | null
  >(null)

  const { showMessage } = useSnackbar()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) {
      showMessage('No image selected to upload.')
      return
    }

    // Clear selection and rectangles when loading new images
    setSelectedImage(null)
    setImages([])

    let loadedCount = 0
    const newImagesArray: ImageWithRects[] = []

    files.forEach((file) => {
      const id = uuidv4()
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const newImage: ImageWithRects = { id, image: img, rects: [] }
        newImagesArray.push(newImage)
        loadedCount++

        // When all images are loaded, update the states
        if (loadedCount === files.length) {
          setImages(newImagesArray)
          // Sets the first image as selected by default
          if (newImagesArray.length > 0) {
            setSelectedImage(newImagesArray[0])
          }
          showMessage(`${loadedCount} imagem(ns) carregada(s) com sucesso!`)
        }
      }
      img.onerror = (err) => {
        console.error('Erro ao carregar a imagem:', err)
        showMessage('Não foi possível carregar uma ou mais imagens.')
        loadedCount++
        if (loadedCount === files.length) {
          setImages(newImagesArray)
          if (newImagesArray.length > 0) {
            setSelectedImage(newImagesArray[0])
          }
        }
      }
    })
  }

  const handlerDeleteRectangle = ({ imageId, rectId }: DeleteRectangleProps) => {
    const newImagesArr = images.map((img) => {
      if (img.id === imageId) {
        const newImg = {
          ...img,
          rects: img.rects.filter(({ id }) => id !== rectId),
        }
        // Updates selectedImage if it is the image being edited
        if (selectedImage && selectedImage.id === imageId) {
          setSelectedImage(newImg)
        }
        return newImg
      }
      return img
    })
    setImages(newImagesArr)
    showMessage('Rectangle removed!')
  }

  const handleAddClassItem = useCallback(
    ({ name }: AddClassItemProps) => {
      const valueSanitized = name.trim().toLowerCase()

      const foundIndex = classItems.find((item) => item.name === valueSanitized)
      if (foundIndex) {
        showMessage(`Class name: ${name} already exists.`)
      }

      const newClassId = classItems.length > 0 ? Math.max(...classItems.map((c) => c.id)) + 1 : 0

      // Lógica para selecionar uma cor aleatória
      const randomRgbaIndex = Math.floor(Math.random() * RANDOM_RGBA_COLORS.length)
      const randomSolidIndex = Math.floor(Math.random() * RANDOM_SOLID_COLORS.length)

      const rgbaColor = RANDOM_RGBA_COLORS[randomRgbaIndex]
      const solidBorderColor = RANDOM_SOLID_COLORS[randomSolidIndex]

      const newClass: ClassDefinition = {
        id: newClassId,
        name: valueSanitized,
        rgbaColor,
        solidBorderColor,
      }

      setClassItems((prev) => [...prev, newClass])
      setClassItemSelected(newClassId)
      showMessage(`Classe "${name}" add with success!`)
    },
    [classItems, showMessage]
  )

  const handleDeleteClassItem = (classIdToDelete: number) => {
    if (classItemSelected === classIdToDelete) {
      setClassItemSelected(-1) // Desseleciona se a classe ativa for removida
    }

    const newClassItems = classItems.filter((item) => item.id !== classIdToDelete)
    setClassItems(newClassItems)

    // Remove retângulos associados à classe deletada de todas as imagens
    setImages((prevImages) =>
      prevImages.map((img) => {
        const updatedRects = img.rects.filter((rect) => rect.classId !== classIdToDelete)
        const updatedImage = { ...img, rects: updatedRects }
        // Atualiza selectedImage se for a imagem afetada
        if (selectedImage && selectedImage.id === img.id) {
          setSelectedImage(updatedImage)
        }
        return updatedImage
      })
    )
    showMessage('All tags using this class have all been removed.')
  }

  const handleSetClassItem = (classIdToSelect: number) => {
    // Toggles selection: clicking on it deselects it
    setClassItemSelected((prev) => (prev === classIdToSelect ? -1 : classIdToSelect))
  }

  const onExportClick = (exportType: 'image' | 'yolo') => {
    if (appDrawerExportRef.current) {
      // Here, we just fire off the export and wait for it to handle the download (for PNG)
      // or just generate the blob (for YOLO, if the download is done elsewhere)
      appDrawerExportRef.current(exportType).then((blob) => {
        // If it's YOLO and generated a blob, and you WANT TO DOWNLOAD IT HERE TOO:
        if (blob instanceof Blob && exportType === 'yolo') {
          const zipFileName = 'yolo_annotations.zip'
          saveAs(blob, zipFileName) // Necessário importar saveAs para isso
          showMessage('YOLO notes downloaded successfully!')
        }
      })
    } else {
      showMessage('The export system is not ready.')
    }
  }

  const handleStartTraining = async () => {
    if (!images || images.length === 0) {
      showMessage('Please upload images to start training.')
      return
    }
    if (classItems.length === 0) {
      showMessage('Please add annotation classes before starting training.')
      return
    }
    if (!appDrawerExportRef.current) {
      showMessage('The export system is not ready for training.')
      return
    }

    showMessage('Starting training process...')

    try {
      // 1. Generate YOLO annotations (ZIP Blob)
      const yoloZipBlob = await appDrawerExportRef.current('yolo')

      if (!yoloZipBlob) {
        showMessage('No YOLO annotations generated for training.')
        return
      }

      // 2. Create a File object from the Blob
      const yoloZipFile = new File([yoloZipBlob], 'yolo_annotations.zip', {
        type: 'application/zip',
      })

      // 3. Upload the ZIP file to the upload service
      // Note: the service expects an array of Files.
      const uploadResponse = await yoloUploadService.uploadYOLOAnnotations({ files: [yoloZipFile] })

      showMessage(`Training started! Upload completed: ${uploadResponse.message}`)
      console.log('Upload response for training:', uploadResponse)

      // Here you can add additional logic, such as:
      // - Mark the training as "in progress"
      // - Redirect to a progress page
      // - Store the upload ID to check the status
    } catch (error: unknown) {
      console.error('Error starting training or uploading:', error)
      if (error instanceof Error) {
        showMessage(`Error starting training: ${error.message}`)
      } else if (typeof error === 'string') {
        showMessage(`Error starting training: ${error}`)
      } else {
        showMessage('Error starting training: An unknown error occurred.')
      }
    }
  }

  // Function that AppDrawer will call to update the rectangles of an image
  const handleUpdateImageRects = (updatedImage: ImageWithRects) => {
    setImages((prevImages) =>
      prevImages.map((img) => (img.id === updatedImage.id ? updatedImage : img))
    )
    // It's crucial to update the selectedImage here so that AppDrawer re-renders
    // with the new rectangles, since selectedImage is a prop for it.
    if (selectedImage && selectedImage.id === updatedImage.id) {
      setSelectedImage(updatedImage)
    }
  }

  return (
    <Box>
      <DrawerContext
        value={{
          classItems,
          classItemSelected,
          selectedImage,
          images,
          handleAddClassItem,
          handleSetClassItem,
          handleDeleteClassItem,
          handlerDeleteRectangle,
        }}
      >
        <GridStyled container spacing={0.5} columns={12}>
          <AppDrawerPanel
            onHandleExporting={onExportClick}
            onHandleUploading={handleImageUpload}
            onStartTraining={handleStartTraining}
          />
          <AppDrawerStage
            selectedImage={selectedImage}
            onUpdateImageRects={handleUpdateImageRects}
            onSetExportFunction={(exportFn) => {
              appDrawerExportRef.current = exportFn
            }}
            images={images}
            onSetSelectedImage={setSelectedImage}
          />
        </GridStyled>
      </DrawerContext>
    </Box>
  )
}

export const useDrawerContext = () => useContext(DrawerContext)
export default TrainingPage
