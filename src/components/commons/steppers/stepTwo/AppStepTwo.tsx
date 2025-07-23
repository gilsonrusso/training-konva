import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import * as React from 'react'
import { useEffect } from 'react'
import type { FetchedCreatedList } from '../../../../types/requirements'

const VisuallyHiddenInput = styled('input')({
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

interface AppStepTwoProps {
  selectedList?: FetchedCreatedList | null
}
export const AppStepTwo = ({ selectedList }: AppStepTwoProps) => {
  const [yoloFiles, setYoloFiles] = React.useState<File[]>([])
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const [selectedYoloFileContent, setSelectedYoloFileContent] = React.useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null)

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'yolo' | 'image'
  ) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      if (fileType === 'yolo') {
        setYoloFiles((prev) => [
          ...prev,
          ...fileArray.filter((f) => f.name.toLowerCase().endsWith('.txt')),
        ])
      } else {
        setImageFiles((prev) => [
          ...prev,
          ...fileArray.filter((f) =>
            ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some((ext) =>
              f.name.toLowerCase().endsWith(`.${ext}`)
            )
          ),
        ])
      }
      event.target.value = ''
    }
  }

  const handleViewYoloFile = async (file: File) => {
    setSelectedFileName(file.name)
    try {
      const content = await file.text()
      setSelectedYoloFileContent(content)

      // Tenta encontrar uma imagem correspondente pelo nome (ignorando a extensão)
      const baseFileName = file.name.split('.').slice(0, -1).join('.')
      const correspondingImage = imageFiles.find(
        (img) => img.name.split('.').slice(0, -1).join('.') === baseFileName
      )
      if (correspondingImage) {
        setPreviewImage(URL.createObjectURL(correspondingImage))
      } else {
        setPreviewImage(null)
      }
    } catch (error) {
      console.error('Erro ao ler arquivo YOLO:', error)
      setSelectedYoloFileContent('Erro ao carregar o conteúdo do arquivo.')
      setPreviewImage(null)
    }
  }

  const handleViewImageFile = (file: File) => {
    setSelectedFileName(file.name)
    setSelectedYoloFileContent(null)
    setPreviewImage(URL.createObjectURL(file))
  }

  const handleClearSelection = () => {
    setPreviewImage(null)
    setSelectedYoloFileContent(null)
    setSelectedFileName(null)
  }
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Configuração de Dados YOLO
      </Typography>

      {selectedList && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color="primary">
            Lista Selecionada do Passo Anterior: {selectedList.name}
          </Typography>
          <Typography variant="body2">
            Requisitos: {selectedList.requirements.map((req) => req.name).join(', ')}
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
          Upload Arquivos YOLO (.txt)
          <VisuallyHiddenInput
            type="file"
            multiple
            accept=".txt"
            onChange={(e) => handleFileUpload(e, 'yolo')}
          />
        </Button>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
          Upload Imagens (.jpg, .png, etc.)
          <VisuallyHiddenInput
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
          />
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Coluna para as listas de arquivos */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Arquivos YOLO Carregados ({yoloFiles.length})
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Arquivo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {yoloFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      Nenhum arquivo YOLO carregado.
                    </TableCell>
                  </TableRow>
                ) : (
                  yoloFiles.map((file, index) => (
                    <TableRow key={file.name + index}>
                      {' '}
                      {/* Usar file.name + index como key para unicidade */}
                      <TableCell>{file.name}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleViewYoloFile(file)}>
                          Visualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Imagens Carregadas ({imageFiles.length})
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome da Imagem</TableCell>
                  <TableCell align="right">Ações</TableCell>{' '}
                  {/* Adicionada coluna para ações da imagem */}
                </TableRow>
              </TableHead>
              <TableBody>
                {imageFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      Nenhuma imagem carregada.
                    </TableCell>
                  </TableRow>
                ) : (
                  imageFiles.map((file, index) => (
                    <TableRow key={file.name + index}>
                      <TableCell>{file.name}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleViewImageFile(file)}>
                          Visualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Visualização: {selectedFileName || 'Nenhum arquivo selecionado'}
          </Typography>
          {selectedFileName && (
            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <Button size="small" onClick={handleClearSelection}>
                Limpar Visualização
              </Button>
            </Box>
          )}

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

          {selectedYoloFileContent && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                flexGrow: 1,
                overflowY: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: 300,
              }}
            >
              <Typography variant="body2">{selectedYoloFileContent}</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
