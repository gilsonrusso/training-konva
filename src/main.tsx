import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router'
import { AppProvider } from './contexts/index.tsx'
import { router } from './router.tsx'

/**
 * @function enableMocking
 * @description Inicia o Mock Service Worker (MSW) apenas em ambiente de desenvolvimento.
 * Isso garante que suas requisições de rede sejam interceptadas por mocks durante o desenvolvimento,
 * sem afetar o comportamento em produção.
 * @returns {Promise<void>} Uma promessa que resolve quando o Service Worker é iniciado.
 */
async function enableMocking() {
  // Verifica se o ambiente de execução é 'development'.
  // 'process.env.NODE_ENV' é uma variável de ambiente definida por bundlers como Webpack/Vite.
  if (process.env.NODE_ENV !== 'development') {
    console.info('MSW: Ambiente de produção detectado. Mocking desativado.')
    return // Não inicia o MSW em produção
  }

  console.info('MSW: Ambiente de desenvolvimento detectado. Iniciando mocking...')
  // Importa dinamicamente o módulo do browser do MSW.
  // Isso garante que o código do MSW só seja carregado no ambiente de desenvolvimento.
  const { worker } = await import('./mocks/browser')

  // Inicia o Service Worker.
  // - 'onUnhandledRequest: "bypass"' instrui o MSW a ignorar requisições que não possuem handlers definidos,
  //   permitindo que essas requisições cheguem ao backend real.
  // - 'serviceWorker: { url: "/mockServiceWorker.js" }' especifica o caminho para o arquivo
  //   'mockServiceWorker.js' que foi gerado pelo comando `npx msw init`.
  //   Certifique-se de que este caminho corresponde à sua pasta pública (geralmente `public/`).
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

// Chama a função para habilitar o mocking.
// A aplicação React só é renderizada após o Service Worker ser iniciado (ou a Promise resolver).
enableMocking().then(() => {
  // Ponto de entrada da sua aplicação React.
  // Renderiza o componente principal dentro do StrictMode para verificações adicionais.
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </StrictMode>
  )
})
