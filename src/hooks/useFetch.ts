// src/hooks/useFetch.ts

import axios, { type AxiosResponse } from 'axios'
import { useCallback, useEffect, useState } from 'react'

export const useFetch = <T>(apiCall: (signal: AbortSignal) => Promise<AxiosResponse<T>>) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 1. A função que faz o trabalho é encapsulada em 'useCallback'
  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiCall(signal)
        setData(response.data)
      } catch (err: unknown) {
        if (!axios.isCancel(err)) {
          setError(err as Error)
        }
      } finally {
        setLoading(false)
      }
    },
    [apiCall]
  ) // A função é recriada se a chamada de API mudar

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchData])

  // 2. AQUI ESTÁ A RESPOSTA:
  // Nós retornamos a função 'fetchData' com o nome de 'refetch'
  return {
    data,
    loading,
    error,
    refetch: () => {
      // Para o refetch manual, criamos um novo controller
      const controller = new AbortController()
      fetchData(controller.signal)
    },
  }
}
