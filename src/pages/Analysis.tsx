import { AppStepper } from '@/components/analysis/AppStepper'
import { AnalysisProvider } from '@/contexts/AnalysisContext'

const AnalysisPage = () => {
  return (
    <AnalysisProvider>
      <AppStepper />
    </AnalysisProvider>
  )
}

export default AnalysisPage
