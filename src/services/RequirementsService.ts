import { api } from '@/lib/axios'
import { type AxiosResponse } from 'axios'

export type TrainingAnalysisStartResponse = {
  message: string
}

export type AvailableRequirement = string

export const RequirementsServices = {
  startNewTraining: async (
    formData: FormData,
    signal?: AbortSignal
  ): Promise<AxiosResponse<TrainingAnalysisStartResponse>> => {
    return api.post<TrainingAnalysisStartResponse>(
      '/api/yolo/upload-and-analyze', // Endpoint para NOVO TREINAMENTO
      formData,
      {
        signal,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          console.log(`Upload para Treinamento YOLO: ${percentCompleted}%`)
        },
      }
    )
  },
  getAvailableRequirements: async (
    signal?: AbortSignal
  ): Promise<AxiosResponse<AvailableRequirement[]>> => {
    return api.get<AvailableRequirement[]>('/api/requirements', { signal })
  },
}

//  if (axios.isAxiosError(error)) {
//         const errorMessage =
//           error.response?.data?.message || error.message || 'Erro ao buscar requisitos disponíveis.'
//         console.error('Erro ao buscar requisitos disponíveis:', error)
//         throw new Error(errorMessage)
//       } else if (error instanceof Error) {
//         console.error('Erro genérico ao buscar requisitos disponíveis:', error.message)
//         throw new Error(error.message)
//       } else {
//         console.error('Ocorreu um erro desconhecido ao buscar requisitos disponíveis:', error)
//         throw new Error('Ocorreu um erro inesperado ao buscar requisitos disponíveis.')
//       }
