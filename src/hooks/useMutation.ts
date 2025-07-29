import type { AxiosResponse } from 'axios'
import { useState } from 'react'

// Este hook precisa de dois tipos genéricos:
// <TRequest> para os dados de entrada (o payload)
// <TResponse> para os dados de saída (a resposta da API)
export const useMutation = <TRequest, TResponse>(
  mutationFn: (payload: TRequest) => Promise<AxiosResponse<TResponse>>
) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TResponse | null>(null)

  const mutate = async (payload: TRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await mutationFn(payload)
      setData(response.data)
      return response.data
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error, data }
}
