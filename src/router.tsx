import { createBrowserRouter } from 'react-router'

import App from './App'
import { DrawerPage } from './pages/Drawer'
import { Home } from './pages/Home'

export const router = createBrowserRouter([
  {
    path: '',
    element: <App />,
    children: [
      {
        path: '',
        element: <DrawerPage />,
        index: true,
      },
      {
        path: '/home',
        element: <Home />,
      },
    ],
  },
])
