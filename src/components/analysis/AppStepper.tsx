import { styled, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper, { type StepperProps } from '@mui/material/Stepper'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAnalysis } from '../../contexts/AnalysisContext'
import { useSnackbar } from '../../contexts/SnackBarContext'
import { useUnsavedChanges } from '../../contexts/UnsavedChangesContext'
import { AppStepOne } from './steppers/stepOne/AppStepOne'
import { AppReportStep, type AnalysisReportData } from './steppers/stepThree/AppStepThree'
import { AppStepTwo, type AppStepTwoHandles } from './steppers/stepTwo/AppStepTwo'

const steps = ['Select or Create a list', 'Upload Images', 'Report']

export const StepperStyled = styled(Stepper)<StepperProps>(() => ({
  // backgroundColor: theme.palette.background.paper,
}))

export const AppStepper = () => {
  const [activeStep, setActiveStep] = useState(0)

  const [stepTwoHasImages, setStepTwoHasImages] = useState(false)
  const appStepTwoRef = useRef<AppStepTwoHandles>(null)

  const [analysisReportData, setAnalysisReportData] = useState<AnalysisReportData | null>(null)

  const { showSnackbar } = useSnackbar()
  const { markAsClean } = useUnsavedChanges()
  // Use o hook para acessar o contexto de requisitos
  const {
    selectedListForAppStepper,
    selectListForAppStepper,
    getAvailableRequirementsNames,
    getListAvailableRequirementsList,
  } = useAnalysis()

  const theme = useTheme()

  const handleNext = useCallback(async () => {
    if (activeStep === 1) {
      // Se estiver no passo 2 (index 1), tentar analisar
      if (appStepTwoRef.current) {
        try {
          const result = await appStepTwoRef.current.analyzeImages()
          if (result.success) {
            setAnalysisReportData(result.data) // Armazena os dados do relatório
            setActiveStep((prevActiveStep) => prevActiveStep + 1) // Avança para o passo de relatório
            showSnackbar('Análise concluída com sucesso!', 'success')
          } else {
            showSnackbar(`Erro na análise: ${result.message}`, 'error')
          }
        } catch (error: unknown) {
          console.error('Error starting training or uploading:', error)
          if (error instanceof Error) {
            showSnackbar(`Error starting training: ${error.message}`)
          } else if (typeof error === 'string') {
            showSnackbar(`Error starting training: ${error}`)
          } else {
            showSnackbar('Error starting training: An unknown error occurred.')
          }
        }
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }, [activeStep, showSnackbar])

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    // Reinicie os estados do stepper
    selectListForAppStepper(null) // Deseleciona a lista no contexto
    setStepTwoHasImages(false)
    setAnalysisReportData(null)
    markAsClean() // Marcar como limpo
  }

  const handleStepTwoHasImagesChange = useCallback((hasImages: boolean) => {
    setStepTwoHasImages(hasImages)
  }, [])

  useEffect(() => {
    getAvailableRequirementsNames()
    getListAvailableRequirementsList()
  })

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
          {activeStep === 0 && <AppStepOne />}
          {activeStep === 1 && (
            <AppStepTwo
              selectedList={selectedListForAppStepper}
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
                (activeStep === 0 && !selectedListForAppStepper)
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
