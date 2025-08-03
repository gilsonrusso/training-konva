import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ajuste o tempo que os dados ficam "stale" (velhos) no cache.
      // 0 = sempre refetch, Infinity = nunca refetch (até invalidação manual)
      // 5 * 60 * 1000 = 5 minutos (exemplo)
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true, // Re-busca quando a janela foca (pode ser ajustado)
      retry: 2, // Tenta refetch 2 vezes em caso de falha
    },
  },
})
