import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import App from './App'
import Loading from './components/layout/Loading'

const HomePage = lazy(() => import('./pages/Home'))
const ListPage = lazy(() => import('./pages/List'))
const TrainingPage = lazy(() => import('./pages/Training'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
        index: true,
      },
      {
        path: '/list',
        element: (
          <Suspense fallback={<Loading />}>
            <ListPage />
          </Suspense>
        ),
      },
      {
        path: '/training',
        element: (
          <Suspense fallback={<Loading />}>
            <TrainingPage />
          </Suspense>
        ),
      },
    ],
  },
])
