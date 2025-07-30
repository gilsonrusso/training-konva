import { api } from '@/lib/axios'

export type TrainingAnalysisStartResponse = {
  message: string
}

export type AvailableRequirement = string

export const RequirementsServices = {
  startNewTraining: async (
    formData: FormData,
    signal?: AbortSignal
  ): Promise<TrainingAnalysisStartResponse> => {
    const response = await api.post<TrainingAnalysisStartResponse>(
      '/api/yolo/upload-and-analyze',
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
    return response.data
  },

  getAvailableRequirements: async (signal?: AbortSignal): Promise<AvailableRequirement[]> => {
    const response = await api.get<AvailableRequirement[]>('/api/requirements', { signal })
    return response.data
  },
}
