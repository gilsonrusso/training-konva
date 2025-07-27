import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import App from './App'
import Loading from './layout/commons/Loading'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const TrainingHistoryPage = lazy(() => import('./pages/TrainingHistory'))
const NewRequirementsPage = lazy(() => import('./pages/NewRequirements'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<Loading />}>
            <AnalysisPage />
          </Suspense>
        ),
        index: true,
      },
      {
        path: '/new-requirements',
        element: (
          <Suspense fallback={<Loading />}>
            <NewRequirementsPage />
          </Suspense>
        ),
      },
      {
        path: '/training-history',
        element: (
          <Suspense fallback={<Loading />}>
            <TrainingHistoryPage />
          </Suspense>
        ),
      },
    ],
  },
])
