// src/components/steppers/stepThree/AppReportStep.tsx
import { Box, Chip, Grid, Typography } from '@mui/material'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import { useEffect, useState } from 'react'
import { TestAccordionWithCards } from '../../AppAccordion'

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export type TestDetail = {
  name: string
  status: 'pass' | 'fail'
}

export type Testcase = {
  id: number
  label: string[]
  image: string
  test: TestDetail[]
}

export type ListItem = {
  id: number
  testcase: Testcase[]
}

export type RootObject = {
  id: number
  title: string
  status: 'Pass' | 'Fail'
  list: ListItem[]
}

const mock: RootObject = {
  id: 1,
  title: `delectus aut autem 1`,
  status: 'Pass',
  list: Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    testcase: [
      {
        id: i + 1,
        label: [`label-${i + 1}-a`, `label-${i + 1}-b`],
        image: `./home.jpg`,
        test: [
          {
            name: `label-${i + 1}-a`,
            status: i % 2 === 0 ? 'pass' : 'fail',
          },
          {
            name: `label-${i + 1}-b`,
            status: i % 3 === 0 ? 'fail' : 'pass',
          },
        ],
      },
    ],
  })),
}

export const mockData: RootObject[] = Array.from({ length: 5 }, (_, i) => ({
  ...mock,
  id: i + 1,
  title: `delectus aut autem ${i + 1}`,
}))

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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

  // const handleScrollToAccordion = (id: number) => {
  //   const element = document.getElementById(`accordion-${id}`)
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  //   }
  // }

  const handleScrollToCard = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
  // if (!reportData) {
  //   return (
  //     <Box
  //       sx={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         height: '100%',
  //         minHeight: 200,
  //       }}
  //     >
  //       <CircularProgress />
  //       <Typography variant="h6" sx={{ ml: 2 }}>
  //         Carregando relatório...
  //       </Typography>
  //     </Box>
  //   )
  // }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Relatório de Análise
      </Typography>

      <Grid container spacing={2}>
        {/* Painel de Navegação (Lista) */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Navegação do Relatório
            </Typography>
            <SimpleTreeView sx={{ maxHeight: '70vh', flexGrow: 1, overflowY: 'auto' }}>
              {mockData.map((root) => (
                <TreeItem
                  key={root.id}
                  itemId={root.id.toString()}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {root.title}
                      </Typography>
                      <Chip
                        label={root.status}
                        color={root.status === 'Pass' ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                >
                  {root.list.map((listItem) =>
                    listItem.testcase.map((test) => (
                      <TreeItem
                        key={test.id}
                        itemId={`${root.id}-${test.id}`}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {test.label.join(' / ')}
                            </Typography>
                            <Chip
                              label={test.test.some((t) => t.status === 'fail') ? 'Fail' : 'Pass'}
                              color={
                                test.test.some((t) => t.status === 'fail') ? 'error' : 'success'
                              }
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        onClick={() => handleScrollToCard(`card-${root.id}-${test.id}`)}
                      />
                    ))
                  )}
                </TreeItem>
              ))}
            </SimpleTreeView>
          </Grid>

          {/* Acordeões do Relatório */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box
              sx={{
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              <TestAccordionWithCards data={mockData} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
