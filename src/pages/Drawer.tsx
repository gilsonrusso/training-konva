import { Box, Grid, styled, type GridProps } from '@mui/material'
import { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AppDrawerPanel } from '../components/AppDrawerPanel'
import { AppDrawerStage } from '../components/AppDrawerStage'
import type { ImageWithRects } from '../types/Shapes'

const GridStyled = styled(Grid)<GridProps>(({ theme }) => ({
  height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${105}px)`,
}))

export const DrawerPage = () => {
  const [currentLabel, setCurrentLabel] = useState<string>('')
  const [images, setImages] = useState<ImageWithRects[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageWithRects | null>(null)

  const appDrawerExportRef = useRef<(() => void) | null>(null)

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

  // A função onExportClick agora chamará a função exposta pelo AppDrawer
  const onExportClick = () => {
    if (appDrawerExportRef.current) {
      appDrawerExportRef.current() // Chama a função de exportação do AppDrawer
    } else {
      alert('Nenhuma imagem para exportar ou o AppDrawer não está pronto.')
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
      <Grid container columns={12} spacing={2}>
        <Grid size={{ sm: 12, md: 3 }}></Grid>
        <Grid container marginTop={'-40px'} flexGrow={1} flexDirection={'row'}>
          {/* <Button variant="contained" disabled={!selectedImage} onClick={onExportClick}>
            Export
          </Button> */}
        </Grid>
      </Grid>
      <GridStyled container spacing={0.5} columns={12}>
        <AppDrawerPanel
          rects={selectedImage ? selectedImage.rects : []}
          currentLabel={currentLabel}
          onHandleCurrentLabel={setCurrentLabel}
          imageName={selectedImage?.image.src.split('/').pop()}
          onHandleExporting={onExportClick}
          onHandleUploading={handleImageUpload}
        />
        <AppDrawerStage
          selectedImage={selectedImage}
          onUpdateImageRects={handleUpdateImageRects}
          currentLabel={currentLabel}
          onSetCurrentLabel={setCurrentLabel}
          onSetExportFunction={(exportFn) => {
            appDrawerExportRef.current = exportFn
          }}
          images={images}
          onSetSelectedImage={setSelectedImage}
        />
      </GridStyled>
    </Box>
  )
}
