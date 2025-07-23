import { styled, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper, { type StepperProps } from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { FetchedCreatedList } from '../../types/requirements'
import { AppStepOne } from './steppers/stepOne/AppStepOne'
import { AppStepTwo } from './steppers/stepTwo/AppStepTwo'

const steps = ['Select or Create a list', 'Upload Images', 'Report']

export const StepperStyled = styled(Stepper)<StepperProps>(() => ({
  // backgroundColor: theme.palette.background.paper,
}))

export const AppStepper = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [skipped, setSkipped] = useState(new Set<number>())
  const [selectedListFromStep1, setSelectedListFromStep1] = useState<FetchedCreatedList | null>(
    null
  )

  const theme = useTheme()

  const isStepOptional = (step: number) => {
    return step === 1
  }

  const isStepSkipped = (step: number) => {
    return skipped.has(step)
  }

  const handleNext = () => {
    let newSkipped = skipped
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values())
      newSkipped.delete(activeStep)
    }

    if (activeStep === 0 && !selectedListFromStep1) {
      alert('Por favor, selecione uma lista para prosseguir para o próximo passo.')
      return
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped(newSkipped)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.")
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values())
      newSkipped.add(activeStep)
      return newSkipped
    })
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedListFromStep1(null)
  }

  const handleListSelected = (list: FetchedCreatedList | null) => {
    if (!list) return
    setSelectedListFromStep1(list)
  }

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
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {}
          const labelProps: {
            optional?: React.ReactNode
          } = {}
          if (isStepOptional(index)) {
            labelProps.optional = <Typography variant="caption">Optional</Typography>
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          )
        })}
      </StepperStyled>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, height: '100%' }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {activeStep === 0 && (
              <AppStepOne
                onListSelected={handleListSelected}
                selectedListIdForStepper={selectedListFromStep1?.id || null}
              />
            )}
            {activeStep === 1 && <AppStepTwo selectedList={selectedListFromStep1} />}
            {activeStep === 2 && <Typography>Conteúdo do Passo 3</Typography>}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
