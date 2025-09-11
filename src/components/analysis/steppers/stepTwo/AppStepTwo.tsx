import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useAnalysis } from '@/contexts/AnalysisContext'
import { useSnackbar } from '@/contexts/SnackBarContext'
import { AnalysisService } from '@/services/AnalysisServices'
import { AppDragAndDrop } from '@components/commons/DragAndDrop'
import { useUnsavedChanges } from '@contexts/UnsavedChangesContext'
import JSZip from 'jszip'

export interface AppStepTwoHandles {
  analyzeImages: () => Promise<void>
}
interface AppStepTwoProps {
  onHasImagesChange: (hasImages: boolean) => void
}

export const AppStepTwo = forwardRef<AppStepTwoHandles, AppStepTwoProps>(function AppStepTwo(
  { onHasImagesChange },
  ref
) {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { markAsDirty, markAsClean } = useUnsavedChanges()
  const { selectedLists, setCurrentAnalysisId } = useAnalysis()
  const { showSnackbar } = useSnackbar()

  useImperativeHandle(ref, () => ({
    analyzeImages: handleAnalyzeAndSend,
  }))

  const handleAnalyzeAndSend = async () => {
    try {
      const zip = new JSZip()

      for (const file of imageFiles) {
        const imageFileName = file.name.split('/').pop()?.split('.')[0]
        const imageFileExt = file.name.split('/').pop()?.split('.')[1]
        zip.file(`${imageFileName}.${imageFileExt}`, file)
      }

      // Gere o ZIP como Blob e depois converta para Base64
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // Prepare a lista selecionada como strings
      const listData = selectedLists.map((list) => list.name).join(',')

      const formData = new FormData()
      formData.append('arquivos', zipBlob, 'images.zip') // 'arquivos' é o nome do campo para o ZIP
      formData.append('list', JSON.stringify(listData)) // 'list' é o nome do campo para a lista, como JSON string

      const response = await AnalysisService.performImageAnalysis(formData)

      console.log('::::respnse', { response })

      setCurrentAnalysisId(response.id)

      showSnackbar('Análise concluída com sucesso (simulado)!')
    } catch (error) {
      showSnackbar('Erro ao analisar e enviar imagens', 'error')
      console.error('Erro ao analisar e enviar imagens:', error)
    }
  }

  const handleFileUpload = (files: FileList) => {
    if (files) {
      const fileArray = Array.from(files)
      const imageFileArray = fileArray.filter((f) => f.type.startsWith('image/'))

      setImageFiles((prev) => [...prev, ...imageFileArray])

      if (imageFileArray.length > 0 && !selectedFileName) {
        handleViewImageFile(imageFileArray[0])
      }
    }
  }

  const handleViewImageFile = (file: File) => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage)
    }
    setPreviewImage(URL.createObjectURL(file))
    setSelectedFileName(file.name)
  }

  const handleClearSelection = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage)
    }
    setPreviewImage(null)
    setSelectedFileName(null)
  }

  const handleDeleteImage = (indexToDelete: number) => {
    setImageFiles((prevImageFiles) => {
      const newImageFiles = prevImageFiles.filter((_, index) => index !== indexToDelete)

      if (prevImageFiles[indexToDelete]?.name === selectedFileName) {
        handleClearSelection()
      }
      return newImageFiles
    })
  }

  useEffect(() => {
    const hasImagesLoaded = imageFiles.length > 0
    onHasImagesChange(hasImagesLoaded)
    // Marca como modificado se houver imagens carregadas e não estiverem limpas
    if (hasImagesLoaded) {
      markAsDirty()
    } else {
      markAsClean() // Se não há imagens, não há mudanças não salvas relacionadas a imagens
    }
  }, [imageFiles, markAsClean, markAsDirty, onHasImagesChange])

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  return (
    <Box>
      {/* Adicionando a exibição do selectedList */}
      {selectedLists.length > 0 && (
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
          Lista Selecionada: {selectedLists.map((item) => item.name).join(', ')}
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppDragAndDrop
            onFilesSelected={handleFileUpload}
            labelText="Arraste e solte suas imagens aqui, ou clique para selecionar"
            accept="image/*"
            multiple={true}
            sx={{ maxHeight: 150, minHeight: 120 }} // Controlando a altura do uploader
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Arquivos Carregados ({imageFiles.length})
          </Typography>
          {/* Tabela com scroll */}
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 250, // Altura máxima para ativar o scroll
              overflowY: 'auto', // Habilita o scroll vertical
              minHeight: 150, // Garante que a tabela tenha uma altura mínima
            }}
          >
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Arquivo</TableCell>
                  <TableCell>Tamanho</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {imageFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum arquivo carregado.
                    </TableCell>
                  </TableRow>
                ) : (
                  imageFiles.map((file, index) => (
                    <TableRow key={file.name + index}>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                      <TableCell>{file.type}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => handleViewImageFile(file)}>
                            Visualizar
                          </Button>
                          <IconButton
                            aria-label="delete"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          {previewImage && (
            <Paper
              elevation={3}
              sx={{
                p: 1,
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '100%',
                maxHeight: 400,
                overflow: 'hidden',
              }}
            >
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
})
