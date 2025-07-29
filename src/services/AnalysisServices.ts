import { api } from '@/lib/axios'
import { type AxiosResponse } from 'axios'

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
  ): Promise<AxiosResponse<YoloAnalysisStatusResponse>> => {
    return api.get<YoloAnalysisStatusResponse>(`/api/yolo/status/${analysisId}`, { signal })
  },

  getLists: async (signal?: AbortSignal): Promise<AxiosResponse<AnalysisListResponse[]>> => {
    return api.get<AnalysisListResponse[]>('/api/lists', { signal })
  },

  createList: async (
    params: Omit<AnalysisListResponse, 'id'>,
    signal?: AbortSignal
  ): Promise<AxiosResponse<AnalysisListResponse>> => {
    return api.post<AnalysisListResponse>('/api/lists', params, { signal })
  },

  editList: async (
    { id, ...params }: AnalysisListResponse,
    signal?: AbortSignal
  ): Promise<AxiosResponse<AnalysisListResponse>> => {
    return api.put<AnalysisListResponse>(`/api/lists/${id}`, params, { signal })
  },
  deleteList: async (
    { id }: { id: string },
    signal?: AbortSignal
  ): Promise<AxiosResponse<void>> => {
    return api.delete(`/api/lists/${id}`, { signal })
  },

  performImageAnalysis: async (
    formData: FormData,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ImageAnalysisReportResponse>> => {
    return api.post<ImageAnalysisReportResponse>('/api/analyze-images', formData, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        )
        console.log(`Upload de imagens para Análise Detalhada: ${percentCompleted}%`)
      },
    })
  },
}
