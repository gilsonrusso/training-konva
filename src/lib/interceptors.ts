import { AxiosError, type AxiosInstance } from 'axios'
import { AuthService } from '../services/authService' // Certifique-se de que o caminho está correto

export function setInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    function (config) {
      console.log('[Request]', config.method?.toUpperCase(), config.url)

      const token = localStorage.getItem('authToken')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Dispara um evento customizado para mostrar o loading
      // Este evento pode ser "escutado" pelo seu componente Loading
      window.dispatchEvent(new CustomEvent('loading:show'))

      return config
    },
    function (error) {
      // Dispara um evento customizado para esconder o loading em caso de erro na requisição (antes de ser enviada)
      window.dispatchEvent(new CustomEvent('loading:hide'))
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    function (response) {
      console.log('[Response]', response.status, response.config.url)
      // Dispara um evento customizado para esconder o loading em caso de sucesso na resposta
      window.dispatchEvent(new CustomEvent('loading:hide'))
      return response
    },
    (error: AxiosError) => {
      // console.error('[Axios Error]', error.message)
      // Dispara um evento customizado para esconder o loading em caso de erro na resposta
      window.dispatchEvent(new CustomEvent('loading:hide'))

      if (error instanceof Error && error.name === 'CanceledError') {
        console.warn('Requisição cancelada')
        return
      }

      if (error.response?.status === 401) {
        console.warn('Não autorizado — redirecionando ou limpando sessão')
        AuthService.logout()
      }

      if (error.response) {
        console.error('Erro com resposta do servidor:', error.response.data)
      } else if (error.request) {
        console.error('Sem resposta do servidor')
      } else {
        console.error('Erro ao configurar a requisição')
      }

      return Promise.reject(error)
    }
  )
}
