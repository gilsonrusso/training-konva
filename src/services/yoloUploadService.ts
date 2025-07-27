// src/services/yoloUploadService.ts
import { abortManager } from '@/lib/abortManager'
import { api } from '@/lib/axios'
import axios from 'axios'

// --- Tipagens para as Respostas da API ---

export interface YoloAnalysisStartResponse {
  id: string
  status: 'analyzing'
  date_initialized: string
  message?: string
}

export interface ImageAnalysisStatus {
  name: string
  status: 'pass' | 'failed'
  imageSrc?: string
}

export interface YoloAnalysisStatusResponse {
  id: string
  status: 'analyzing' | 'pass' | 'failed'
  img?: ImageAnalysisStatus[]
  error_message?: string
}

// Tipagens para os novos endpoints (derivadas dos seus mocks)
export type AvailableRequirement = string // Seus requisitos são strings

export interface CreatedListItem {
  id_: string
  name: string
}

export interface FetchedCreatedList {
  id: string
  name: string
  requirements: CreatedListItem[]
}

const YOLO_REQUEST_ID = 'yolo-analysis-upload'
// Você pode definir IDs para outras requisições se precisar de controle de abort
const REQUIREMENTS_REQUEST_ID = 'fetch-requirements'
const LISTS_REQUEST_ID = 'fetch-lists'

export const YoloService = {
  // Renomeado para um nome mais genérico se for lidar com mais do que apenas YOLO
  /**
   * Inicia o processo de upload e análise YOLO.
   * Recebe um objeto FormData já preenchido com todos os dados necessários.
   * A responsabilidade de criar e preencher o FormData é do componente chamador.
   * @param formData O objeto FormData completo para ser enviado.
   * @returns Promise com o ID da análise e o status inicial.
   */
  startYoloAnalysis: async (formData: FormData): Promise<YoloAnalysisStartResponse> => {
    // Cancela qualquer requisição YOLO anterior de UPLOAD em andamento
    abortManager.abort(YOLO_REQUEST_ID)

    // Obtém o AbortController para a nova requisição
    const controller = abortManager.create(YOLO_REQUEST_ID)

    try {
      const response = await api.post<YoloAnalysisStartResponse>(
        '/api/yolo/upload-and-analyze', // Endpoint para iniciar a análise (Assumindo que este é o endpoint correto da API real)
        formData,
        {
          signal: controller,
          headers: {
            'Content-Type': 'multipart/form-data', // <--- Isso era explícito aqui!
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            console.log(`Upload de ZIP para YOLO: ${percentCompleted}%`)
          },
        }
      )
      return response.data
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        console.log('Requisição de início de análise YOLO cancelada pelo AbortManager.')
        throw new Error('Análise YOLO cancelada.')
      } else if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erro de rede ou API ao iniciar análise YOLO.'
        console.error('Erro Axios ao iniciar análise YOLO:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao iniciar análise YOLO:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao iniciar análise YOLO:', error)
        throw new Error('Ocorreu um erro inesperado.')
      }
    }
  },

  /**
   * Busca o status de uma análise YOLO em andamento ou concluída.
   * @param analysisId O ID da análise retornado por `startYoloAnalysis`.
   * @returns Promise com o status atual da análise e, se concluída, o relatório final (`img`).
   */
  getAnalysisStatus: async (analysisId: string): Promise<YoloAnalysisStatusResponse> => {
    try {
      const response = await api.get<YoloAnalysisStatusResponse>(`/api/yolo/status/${analysisId}`)
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erro de rede ou API ao buscar status da análise.'
        console.error(`Erro Axios ao buscar status da análise ${analysisId}:`, error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao buscar status da análise:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao buscar status da análise:', error)
        throw new Error('Ocorreu um erro inesperado ao buscar status da análise.')
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

  /**
   * Busca todas as listas de requisitos criadas.
   * @returns Promise com um array de objetos FetchedCreatedList.
   */
  getCreatedLists: async (): Promise<FetchedCreatedList[]> => {
    abortManager.abort(LISTS_REQUEST_ID)
    const controller = abortManager.create(LISTS_REQUEST_ID)

    try {
      const response = await api.get<FetchedCreatedList[]>('/api/lists', {
        signal: controller, // Opcional: passa o signal se usar abortManager
      })
      console.log('API: Listas criadas buscadas com sucesso.')
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Erro ao buscar listas criadas.'
        console.error('Erro ao buscar listas criadas:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao buscar listas criadas:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao buscar listas criadas:', error)
        throw new Error('Ocorreu um erro inesperado ao buscar listas criadas.')
      }
    }
  },
}
