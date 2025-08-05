// src/components/commons/ImageUploadProgress.tsx
import { Box, LinearProgress, Paper, Typography } from '@mui/material'
import { memo } from 'react'

// Tipo para rastrear o status de cada arquivo
export type ImageUploadStatus = {
  file: File
  status: 'loading' | 'success' | 'error'
}

type ImageUploadProgressProps = {
  uploadStatus: ImageUploadStatus[]
}

export const ImageUploadProgress = memo(function ImageUploadProgress({
  uploadStatus,
}: ImageUploadProgressProps) {
  if (!uploadStatus || uploadStatus.length === 0) {
    return null
  }

  const totalImages = uploadStatus.length
  const loadedCount = uploadStatus.filter(
    (s) => s.status === 'success' || s.status === 'error'
  ).length
  const progress = totalImages > 0 ? (loadedCount / totalImages) * 100 : 0 // Previne divisão por zero
  const isUploading = loadedCount < totalImages

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: 300,
        padding: 2,
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {isUploading ? 'Carregando Imagens...' : 'Carregamento Concluído!'}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {`Processando ${loadedCount} de ${totalImages} arquivos...`}
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
      </Box>
      {/* <List dense>
        {uploadStatus.map((statusItem, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {statusItem.status === 'loading' && <CloudUploadIcon color="primary" />}
              {statusItem.status === 'success' && <CheckCircleIcon color="success" />}
              {statusItem.status === 'error' && <ErrorIcon color="error" />}
            </ListItemIcon>
            <ListItemText
              primary={statusItem.file.name}
              secondary={
                statusItem.status === 'loading'
                  ? 'Carregando...'
                  : statusItem.status === 'success'
                    ? 'Concluído'
                    : 'Falha ao carregar'
              }
            />
          </ListItem>
        ))}
      </List> */}
    </Paper>
  )
})
