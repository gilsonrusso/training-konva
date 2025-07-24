import { styled, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper, { type StepperProps } from '@mui/material/Stepper'
import { useCallback, useRef, useState } from 'react'
import { useSnackbar } from '../../contexts/SnackBarContext'
import { useUnsavedChanges } from '../../contexts/UnsavedChangesContext'
import type { FetchedCreatedList } from '../../types/requirements'
import { AppStepOne } from './steppers/stepOne/AppStepOne'
import { AppReportStep } from './steppers/stepThree/AppStepThree'
import { AppStepTwo, type AppStepTwoHandles } from './steppers/stepTwo/AppStepTwo'

const steps = ['Select or Create a list', 'Upload Images', 'Report']

export const StepperStyled = styled(Stepper)<StepperProps>(() => ({
  // backgroundColor: theme.palette.background.paper,
}))

export const AppStepper = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedListFromStep1, setSelectedListFromStep1] = useState<FetchedCreatedList | null>(
    null
  )
  const [stepTwoHasImages, setStepTwoHasImages] = useState(false)
  const appStepTwoRef = useRef<AppStepTwoHandles>(null)

  const [analysisReportData, setAnalysisReportData] = useState<any>(null)

  const { showSnackbar } = useSnackbar()
  const { markAsClean } = useUnsavedChanges()

  const theme = useTheme()

  const handleNext = async () => {
    if (activeStep === 1) {
      if (appStepTwoRef.current) {
        if (!appStepTwoRef.current) {
          showSnackbar('Por favor, carregue pelo menos uma imagem para análise.', 'warning')
          return
        }
        try {
          const analysisResult = await appStepTwoRef.current.analyzeImages()
          console.log('Resultado da análise:', analysisResult)
          showSnackbar('Análise concluída com sucesso!', 'success')

          // TODO MOCK RESULT
          setAnalysisReportData(analysisResult.data)

          markAsClean()
          setActiveStep((prevActiveStep) => prevActiveStep + 1)
        } catch (error) {
          showSnackbar(
            `Erro na análise: ${error instanceof Error ? error.message : String(error)}`,
            'error'
          )
          return
        }
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedListFromStep1(null)
    setStepTwoHasImages(false)
    markAsClean()
  }

  const handleListSelected = (list: FetchedCreatedList | null) => {
    setSelectedListFromStep1(list)
    showSnackbar(`Lista "${list?.name}" selecionada.`, 'info')
  }

  const handleStepTwoHasImagesChange = useCallback((hasImages: boolean) => {
    setStepTwoHasImages(hasImages)
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 75px)`,
        overflowY: 'hidden',
      }}
    >
      <StepperStyled activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {}
          const labelProps: {
            optional?: React.ReactNode
          } = {}
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          )
        })}
      </StepperStyled>

      <>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeStep === 0 && (
            <AppStepOne
              onListSelected={handleListSelected}
              selectedListIdForStepper={selectedListFromStep1?.id || null}
            />
          )}
          {activeStep === 1 && (
            <AppStepTwo
              selectedList={selectedListFromStep1}
              ref={appStepTwoRef}
              onHasImagesChange={handleStepTwoHasImagesChange}
            />
          )}
          {activeStep === 2 && ( // Renderiza o AppReportStep no Passo 3
            <AppReportStep reportData={analysisReportData} />
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={[0, 2].includes(activeStep)}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />

          {activeStep === steps.length - 1 ? ( // Se for o último passo (index 2)
            <Button onClick={handleReset}>Finalizar</Button> // Este botão reseta todo o fluxo
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (activeStep === 1 && !stepTwoHasImages) ||
                (activeStep === 0 && !selectedListFromStep1)
              }
            >
              {activeStep === 1 ? 'Analisar' : 'Próximo'}
            </Button>
          )}
        </Box>
      </>
    </Box>
  )
}
