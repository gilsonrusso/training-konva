import { RequirementsServices } from '@/services/RequirementsService'
import { AppDrawerPanel } from '@components/requirements/AppDrawerPanel'
import { AppDrawerStage } from '@components/requirements/AppDrawerStage'
import { Grid, styled } from '@mui/material'
import { green } from '@mui/material/colors'
import saveAs from 'file-saver'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { RANDOM_RGBA_COLORS, RANDOM_SOLID_COLORS } from '../constants/rgbaOptions'
import { useSnackbar } from '../contexts/SnackBarContext'
import type { ClassDefinition, ImageWithRects } from '../types/Shapes'

export const GridStyledTest = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 8px)`,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('md')]: {
    backgroundColor: theme.palette.secondary.main,
  },
  [theme.breakpoints.up('md')]: {
    backgroundColor: theme.palette.primary.main,
  },
  [theme.breakpoints.up('lg')]: {
    backgroundColor: green[500],
  },
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

const NewRequirementsPage = () => {
  const [images, setImages] = useState<ImageWithRects[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageWithRects | null>(null)

  const [classItemSelected, setClassItemSelected] = useState<number>(-1)
  const [classItems, setClassItems] = useState<ClassDefinition[]>([])

  const appDrawerExportRef = useRef<
    ((exportType: 'image' | 'yolo') => Promise<Blob | void>) | null
  >(null)

  const { showSnackbar } = useSnackbar()

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])

      if (files.length === 0) {
        showSnackbar('No image selected to upload.')
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
          const newImage: ImageWithRects = { id, image: img, rects: [], originalFile: file }
          newImagesArray.push(newImage)
          loadedCount++

          // When all images are loaded, update the states
          if (loadedCount === files.length) {
            setImages(newImagesArray)
            // Sets the first image as selected by default
            if (newImagesArray.length > 0) {
              setSelectedImage(newImagesArray[0])
            }
            showSnackbar(`${loadedCount} imagem(ns) carregada(s) com sucesso!`)
          }
        }
        img.onerror = (err) => {
          console.error('Erro ao carregar a imagem:', err)
          showSnackbar('Não foi possível carregar uma ou mais imagens.')
          loadedCount++
          if (loadedCount === files.length) {
            setImages(newImagesArray)
            if (newImagesArray.length > 0) {
              setSelectedImage(newImagesArray[0])
            }
          }
        }
      })
    },
    [showSnackbar, setImages, setSelectedImage]
  )

  const handlerDeleteRectangle = useCallback(
    ({ imageId, rectId }: DeleteRectangleProps) => {
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
      showSnackbar('Rectangle removed!')
    },
    [images, selectedImage, setImages, setSelectedImage, showSnackbar]
  )

  const handleAddClassItem = useCallback(
    ({ name }: AddClassItemProps) => {
      const valueSanitized = name.trim().toLowerCase()

      const foundIndex = classItems.find((item) => item.name === valueSanitized)
      if (foundIndex) {
        showSnackbar(`Class name: ${name} already exists.`)
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
      showSnackbar(`Classe "${name}" add with success!`)
    },
    [classItems, showSnackbar, setClassItems, setClassItemSelected]
  )

  const handleDeleteClassItem = useCallback(
    (classIdToDelete: number) => {
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
      showSnackbar('All tags using this class have all been removed.')
    },
    [
      classItemSelected,
      classItems,
      selectedImage,
      setClassItems,
      setImages,
      setSelectedImage,
      showSnackbar,
    ]
  )

  const handleSetClassItem = useCallback(
    (classIdToSelect: number) => {
      // Toggles selection: clicking on it deselects it
      setClassItemSelected((prev) => (prev === classIdToSelect ? -1 : classIdToSelect))
    },
    [setClassItemSelected]
  )

  const onExportClick = useCallback(
    (exportType: 'image' | 'yolo') => {
      if (appDrawerExportRef.current) {
        // Here, we just fire off the export and wait for it to handle the download (for PNG)
        // or just generate the blob (for YOLO, if the download is done elsewhere)
        appDrawerExportRef.current(exportType).then((blob) => {
          // If it's YOLO and generated a blob, and you WANT TO DOWNLOAD IT HERE TOO:
          if (blob instanceof Blob && exportType === 'yolo') {
            const zipFileName = 'yolo_annotations.zip'
            saveAs(blob, zipFileName) // Necessário importar saveAs para isso
            showSnackbar('YOLO notes downloaded successfully!')
          }
        })
      } else {
        showSnackbar('The export system is not ready.')
      }
    },
    [showSnackbar]
  )

  const handleResetStates = () => {
    setImages([])
    setClassItems([])
    setSelectedImage(null)
    setClassItemSelected(-1)
  }

  const handleStartTraining = useCallback(async () => {
    if (!images || images.length === 0) {
      showSnackbar('Please upload images to start training.')
      return
    }
    if (classItems.length === 0) {
      showSnackbar('Please add classeName before starting training.')
      return
    }
    if (!appDrawerExportRef.current) {
      showSnackbar('The export system is not ready for training.')
      return
    }

    showSnackbar('Starting training process and preparing files for upload...', 'info')

    try {
      // 1. Gerar as anotações YOLO E as imagens (conforme sua indicação, o appDrawerExportRef.current('yolo') já faz isso)
      const yoloZipBlob = await appDrawerExportRef.current('yolo')

      if (!yoloZipBlob) {
        showSnackbar('No YOLO annotations or images generated for training.', 'warning') // Alterado para warning
        return
      }

      const currentTrainingListNames = classItems.map((cl) => cl.name).join(',')

      // 2. Criar um objeto FormData (NOVA RESPONSABILIDADE AQUI)
      const formData = new FormData()

      // 3. Adicionar o Blob ZIP (que contém YOLO e Imagens) ao FormData
      // O nome do arquivo no FormData é importante para o backend.
      formData.append('arquivos', yoloZipBlob, 'yolo_training_data.zip')
      formData.append('list_names', currentTrainingListNames)

      // 4. Upload the ZIP file to the upload service
      const uploadResponse = await RequirementsServices.startNewTraining(formData)

      showSnackbar(
        `Training started! Upload completed. Analysis ID: ${uploadResponse.message}`,
        'success'
      )
      console.log('Upload response for training:', uploadResponse)

      // Here you can add additional logic, such as:
      // - Mark the training as "in progress"
      // - Redirect to a progress page
      // - Store the upload ID to check the status
    } catch (error: unknown) {
      console.error('Error starting training or uploading:', error)
      if (error instanceof Error) {
        showSnackbar(`Error starting training: ${error.message}`)
      } else if (typeof error === 'string') {
        showSnackbar(`Error starting training: ${error}`)
      } else {
        showSnackbar('Error starting training: An unknown error occurred.')
      }
    } finally {
      handleResetStates()
    }
  }, [classItems, images, showSnackbar])

  // Function that AppDrawer will call to update the rectangles of an image
  const handleUpdateImageRects = useCallback(
    (updatedImage: ImageWithRects) => {
      setImages((prevImages) =>
        prevImages.map((img) => (img.id === updatedImage.id ? updatedImage : img))
      )
      // It's crucial to update the selectedImage here so that AppDrawer re-renders
      // with the new rectangles, since selectedImage is a prop for it.
      if (selectedImage && selectedImage.id === updatedImage.id) {
        setSelectedImage(updatedImage)
      }
    },
    [selectedImage]
  )

  const drawerContextValue = useMemo(
    () => ({
      classItems,
      classItemSelected,
      selectedImage,
      images,
      handleAddClassItem,
      handleSetClassItem,
      handleDeleteClassItem,
      handlerDeleteRectangle,
    }),
    [
      classItemSelected,
      classItems,
      handleAddClassItem,
      handleDeleteClassItem,
      handleSetClassItem,
      handlerDeleteRectangle,
      images,
      selectedImage,
    ]
  )

  return (
    <DrawerContext value={drawerContextValue}>
      <GridStyledTest container spacing={0.5} columns={12} sx={{ backgroundColor: 'purple' }}>
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
      </GridStyledTest>
    </DrawerContext>
  )
}

export const useDrawerContext = () => useContext(DrawerContext)
export default NewRequirementsPage

//  <Grid container columns={12}>
//       <GridStyled size={{ xs: 4, sm: 4, md: 3 }} sx={{ backgroundColor: 'blue' }}>
//         Sidebar
//       </GridStyled>
//       <GridStyled
//         container
//         size={{ xs: 8, sm: 8, md: 9 }}
//         sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'purple' }}
//       >
//         <Grid sx={{ backgroundColor: 'white' }}>
//           <Typography gutterBottom>Analysis Page</Typography>
//         </Grid>
//         <Grid flexGrow={1} sx={{ backgroundColor: 'darkgreen', minHeight: '300px' }}>
//           <Box>
//             <Typography variant="h6" gutterBottom>
//               Analysis Content Goes Here
//             </Typography>
//           </Box>
//         </Grid>
//         <Grid sx={{ backgroundColor: 'gray', maxHeight: '170px' }}>
//           <Typography variant="body1" gutterBottom>
//             Additional content or components can be added here.
//           </Typography>
//         </Grid>
//       </GridStyled>
//     </Grid>
