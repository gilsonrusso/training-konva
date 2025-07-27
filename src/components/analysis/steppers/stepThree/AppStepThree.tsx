// src/components/steppers/stepThree/AppReportStep.tsx
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

// Define o tipo para os dados de cada relatório de imagem
interface ImageReport {
  id: string // Para a key prop, importante para listas em React
  imageSrc: string // URL da imagem (pode ser blob:url ou uma URL comum)
  title: string // Título da imagem
  summary: string // Resumo textual abaixo da imagem
}

// Define o tipo para os dados gerais do relatório que este componente receberá
export interface AnalysisReportData {
  overallSummary: string // Um resumo geral da análise
  imageReports: ImageReport[] // Um array com os relatórios de cada imagem
}

interface AppReportStepProps {
  reportData: AnalysisReportData | null // Os dados do relatório a serem exibidos
}

export const AppReportStep = ({ reportData }: AppReportStepProps) => {
  // Estado para gerenciar URLs de objetos para limpeza.
  // Isso é crucial para evitar vazamentos de memória ao usar URL.createObjectURL.
  const [, setObjectUrls] = useState<string[]>([])

  useEffect(() => {
    // Coleta todas as URLs de objetos que foram criadas para visualização de imagem.
    // Filtra apenas as que começam com 'blob:' ou 'data:' para garantir que são URLs criadas localmente.
    const urls =
      reportData?.imageReports
        .map((report) => report.imageSrc)
        .filter((src) => src.startsWith('blob:') || src.startsWith('data:')) || []
    setObjectUrls(urls)

    // Função de limpeza: revoga todas as URLs de objetos quando o componente é desmontado
    // ou quando o 'reportData' muda (indicando que novas URLs podem ter sido criadas).
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      setObjectUrls([]) // Limpar o estado também
    }
  }, [reportData]) // Este efeito roda sempre que 'reportData' muda

  // Exibe um indicador de carregamento se os dados do relatório ainda não estiverem disponíveis
  if (!reportData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: 200,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Carregando relatório...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Relatório de Análise
      </Typography>

      {/* Exibe um resumo geral da análise */}
      <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic' }}>
        {reportData.overallSummary}
      </Typography>

      {/* Grid para organizar os cartões de imagem */}
      <Grid
        container
        columns={12}
        spacing={2}
        justifyContent="flex-start"
        sx={{ overflowY: 'auto', maxHeight: '500px', padding: 2 }}
      >
        {reportData.imageReports.length === 0 ? (
          // Mensagem exibida se não houver imagens no relatório
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" color="textSecondary" align="center">
              Nenhuma imagem analisada encontrada no relatório.
            </Typography>
          </Grid>
        ) : (
          // Mapeia sobre o array de relatórios de imagem e renderiza um Card para cada um
          reportData.imageReports.map((report) => (
            <Grid size={{ xs: 12, sm: 4, md: 2 }} key={report.id}>
              <Card sx={{ maxWidth: 345, height: '100%', margin: 'auto' }}>
                <CardMedia
                  component="img"
                  height="194"
                  src="/images/example.jpg"
                  //   image={report.imageSrc}
                  alt={report.title}
                  sx={{ objectFit: 'contain', padding: '10px' }}
                />
                {/* Conteúdo do cartão com título e resumo */}
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.summary}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  )
}
