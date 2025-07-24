// src/components/ImageUploader/ImageUploader.tsx
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Button, Paper, styled, Typography, type PaperProps } from '@mui/material'
import React, { useCallback, useRef, useState } from 'react'

// Estilização para a área de drag-and-drop
const DropzoneContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.drag-active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  },
  minHeight: '150px', // Altura mínima para ser visível
}))

type AppDragAndDropProps = PaperProps & {
  /**
   * Função de callback que será chamada quando arquivos forem selecionados ou soltos.
   * @param files Uma lista de objetos File.
   */
  onFilesSelected: (files: FileList) => void
  /**
   * Texto a ser exibido na área de upload.
   * @default "Arraste e solte suas imagens aqui, ou clique para selecionar"
   */
  labelText?: string
  /**
   * Aceita apenas tipos de arquivo específicos (ex: "image/*", ".png,.jpg").
   * @default "image/*"
   */
  accept?: string
  /**
   * Permite múltiplos arquivos.
   * @default true
   */
  multiple?: boolean
}

export const AppDragAndDrop = ({
  onFilesSelected,
  labelText = 'Arraste e solte suas imagens aqui, ou clique para selecionar',
  accept = 'image/*',
  multiple = true,
  ...rest
}: AppDragAndDropProps) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault() // Necessário para permitir o drop
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragActive(false)
      const files = event.dataTransfer.files
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
    },
    [onFilesSelected]
  )

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        onFilesSelected(files)
      }
      // Limpa o valor do input para permitir o upload do mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFilesSelected]
  )

  const handleContainerClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <DropzoneContainer
      {...rest}
      className={isDragActive ? 'drag-active' : ''}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleContainerClick}
      elevation={isDragActive ? 3 : 1} // Elevação para feedback visual
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }} // Esconde o input de arquivo padrão
      />
      <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 0 }} />
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {labelText}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        (Formatos aceitos: JPG, PNG, etc.)
      </Typography>
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        sx={{ mt: 1 }}
        onClick={(e) => {
          // Evita que o clique no botão acione o container click duas vezes
          e.stopPropagation()
          fileInputRef.current?.click()
        }}
      >
        Selecionar Arquivos
      </Button>
    </DropzoneContainer>
  )
}
