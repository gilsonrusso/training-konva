// ClassColorInput.tsx
import { Box, Button, TextField, Typography, useTheme } from '@mui/material'
import { Sketch, hexToRgba } from '@uiw/react-color' // Importamos APENAS Sketch e hexToRgba
import React, { useState } from 'react'

// Interface para as propriedades que este componente pode receber
interface ClassColorInputProps {
  onSaveClass: (name: string, rgbaColor: string, solidBorderColor: string) => void
}

export const AppClassColorInput: React.FC<ClassColorInputProps> = ({ onSaveClass }) => {
  const [className, setClassName] = useState<string>('')
  // O estado 'currentHex' armazena a cor como uma string hexadecimal (incluindo alfa).
  // TypeScript inferirá o tipo como 'string'.
  const [currentHex, setCurrentHex] = useState<string>('#FF00004D') // #RRGGBBAA (Vermelho com 30% de alfa)

  const theme = useTheme()

  /**
   * Converte uma cor hexadecimal (com ou sem alfa) para uma string CSS 'rgba(r, g, b, a)'.
   * Usa o utilitário 'hexToRgba' da biblioteca para obter o objeto {r, g, b, a}.
   * O tipo de 'rgbaObj' será inferido pelo TypeScript como { r: number; g: number; b: number; a: number; }.
   * @param hexString A string de cor hexadecimal.
   * @returns A string RGBA formatada.
   */
  const formatHexToRgbaString = (hexString: string): string => {
    const rgbaObj = hexToRgba(hexString) // Converte HEX para um objeto RGBA
    const alpha = Math.max(0, Math.min(1, rgbaObj.a || 1)) // Garante que 'a' esteja entre 0 e 1
    return `rgba(${rgbaObj.r}, ${rgbaObj.g}, ${rgbaObj.b}, ${alpha})`
  }

  /**
   * Gera uma cor sólida (sem transparência) a partir de uma string hexadecimal.
   * Útil para bordas ou textos.
   * O tipo de 'rgbaObj' será inferido pelo TypeScript.
   * @param hexString A string de cor hexadecimal.
   * @returns A string RGB formatada.
   */
  const getSolidColorFromHex = (hexString: string): string => {
    const rgbaObj = hexToRgba(hexString) // Converte HEX para um objeto RGBA
    return `rgb(${rgbaObj.r}, ${rgbaObj.g}, ${rgbaObj.b})`
  }

  /**
   * Lida com o evento de salvamento da classe.
   * Valida o nome e chama a função onSaveClass passada via props.
   */
  const handleSave = () => {
    if (className.trim() === '') {
      alert('Por favor, insira um nome para a classe.')
      return
    }

    const rgbaColor = formatHexToRgbaString(currentHex) // Obtém a string RGBA do HEX atual
    const solidBorderColor = getSolidColorFromHex(currentHex) // Obtém a cor sólida do HEX atual

    onSaveClass(className.trim(), rgbaColor, solidBorderColor)

    // Limpa os campos após salvar
    setClassName('')
    setCurrentHex('#FF00004D') // Reseta a cor para o padrão (vermelho com 0.3 alfa)
  }

  return (
    <Box
      sx={{
        padding: theme.spacing(3),
        maxWidth: 400,
        margin: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: theme.shadows[3],
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Definir Nova Classe de Cor
      </Typography>

      <TextField
        label="Nome da Classe"
        variant="outlined"
        fullWidth
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        sx={{ mb: 2 }}
        autoFocus
      />

      <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
        Escolha a Cor:
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Sketch
          style={{ width: '100%' }}
          color={currentHex} // A prop 'color' do Sketch picker espera HEX ou HSVA
          onChange={(color) => {
            // Removida a tipagem explícita 'ColorResult'. TypeScript inferirá o tipo.
            // O objeto 'color' aqui é o resultado do evento onChange.
            // 'color.hex' é a string hexadecimal que precisamos para o estado.
            setCurrentHex(color.hex)
          }}
        />
      </Box>

      {/* Preview e Textos das Cores */}
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        **RGBA:**{' '}
        <span style={{ color: getSolidColorFromHex(currentHex), fontWeight: 'bold' }}>
          {formatHexToRgbaString(currentHex)}
        </span>
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        **Borda Sólida:**{' '}
        <span style={{ color: getSolidColorFromHex(currentHex), fontWeight: 'bold' }}>
          {getSolidColorFromHex(currentHex)}
        </span>
      </Typography>

      <Box
        sx={{
          width: 80,
          height: 40,
          backgroundColor: formatHexToRgbaString(currentHex),
          border: `2px solid ${getSolidColorFromHex(currentHex)}`,
          borderRadius: '4px',
          mb: 3,
          mx: 'auto',
        }}
      />

      <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
        Adicionar Classe
      </Button>
    </Box>
  )
}
