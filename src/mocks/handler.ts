// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

// -----------------------------------------------------------
// Simulação de "Banco de Dados" em Memória
// -----------------------------------------------------------

// Dados para os requisitos disponíveis
const availableRequirementsNames = [
  'DesignInterface',
  'LogicaNegocios',
  'BancoDeDados',
  'Seguranca',
  'Desempenho',
  'Usabilidade',
  'Manutencao',
  'Escalabilidade',
  'Compatibilidade',
  'Internacionalizacao',
]

// Dados para as listas criadas (simulando FetchedCreatedList)
interface MockCreatedListItem {
  id_: string // ID do item dentro da lista
  name: string // Nome do requisito
}

interface MockFetchedCreatedList {
  id: string // ID da lista (gerado pelo mock server)
  name: string
  requirements: MockCreatedListItem[]
}

let createdLists: MockFetchedCreatedList[] = [
  {
    id: 'list-mock-1',
    name: 'Lista Inicial de Projeto',
    requirements: [
      { id_: 'req-mock-1-1', name: 'DesignInterface' },
      { id_: 'req-mock-1-2', name: 'LogicaNegocios' },
    ],
  },
  {
    id: 'list-mock-2',
    name: 'Lista de Segurança e Performance',
    requirements: [
      { id_: 'req-mock-2-1', name: 'Seguranca' },
      { id_: 'req-mock-2-2', name: 'Desempenho' },
      { id_: 'req-mock-2-3', name: 'BancoDeDados' },
    ],
  },
]

// -----------------------------------------------------------
// Definindo os Handlers (Rotas da API Mockada)
// -----------------------------------------------------------

export const handlers = [
  // -----------------------------------------------------------
  // Endpoints para Requisitos Disponíveis
  // GET /api/requirements
  // -----------------------------------------------------------
  http.get('/api/requirements', () => {
    console.log('MSW: GET /api/requirements ->', availableRequirementsNames.length, 'requisitos.')
    return HttpResponse.json(availableRequirementsNames, { status: 200 })
  }), // -----------------------------------------------------------
  // Endpoints para Listas Criadas (CRUD)
  // -----------------------------------------------------------
  // GET all lists: /api/lists

  http.get('/api/lists', () => {
    console.log('MSW: GET /api/lists ->', createdLists.length, 'listas.')
    return HttpResponse.json(createdLists, { status: 200 })
  }), // GET a specific list by ID: /api/lists/:id

  http.get('/api/lists/:id', ({ params }) => {
    const { id } = params
    const list = createdLists.find((l) => l.id === id)
    if (!list) {
      console.log(`MSW: GET /api/lists/${id} -> Not Found (404)`)
      return new HttpResponse(JSON.stringify({ message: 'Lista não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.log(`MSW: GET /api/lists/${id} ->`, list.name)
    return HttpResponse.json(list, { status: 200 })
  }), // POST (Create) a new list: /api/lists

  http.post('/api/lists', async ({ request }) => {
    const newListData = (await request.json()) as Omit<MockFetchedCreatedList, 'id'> // Recebe os dados sem o ID
    const newId = `list-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` // Gera um ID único
    const newList: MockFetchedCreatedList = { ...newListData, id: newId }
    createdLists.push(newList)
    console.log('MSW: POST /api/lists -> Nova lista criada:', newList.name)
    return HttpResponse.json(newList, { status: 201 }) // 201 Created
  }), // PUT (Update) an existing list: /api/lists/:id

  http.put('/api/lists/:id', async ({ params, request }) => {
    const { id } = params
    const updatedData = (await request.json()) as MockFetchedCreatedList // Recebe todos os dados atualizados

    let updatedList: MockFetchedCreatedList | null = null
    let listFound = false

    createdLists = createdLists.map((list) => {
      if (list.id === id) {
        listFound = true
        updatedList = { ...list, ...updatedData } // Atualiza a lista
        return updatedList
      }
      return list
    })

    if (!listFound) {
      console.log(`MSW: PUT /api/lists/${id} -> Not Found (404)`)
      return new HttpResponse(
        JSON.stringify({ message: 'Lista não encontrada para atualização' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log(`MSW: PUT /api/lists/${id} -> Lista atualizada:`, updatedList)
    return HttpResponse.json(updatedList, { status: 200 })
  }), // DELETE a list: /api/lists/:id

  http.delete('/api/lists/:id', ({ params }) => {
    const { id } = params
    const initialLength = createdLists.length
    createdLists = createdLists.filter((list) => list.id !== id)

    if (createdLists.length === initialLength) {
      console.log(`MSW: DELETE /api/lists/${id} -> Not Found (404)`)
      return new HttpResponse(JSON.stringify({ message: 'Lista não encontrada para exclusão' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.log(`MSW: DELETE /api/lists/${id} -> Lista excluída.`)
    return new HttpResponse(null, { status: 204 }) // 204 No Content
  }), // -----------------------------------------------------------
  // NOVO ENDPOINT: Simulação de Início de Análise YOLO para Treinamento
  // POST /api/yolo/upload-and-analyze
  // Este endpoint é chamado pelo `YoloService.startYoloAnalysis` para iniciar o processo.
  // -----------------------------------------------------------

  http.post('/api/yolo/upload-and-analyze', async ({ request }) => {
    const formData = await request.formData() // Acessa os dados do FormData

    const filesReceived: { name: string; size: number; type: string }[] = []
    let listNames: string[] = []
    let requirementsData: unknown[] = [] // Itera sobre os campos do FormData para coletar informações

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        filesReceived.push({
          name: value.name,
          size: value.size,
          type: value.type,
        })
        console.log(
          `MSW: Arquivo recebido - Chave: ${key}, Nome: ${value.name}, Tamanho: ${value.size} bytes`
        )
      } else if (key === 'list_names') {
        // Supondo que 'list_names' pode vir como uma string JSON se for um array ou uma string simples
        try {
          listNames = JSON.parse(String(value))
          console.log(`MSW: list_names recebido (JSON):`, listNames)
        } catch (e: unknown) {
          listNames = [String(value)] // Se não for JSON, trate como string simples
          console.log(`MSW: list_names recebido (string):`, listNames, e)
        }
      } else if (key === 'requirements') {
        try {
          requirementsData = JSON.parse(String(value))
          console.log(`MSW: Requisitos recebidos (JSON):`, requirementsData)
        } catch (e) {
          console.warn('MSW: Erro ao parsear "requirements" do FormData:', e)
        }
      }
    }

    console.log(`MSW: POST /api/yolo/upload-and-analyze -> Recebido para análise.`)
    console.log(`MSW: Total de arquivos anexados: ${filesReceived.length}`) // Simula um atraso de processamento antes de retornar o status inicial

    await new Promise((resolve) => setTimeout(resolve, 500)) // Pequeno atraso para simular rede
    // Gera um ID de análise único

    const analysisId = `yolo-analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` // Retorna uma resposta inicial de "análise em andamento"

    return HttpResponse.json(
      {
        id: analysisId,
        status: 'analyzing', // Ou 'pending' se preferir essa string
        date_initialized: new Date().toISOString(),
        message: `Análise YOLO iniciada com sucesso. Processando ${filesReceived.length} arquivos.`,
      },
      { status: 200 } // Status HTTP 200 OK para aceitação do pedido
    )
  }), // -----------------------------------------------------------
  // Endpoint para Análise de Imagens (Simulação YOLO) - O SEU ORIGINAL
  // POST /api/analyze-images
  // -----------------------------------------------------------

  http.post('/api/analyze-images', async ({ request }) => {
    const formData = await request.formData() // Acessa os dados do FormData

    const uploadedFilesInfo: { name: string; size: number; type: string }[] = []
    const imagePreviewUrls: { id: string; src: string; name: string }[] = []
    let listIdFromForm: string | undefined
    let requirementsFromForm: unknown[] = [] // Itera sobre os campos do FormData para coletar informações

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        uploadedFilesInfo.push({
          name: value.name,
          size: value.size,
          type: value.type,
        }) // Para simulação, geramos uma URL de placeholder ou uma URL de objeto fake
        imagePreviewUrls.push({
          id: `yolo-img-${uploadedFilesInfo.length}-${Date.now()}`,
          src: `https://via.placeholder.com/150/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${value.name.substring(0, Math.min(value.name.length, 8))}`,
          name: value.name,
        })
      } else if (key === 'listId') {
        listIdFromForm = String(value)
      } else if (key === 'requirements') {
        try {
          requirementsFromForm = JSON.parse(String(value))
        } catch (e) {
          console.warn('MSW: Erro ao parsear "requirements" do FormData:', e)
        }
      }
    }

    console.log(`MSW: POST /api/analyze-images -> Recebidas ${uploadedFilesInfo.length} imagens.`)
    console.log(
      `MSW: Dados adicionais - listId: ${listIdFromForm}, requisitos:`,
      requirementsFromForm
    ) // Simula um atraso de processamento para a análise YOLO

    await new Promise((resolve) => setTimeout(resolve, 3000)) // 3 segundos de atraso
    // Constrói o relatório simulado de análise YOLO

    const analysisReport = {
      success: true,
      message: 'Análise YOLO concluída com sucesso (simulada pelo MSW)!',
      data: {
        overallSummary: `Foram processadas ${uploadedFilesInfo.length} imagens para a lista ${listIdFromForm || 'não especificada'}.`,
        imageReports: imagePreviewUrls.map((img) => ({
          id: img.id,
          imageSrc: img.src,
          title: `Análise de ${img.name}`,
          summary: `Detalhes: Detectados objetos A (${(Math.random() * 0.2 + 0.7).toFixed(2)}), B (${(Math.random() * 0.2 + 0.6).toFixed(2)}) e C (${(Math.random() * 0.2 + 0.5).toFixed(2)}).`,
          detectedObjects: [
            { label: 'Object X', confidence: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)) },
            { label: 'Object Y', confidence: parseFloat((Math.random() * 0.3 + 0.5).toFixed(2)) },
            { label: 'Object Z', confidence: parseFloat((Math.random() * 0.3 + 0.4).toFixed(2)) },
          ],
        })),
      },
    }

    return HttpResponse.json(analysisReport, { status: 200 })
  }),
]
