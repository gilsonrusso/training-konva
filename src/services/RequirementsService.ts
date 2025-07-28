import { abortManager } from '@/lib/abortManager'
import { api } from '@/lib/axios'
import axios from 'axios'

export type TrainingAnalysisStartResponse = {
  message: string
}

export type AvailableRequirement = string

// Definir IDs para outras requisições se precisar de controle de abort
const REQUIREMENTS_REQUEST_ID = 'fetch-requirements'
const CREATE_TRAINING = 'create-training-analysis'

export const RequirementsServices = {
  /**
   * Inicia um novo processo de treinamento YOLO enviando imagens e dados de classes/requisitos.
   * Espera um retorno simples de sucesso (status 201 Created) sem um ID.
   * @param formData O FormData contendo os arquivos de treinamento (imagens, yolo txt, classes).
   * @returns Uma Promise que resolve com uma mensagem de sucesso.
   */
  startNewTraining: async (formData: FormData): Promise<TrainingAnalysisStartResponse> => {
    abortManager.abort(CREATE_TRAINING)
    const controller = abortManager.create(CREATE_TRAINING)

    try {
      const response = await api.post<TrainingAnalysisStartResponse>(
        '/api/yolo/upload-and-analyze', // Endpoint para NOVO TREINAMENTO
        formData,
        {
          signal: controller,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            console.log(`Upload para Treinamento YOLO: ${percentCompleted}%`)
          },
        }
      )
      return response.data
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        console.log('Requisição de treinamento YOLO cancelada pelo AbortManager.')
        throw new Error('Treinamento YOLO cancelado.')
      } else if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erro de rede ou API ao iniciar treinamento YOLO.'
        console.error('Erro Axios ao iniciar treinamento YOLO:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao iniciar treinamento YOLO:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao iniciar treinamento YOLO:', error)
        throw new Error('Ocorreu um erro inesperado.')
      }
    }
  },

  /**
   * Busca a lista de nomes de requisitos disponíveis.
   * @returns Promise com um array de strings representando os nomes dos requisitos.
   */
  getAvailableRequirements: async (): Promise<AvailableRequirement[]> => {
    // Você pode usar abortManager aqui também se quiser cancelar requisições pendentes
    abortManager.abort(REQUIREMENTS_REQUEST_ID)
    const controller = abortManager.create(REQUIREMENTS_REQUEST_ID)

    try {
      const response = await api.get<AvailableRequirement[]>('/api/requirements', {
        signal: controller, // Opcional: passa o signal se usar abortManager
      })
      console.log('API: Requisitos disponíveis buscados com sucesso.')
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Erro ao buscar requisitos disponíveis.'
        console.error('Erro ao buscar requisitos disponíveis:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao buscar requisitos disponíveis:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao buscar requisitos disponíveis:', error)
        throw new Error('Ocorreu um erro inesperado ao buscar requisitos disponíveis.')
      }
    }
  },
}
