import { AxiosError, type AxiosInstance } from 'axios'
import { AuthService } from '../services/authService'

export function setInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    function (config) {
      console.log('[Request]', config.method?.toUpperCase(), config.url)

      const token = sessionStorage.getItem('authToken')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    function (error) {
      // Faz alguma coisa com o erro da requisição
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    function (response) {
      console.log('[Response]', response.status, response.config.url)
      return response
    },
    (error: AxiosError) => {
      console.error('[Axios Error]', error.message)

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
