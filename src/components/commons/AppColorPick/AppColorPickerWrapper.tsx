// Exemplo de uso em um componente pai (ex: um novo arquivo como ClassManager.tsx)

import DeleteIcon from '@mui/icons-material/Delete'
import { Box, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material'
import React, { useState } from 'react'
import { AppClassColorInput } from './AppClassColorInput' // Importe o novo componente

interface ColorClass {
  name: string
  rgbaColor: string
  solidBorderColor: string
}

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ColorClass[]>([])

  const handleSaveNewClass = (name: string, rgbaColor: string, solidBorderColor: string) => {
    const newClass: ColorClass = { name, rgbaColor, solidBorderColor }
    setClasses((prevClasses) => [...prevClasses, newClass])
    console.log('Nova Classe Salva:', newClass)
  }

  const handleDeleteClass = (indexToDelete: number) => {
    setClasses((prevClasses) => prevClasses.filter((_, index) => index !== indexToDelete))
  }

  return (
    <Box sx={{ display: 'flex', gap: 4, p: 3 }}>
      {/* Coluna para adicionar nova classe */}
      <Box sx={{ flex: 1 }}>
        <AppClassColorInput onSaveClass={handleSaveNewClass} />
      </Box>

      {/* Coluna para exibir classes existentes */}
      <Box
        sx={{
          flex: 1,
          border: '1px solid #ddd',
          borderRadius: '8px',
          p: 2,
          maxHeight: 600,
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Classes Existentes
        </Typography>
        {classes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma classe adicionada ainda.
          </Typography>
        ) : (
          <List>
            {classes.map((cls, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClass(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  border: `1px solid ${cls.solidBorderColor}`,
                  borderRadius: '4px',
                  backgroundColor: cls.rgbaColor,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {cls.name}
                    </Typography>
                  }
                  secondary={`RGBA: ${cls.rgbaColor} | Borda: ${cls.solidBorderColor}`}
                  sx={{ color: '#000' }} // Pode ajustar para garantir contraste
                />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: cls.rgbaColor,
                    border: `1px solid ${cls.solidBorderColor}`,
                    borderRadius: '2px',
                    ml: 1,
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}
