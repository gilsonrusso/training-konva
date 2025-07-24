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
import type { FetchedCreatedList } from '../../../../types/requirements'

import JSZip from 'jszip'
import { useUnsavedChanges } from '../../../../contexts/UnsavedChangesContext'
import { AppDragAndDrop } from '../../DragAndDrop' // Verifique se o caminho está correto

interface AnalysisResult {
  success: boolean
  message: string
  data: any
}
export interface AppStepTwoHandles {
  analyzeImages: () => Promise<AnalysisResult> // Função para analisar e enviar
}
interface AppStepTwoProps {
  selectedList?: FetchedCreatedList | null
  onHasImagesChange: (hasImages: boolean) => void
}

export const AppStepTwo = forwardRef<AppStepTwoHandles, AppStepTwoProps>(function AppStepTwo(
  { selectedList, onHasImagesChange },
  ref
) {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { markAsDirty, markAsClean } = useUnsavedChanges()

  useImperativeHandle(ref, () => ({
    analyzeImages: handleAnalyzeAndSend,
  }))

  // Nova função para analisar e enviar dados
  const handleAnalyzeAndSend = async () => {
    if (imageFiles.length === 0) {
      console.error('Nenhuma imagem carregada para análise.')
      throw new Error('Nenhuma imagem para analisar.')
    }

    try {
      const zip = new JSZip()
      const folder = zip.folder('images') // Crie uma pasta dentro do zip para as imagens

      for (const file of imageFiles) {
        folder?.file(file.name, file) // Adicione cada arquivo à pasta
      }

      // Gere o ZIP como Blob e depois converta para Base64
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      // const zipBase64 = await new Promise<string>((resolve, reject) => {
      //   const reader = new FileReader()
      //   reader.onloadend = () => {
      //     if (typeof reader.result === 'string') {
      //       resolve(reader.result.split(',')[1]) // Pega apenas a parte Base64 (depois de "data:application/zip;base64,")
      //     } else {
      //       reject(new Error('Falha ao ler o arquivo ZIP como Base64.'))
      //     }
      //   }
      //   reader.onerror = reject
      //   reader.readAsDataURL(zipBlob)
      // })

      // Prepare a lista selecionada (se existir) como array de strings
      const listData = selectedList ? [selectedList.id] : [] // Exemplo: enviando apenas o ID

      const formData = new FormData()
      formData.append('arquivos', zipBlob, 'images.zip') // 'arquivos' é o nome do campo para o ZIP
      formData.append('list', JSON.stringify(listData)) // 'list' é o nome do campo para a lista, como JSON string

      // Simulando o envio para uma API
      console.log('Enviando dados para a API...')
      console.log('FormData (arquivos.name):', (formData.get('arquivos') as File).name)
      console.log('FormData (list):', formData.get('list'))

      // Substitua esta parte pela sua chamada real à API
      // Exemplo com fetch:
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) {
      //   throw new Error(`Erro na API: ${response.statusText}`);
      // }
      // const result = await response.json();
      // console.log('Resultado da API:', result);
      // return result;

      // Simulação de sucesso
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('Análise concluída com sucesso (simulado)!')

      const mockReportData = imageFiles.map((file, index) => ({
        id: `img-${file.name}-${index}`, // ID único para cada imagem
        imageSrc: URL.createObjectURL(file), // Cria uma URL temporária para a imagem
        title: `Relatório da Imagem: ${file.name}`,
        summary: `Esta imagem foi analisada com sucesso. Detecção de objetos: ${Math.floor(Math.random() * 5) + 1} objetos encontrados. Qualidade: ${Math.random() > 0.5 ? 'Boa' : 'Regular'}.`,
      }))

      return {
        success: true,
        message: 'Análise simulada concluída.',
        data: {
          overallSummary:
            'Resumo geral da análise de todas as imagens carregadas e processadas, indicando os resultados principais e quaisquer anomalias.',
          imageReports: mockReportData,
        },
      }
    } catch (error) {
      console.error('Erro ao analisar e enviar imagens:', error)
      throw error
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
      <Typography variant="h5" sx={{ mb: 2 }}>
        Passo 2: Anexar Imagens e Documentos
      </Typography>

      {/* Adicionando a exibição do selectedList */}
      {selectedList && (
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
          Lista Selecionada: {selectedList.name || selectedList.id}
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
