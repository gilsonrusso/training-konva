import { abortManager } from '@/lib/abortManager'
import { api } from '@/lib/axios'
import type { AnalysisListResponse } from '@/types/analysis'
import axios from 'axios'

// --- Tipos para o Serviço de ANÁLISE DE IMAGENS (/api/analyze-images) ---
// Este é o tipo de retorno para a análise que fornece um ID global
export interface ImageAnalysisReportResponse {
  success: boolean
  message: string
  id: string // <-- O ID de análise global que você precisa repassar
  data: ImageAnalysisReportData
}

export interface ImageAnalysisReportData {
  overallSummary: string
  imageReports: DetailedImageReport[]
}

export interface DetailedImageReport {
  id: string // ID da imagem individual dentro do relatório
  imageSrc: string
  title: string
  summary: string
  detectedObjects: DetectedObject[]
}

export interface DetectedObject {
  label: string
  confidence: number
}

// --- Tipos para o Serviço de NOVO TREINAMENTO (/api/yolo/upload-and-analyze) ---
// Este é o tipo de retorno para o início do treinamento (apenas mensagem, sem ID)
export type TrainingAnalysisStartResponse = {
  message: string
}

// --- Outros tipos existentes (mantidos para contexto) ---
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

// Definir IDs para outras requisições se precisar de controle de abort
const LISTS_REQUEST_ID = 'fetch-lists'
const CREATE_LIST = 'create-lists'
const PERFORM_ANALYSIS = 'perform-image-analysis'
const EDIT_LIST = 'edit-lists'

export const AnalysisService = {
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
   * Busca todas as listas de requisitos criadas.
   * @returns Promise com um array de objetos FetchedCreatedList.
   */
  getLists: async (): Promise<AnalysisListResponse[]> => {
    abortManager.abort(LISTS_REQUEST_ID)
    const controller = abortManager.create(LISTS_REQUEST_ID)

    try {
      const response = await api.get<AnalysisListResponse[]>('/api/lists', {
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

  createList: async (params: Omit<AnalysisListResponse, 'id'>): Promise<AnalysisListResponse> => {
    abortManager.abort(CREATE_LIST)
    const controller = abortManager.create(CREATE_LIST)

    try {
      const response = await api.post<AnalysisListResponse>('/api/lists', params, {
        signal: controller,
      })
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Erro ao criar lista.'
        console.error('Erro ao criar lista:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao criar lista:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao criar lista:', error)
        throw new Error('Ocorreu um erro inesperado ao criar lista.')
      }
    }
  },

  editList: async ({ id, ...params }: AnalysisListResponse): Promise<AnalysisListResponse> => {
    abortManager.abort(EDIT_LIST)
    const controller = abortManager.create(EDIT_LIST)

    try {
      const response = await api.put<AnalysisListResponse>(`/api/lists/${id}`, params, {
        signal: controller,
      })
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Erro ao criar lista.'
        console.error('Erro ao editar a lista:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao editar a lista:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao editar a lista:', error)
        throw new Error('Ocorreu um erro inesperado ao editar a lista.')
      }
    }
  },

  /**
   * Realiza a análise de imagens e retorna um relatório detalhado com um ID de análise global.
   * @param formData O FormData contendo as imagens e o nome da lista para análise.
   * @returns Uma Promise que resolve com o relatório detalhado da análise de imagens, incluindo um ID global.
   */
  performImageAnalysis: async (formData: FormData): Promise<ImageAnalysisReportResponse> => {
    abortManager.abort(PERFORM_ANALYSIS)
    const controller = abortManager.create(PERFORM_ANALYSIS)

    try {
      const response = await api.post<ImageAnalysisReportResponse>(
        '/api/analyze-images', // Endpoint para ANÁLISE DE IMAGENS com ID global
        formData,
        {
          signal: controller,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            console.log(`Upload de imagens para Análise Detalhada: ${percentCompleted}%`)
          },
        }
      )
      return response.data
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        console.log('Requisição de análise de imagens cancelada pelo AbortManager.')
        throw new Error('Análise de imagens cancelada.')
      } else if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erro de rede ou API ao realizar análise de imagens.'
        console.error('Erro Axios ao realizar análise de imagens:', error)
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error('Erro genérico ao realizar análise de imagens:', error.message)
        throw new Error(error.message)
      } else {
        console.error('Ocorreu um erro desconhecido ao realizar análise de imagens:', error)
        throw new Error('Ocorreu um erro inesperado ao realizar análise de imagens.')
      }
    }
  },
}
