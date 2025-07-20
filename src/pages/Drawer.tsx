import { Box, Grid, styled, type GridProps } from '@mui/material'
import { createContext, useContext, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AppDrawerPanel } from '../components/AppDrawerPanel'
import { AppDrawerStage } from '../components/AppDrawerStage'
import { useSnackbar } from '../contexts/SnackBarContext'
import type { ImageWithRects } from '../types/Shapes'

const GridStyled = styled(Grid)<GridProps>(({ theme }) => ({
  height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${105}px)`,
}))

type DeleteRectangleProps = {
  imageId: string
  rectId: string
}

type DrawerContextType = {
  selectedImage: ImageWithRects | null
  classItemSelected: number
  classItems: string[]
  images: ImageWithRects[]
  handleSetClassItem: (valuer: number) => void
  handleAddClassItem: (value: string) => void
  handleDeleteClassItem: (value: number) => void
  handlerDeleteRectangle: ({ imageId, rectId }: DeleteRectangleProps) => void
}

const DrawerContext = createContext({} as DrawerContextType)

export const DrawerPage = () => {
  const [images, setImages] = useState<ImageWithRects[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageWithRects | null>(null)

  const [classItemSelected, setClassItemSelected] = useState<number>(-1)
  const [classItems, setClassItems] = useState<string[]>([])

  const appDrawerExportRef = useRef<(() => void) | null>(null)

  const { showMessage } = useSnackbar()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const id = uuidv4()
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const newImage: ImageWithRects = { id, image: img, rects: [] }
        setImages((prev) => [...prev, newImage])
        setSelectedImage(newImage)
      }
      img.onerror = (err) => {
        console.error('Erro ao carregar a imagem:', err)
        alert('Não foi possível carregar a imagem.')
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
        setSelectedImage(newImg)
        return newImg
      }
      return img
    })
    setImages(newImagesArr)
  }

  const handleAddClassItem = (value: string) => {
    const valueSanitized = value.trim().toLowerCase()

    const foundIndex = classItems.findIndex((item) => item === valueSanitized)
    if (foundIndex !== -1) return

    const newClassItems = [...classItems]
    newClassItems.push(valueSanitized)

    setClassItems(newClassItems)
  }

  const handleDeleteClassItem = (index: number) => {
    const newClassItems = [...classItems]

    if (index === classItemSelected) {
      setClassItemSelected(-1)
    }

    newClassItems.splice(index, 1)

    setClassItems(newClassItems)
  }

  const handleSetClassItem = (index: number) => {
    setClassItemSelected((prev) => (prev === index ? -1 : index))
  }

  // A função onExportClick agora chamará a função exposta pelo AppDrawer
  const onExportClick = () => {
    if (appDrawerExportRef.current) {
      appDrawerExportRef.current() // Chama a função de exportação do AppDrawer
    } else {
      showMessage('Nenhuma imagem para exportar ou o AppDrawer não está pronto.')
    }
  }

  // Função que o AppDrawer chamará para atualizar os retângulos de uma imagem
  const handleUpdateImageRects = (updatedImage: ImageWithRects) => {
    setImages((prevImages) =>
      prevImages.map((img) => (img.id === updatedImage.id ? updatedImage : img))
    )
    // É crucial atualizar o selectedImage aqui para que o AppDrawer re-renderize
    // com os novos retângulos, já que selectedImage é uma prop para ele.
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
          <AppDrawerPanel onHandleExporting={onExportClick} onHandleUploading={handleImageUpload} />
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
