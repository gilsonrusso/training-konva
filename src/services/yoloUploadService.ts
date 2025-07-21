import axios from 'axios'
import { api } from '../lib/axios'
interface UploadYOLOAnnotationsProps {
  files: File[] // Array of .txt files (or .zip, depending on your simulation)
  // Add any other data you may need to send along with the files.
  // metadata?: any;
}

interface UploadResponse {
  message: string
  uploadedFiles: string[]
  // Add other properties that your mock API can return
}

/**
 * @function uploadYOLOAnnotations
 * @description Simula o envio de arquivos de anotação YOLO (.txt) para um serviço.
 * @param {UploadYOLOAnnotationsProps} { files } - Objeto contendo os arquivos a serem enviados.
 * @returns {Promise<UploadResponse>} Uma promessa que resolve com a resposta do servidor.
 */
export const yoloUploadService = {
  uploadYOLOAnnotations: async ({ files }: UploadYOLOAnnotationsProps): Promise<UploadResponse> => {
    const formData = new FormData()

    // Adiciona cada arquivo ao FormData
    files.forEach((file) => {
      formData.append('yoloFiles', file) // 'yoloFiles' é o nome do campo esperado pelo seu backend
    })

    try {
      // Envia os arquivos usando a instância do Axios
      // Certifique-se de que seu backend está configurado para receber 'multipart/form-data'
      const response = await api.post<UploadResponse>('/upload-yolo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Importante para upload de arquivos
        },
        // Opcional: acompanhar o progresso do upload
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          console.log(`Progresso do Upload: ${percentCompleted}%`)
          // Você pode usar isso para atualizar um indicador de progresso na UI
        },
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Erro ao fazer upload dos arquivos YOLO:',
          error.response?.data || error.message
        )
        throw new Error(error.response?.data?.message || 'Falha no upload das anotações YOLO.')
      } else {
        console.error('Erro desconhecido:', error)
        throw new Error('Ocorreu um erro desconhecido durante o upload.')
      }
    }
  },

  // Você pode adicionar outras funções aqui, como buscar status de uploads, etc.
  // getUploadStatus: async (uploadId: string): Promise<any> => {
  //   const response = await api.get(`/upload-status/${uploadId}`);
  //   return response.data;
  // },
}
