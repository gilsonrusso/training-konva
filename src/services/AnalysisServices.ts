import { api } from '@/lib/axios'

export interface AnalysisListResponse {
  id: string
  name: string
  requirements: string[]
}

export interface ImageAnalysisReportResponse {
  success: boolean
  message: string
  id: string
  data: ImageAnalysisReportData
}

export interface ImageAnalysisReportData {
  overallSummary: string
  imageReports: DetailedImageReport[]
}

export interface DetailedImageReport {
  id: string
  imageSrc: string
  title: string
  summary: string
  detectedObjects: DetectedObject[]
}

export interface DetectedObject {
  label: string
  confidence: number
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

export const AnalysisService = {
  getAnalysisStatus: async (
    analysisId: string,
    signal?: AbortSignal
  ): Promise<YoloAnalysisStatusResponse> => {
    const response = await api.get<YoloAnalysisStatusResponse>(`/api/yolo/status/${analysisId}`, {
      signal,
    })
    return response.data
  },

  getLists: async (signal?: AbortSignal): Promise<AnalysisListResponse[]> => {
    const response = await api.get<AnalysisListResponse[]>('/api/lists', { signal })
    return response.data
  },

  createList: async (payload: {
    name: string
    requirements: string[]
  }): Promise<AnalysisListResponse> => {
    const response = await api.post<AnalysisListResponse>('/api/lists', payload)
    return response.data
  },

  editList: async (payload: {
    id: string
    name: string
    requirements: string[]
  }): Promise<AnalysisListResponse> => {
    const response = await api.put<AnalysisListResponse>(`/api/lists/${payload.id}`, payload)
    return response.data
  },

  deleteList: async (payload: { id: string }): Promise<void> => {
    await api.delete<void>(`/api/lists/${payload.id}`)
  },

  performImageAnalysis: async (
    formData: FormData,
    signal?: AbortSignal
  ): Promise<ImageAnalysisReportResponse> => {
    const response = await api.post<ImageAnalysisReportResponse>('/api/analyze-images', formData, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        )
        console.log(`Upload de imagens para Análise Detalhada: ${percentCompleted}%`)
      },
    })
    return response.data
  },
}
