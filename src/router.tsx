import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { checkAuth } from './components/auth/authUtils'
import Loading from './layout/commons/Loading'
import Login from './pages/Login'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const TrainingHistoryPage = lazy(() => import('./pages/TrainingHistory'))
const NewRequirementsPage = lazy(() => import('./pages/NewRequirements'))

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    loader: () => checkAuth({ requireAuth: false, redirectPath: '/' }),
  },
  {
    path: '/',
    element: <App />,
    loader: () => checkAuth({ requireAuth: true, redirectPath: '/login' }),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <AnalysisPage />
          </Suspense>
        ),
      },
      {
        path: 'new-requirements',
        element: (
          <Suspense fallback={<Loading />}>
            <NewRequirementsPage />
          </Suspense>
        ),
      },
      {
        path: 'training-history',
        element: (
          <Suspense fallback={<Loading />}>
            <TrainingHistoryPage />
          </Suspense>
        ),
      },
    ],
  },
])
