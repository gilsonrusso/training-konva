import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import AdUnitsOutlinedIcon from '@mui/icons-material/AdUnitsOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import Crop54Icon from '@mui/icons-material/Crop54'
import GestureOutlinedIcon from '@mui/icons-material/GestureOutlined'
import { Box, Grid, IconButton, Typography } from '@mui/material' // Componentes Material-UI para interface visual
import type Konva from 'konva' // Tipos para a biblioteca Konva.js
import React, { useCallback, useEffect, useRef, useState, type ElementType } from 'react' // Hooks e tipos essenciais do React
import {
  Image as KonvaImage,
  Line as KonvaLine,
  Rect as KonvaRect,
  Text as KonvaText,
  Layer,
  Stage,
} from 'react-konva' // Componentes Konva para desenhar no canvas
import { v4 as uuidv4 } from 'uuid' // Para gerar IDs únicos para os retângulos
import type { ImageWithRects, RectShape } from '../../types/Shapes' // Tipos personalizados para imagens e formas
import { ImageCarousel } from '../commons/AppCarouselImage' // Componente para exibir o carrossel de imagens
import { GridStyled } from '../muiStyled/GridStyled' // Componente estilizado de Grid do Material-UI

// --- Definições de Enums e Tipos ---

/**
 * @enum {DrawTools}
 * @description Define as ferramentas de desenho disponíveis na aplicação.
 * Por que estamos adicionando isso?
 * Para padronizar e gerenciar facilmente as ferramentas que o usuário pode selecionar,
 * tornando o código mais legível e menos propenso a erros de digitação de strings.
 */
export enum DrawTools {
  Select = 'select', // Ferramenta para selecionar e mover objetos
  Rectangle = 'Rectangle', // Ferramenta para desenhar retângulos
  Circle = 'circle', // Ferramenta para desenhar círculos (ainda não implementado, mas previsto)
  Arrow = 'Arrow', // Ferramenta para desenhar setas (ainda não implementado, mas previsto)
  Brush = 'brush', // Ferramenta para desenho livre (ainda não implementado, mas previsto)
  Eraser = 'eraser', // Ferramenta para apagar (ainda não implementado, mas previsto)
}

/**
 * @function downloadURI
 * @description Baixa um URI (geralmente uma imagem base64) como um arquivo.
 * @param {Object} props - Objeto contendo o URI e o nome do arquivo.
 * Por que estamos adicionando isso?
 * Permite que o usuário exporte a imagem anotada, transformando o conteúdo do canvas
 * em um arquivo PNG que pode ser salvo localmente.
 */
const downloadURI = ({ uri, name }: downloadURIProps) => {
  const link: HTMLAnchorElement = document.createElement('a')
  link.download = name
  link.href = uri || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * @constant {string[]} RGBA_COLORS
 * @description Array de cores RGBA para preenchimento de retângulos (com transparência).
 * Por que estamos adicionando isso?
 * Oferece uma variedade de cores para os retângulos desenhados, com transparência
 * para que a imagem por baixo ainda seja visível.
 */
const RGBA_COLORS = [
  'rgba(255, 0, 0, 0.3)', // Vermelho
  'rgba(0, 0, 255, 0.3)', // Azul
  'rgba(0, 255, 0, 0.3)', // Verde
  'rgba(255, 255, 0, 0.3)', // Amarelo
  'rgba(255, 0, 255, 0.3)', // Magenta
  'rgba(0, 255, 255, 0.3)', // Ciano
  'rgba(128, 0, 128, 0.3)', // Roxo
  'rgba(255, 165, 0, 0.3)', // Laranja
]

/**
 * @constant {string[]} SOLID_COLORS
 * @description Array de cores sólidas para bordas de retângulos e textos.
 * Por que estamos adicionando isso?
 * Complementa as cores RGBA, fornecendo cores opacas para bordas e textos,
 * garantindo que sejam bem visíveis contra a imagem.
 */
const SOLID_COLORS = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'purple', 'orange']

/**
 * @constant {PaintOptions[]} PAINT_OPTIONS
 * @description Array de objetos que representam as opções de ferramentas de desenho, incluindo ícones do Material-UI.
 * Por que estamos adicionando isso?
 * Facilita a renderização dinâmica dos botões de ferramenta na interface do usuário,
 * associando um ID, um label e um ícone para cada ferramenta.
 */
export const PAINT_OPTIONS: PaintOptions[] = [
  { id: DrawTools.Select, label: 'Select', icon: AdsClickOutlinedIcon },
  { id: DrawTools.Rectangle, label: 'Rectangle', icon: Crop54Icon },
  { id: DrawTools.Circle, label: 'Circle', icon: CircleOutlinedIcon },
  { id: DrawTools.Brush, label: 'Free Draw', icon: GestureOutlinedIcon },
  { id: DrawTools.Arrow, label: 'Arrow', icon: ArrowOutwardOutlinedIcon },
  { id: DrawTools.Eraser, label: 'Eraser', icon: AdUnitsOutlinedIcon },
]

// --- Tipos de Propriedades ---

/**
 * @typedef {Object} downloadURIProps
 * @property {string | undefined} uri - O URI dos dados (e.g., base64) a ser baixado.
 * @property {string} name - O nome do arquivo para o download.
 * Por que estamos adicionando isso?
 * Define a estrutura esperada para os argumentos da função `downloadURI`, melhorando a segurança e legibilidade do código.
 */
type downloadURIProps = {
  uri: string | undefined
  name: string
}

/**
 * @typedef {Object} PaintOptions
 * @property {DrawTools} id - O ID único da ferramenta de desenho (do enum DrawTools).
 * @property {string} label - O texto visível da ferramenta.
 * @property {ElementType} icon - O componente de ícone do Material-UI para a ferramenta.
 * @property {string} [color] - Cor opcional para a ferramenta.
 * Por que estamos adicionando isso?
 * Define o formato dos objetos dentro do array `PAINT_OPTIONS`, garantindo consistência.
 */
type PaintOptions = {
  id: DrawTools
  label: string
  icon: ElementType
  color?: string
}

/**
 * @typedef {CurrentDrawTool}
 * @description Tipo para o estado `currentTool`, garantindo que só aceite valores do enum `DrawTools`.
 * Por que estamos adicionando isso?
 * Garante que a ferramenta selecionada seja sempre um dos valores válidos definidos,
 * evitando erros de lógica e melhorando a segurança de tipo.
 */
type CurrentDrawTool = (typeof DrawTools)[keyof typeof DrawTools]

/**
 * @typedef {Object} AppDrawerStageProps
 * @description Define as propriedades (props) que o componente `AppDrawerStage` espera receber.
 * Por que estamos adicionando isso?
 * Garante que o componente receba os dados e funções necessárias para operar corretamente,
 * como a lista de imagens, a imagem selecionada, a label atual, e callbacks para atualizar estados.
 */
type AppDrawerStageProps = {
  images: ImageWithRects[] // Lista de todas as imagens carregadas
  selectedImage: ImageWithRects | null // A imagem atualmente selecionada para edição
  currentLabel: string // A label atual a ser aplicada aos novos retângulos
  onSetSelectedImage: (image: ImageWithRects) => void // Callback para mudar a imagem selecionada
  onUpdateImageRects: (updatedImage: ImageWithRects) => void // Callback para atualizar os retângulos de uma imagem
  onSetCurrentLabel: (label: string) => void // Callback para atualizar a label atual
  onSetExportFunction: (exportFn: () => void) => void // Callback para passar a função de exportar para o pai
}

// --- Componente Principal: AppDrawerStage ---

export const AppDrawerStage = ({
  images,
  currentLabel,
  selectedImage,
  onUpdateImageRects,
  onSetCurrentLabel,
  onSetExportFunction,
  onSetSelectedImage,
}: AppDrawerStageProps) => {
  // --- Estados do Componente ---

  /**
   * @state {CurrentDrawTool} currentTool
   * @description Armazena a ferramenta de desenho atualmente selecionada pelo usuário.
   * Por que estamos adicionando isso?
   * Controla o comportamento do mouse no canvas (desenhar retângulo, mover imagem, etc.)
   * e o estilo visual do botão de ferramenta ativo.
   */
  const [currentTool, setCurrentTool] = useState<CurrentDrawTool>(DrawTools.Select)

  /**
   * @state {RectShape | null} newRect
   * @description Armazena os dados do retângulo que está sendo desenhado (enquanto o mouse está pressionado).
   * Por que estamos adicionando isso?
   * Permite que o retângulo seja renderizado e atualizado em tempo real enquanto o usuário arrasta o mouse,
   * antes de ser finalizado e adicionado à lista de retângulos da imagem.
   */
  const [newRect, setNewRect] = useState<RectShape | null>(null)

  /**
   * @state {boolean} isDrawing
   * @description Indica se o usuário está atualmente arrastando o mouse para desenhar uma forma.
   * Por que estamos adicionando isso?
   * Atua como um flag para controlar a lógica de `handleMouseMove` e `handleMouseUp`,
   * garantindo que o desenho só ocorra quando o botão do mouse está pressionado e a ferramenta de desenho está ativa.
   */
  const [isDrawing, setIsDrawing] = useState<boolean>(false)

  // --- ESTADOS PARA O ZOOM E PAN ---
  /**
   * @state {number} scale
   * @description Controla o nível de zoom da imagem e dos objetos na Layer Konva.
   * Por que estamos adicionando isso?
   * Permite que o usuário aproxime ou afaste a visualização da imagem,
   * o que é essencial para um trabalho de anotação detalhado.
   */
  const [scale, setScale] = useState(0.5) // Zoom inicial. O valor 0.5 faz a imagem iniciar menor que o palco.

  /**
   * @state {number} stageX
   * @description Controla a posição X da Layer Konva dentro do Stage (para o pan horizontal).
   * Por que estamos adicionando isso?
   * Permite que o usuário "arraste" a imagem horizontalmente dentro da área de visualização,
   * especialmente quando a imagem é maior que o palco ou está com zoom.
   */
  const [stageX, setStageX] = useState(0)

  /**
   * @state {number} stageY
   * @description Controla a posição Y da Layer Konva dentro do Stage (para o pan vertical).
   * Por que estamos adicionando isso?
   * Permite que o usuário "arraste" a imagem verticalmente dentro da área de visualização.
   */
  const [stageY, setStageY] = useState(0)

  // --- Referências DOM e Konva ---

  /**
   * @ref {Konva.Stage | null} stageRef
   * @description Referência direta ao objeto Stage do Konva.
   * Por que estamos adicionando isso?
   * Permite acessar métodos e propriedades do Stage Konva (e.g., `toDataURL` para exportar, `getPointerPosition` para coordenadas do mouse).
   */
  const stageRef = useRef<Konva.Stage | null>(null)

  /**
   * @ref {HTMLDivElement | null} containerRef
   * @description Referência ao elemento DIV que contém o Stage Konva.
   * Por que estamos adicionando isso?
   * Usado para obter as dimensões dinâmicas da área disponível para o canvas, garantindo
   * que o Stage se adapte ao layout do contêiner.
   */
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * @state {Object} dimensions
   * @property {number} width - Largura atual do container do Stage.
   * @property {number} height - Altura atual do container do Stage.
   * Por que estamos adicionando isso?
   * Armazena as dimensões da área de desenho para que o Stage Konva possa ser dimensionado corretamente,
   * adaptando-se a diferentes tamanhos de tela ou layouts de UI.
   */
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  /**
   * @state {Object | null} crosshairPos
   * @description Armazena a posição X e Y do mouse na tela para renderizar o crosshair.
   * Por que estamos adicionando isso?
   * Proporciona um feedback visual ao usuário, mostrando a exata posição do mouse sobre a imagem,
   * útil para precisão no desenho.
   */
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null)

  // --- Funções de Lógica ---

  /**
   * @function exportCanvas
   * @description Função memoizada para exportar o conteúdo atual do Stage Konva como uma imagem PNG.
   * Por que estamos adicionando isso?
   * É uma funcionalidade crucial para o usuário salvar seu trabalho de anotação.
   * `useCallback` é usado para otimização, evitando que a função seja recriada em cada renderização,
   * a menos que `selectedImage` mude.
   */
  const exportCanvas = useCallback(() => {
    if (!stageRef.current) {
      alert('Nenhum estágio de desenho encontrado para exportar.')
      return
    }
    // Converte o Stage para uma URL de dados (Base64 PNG) com pixelRatio 3 para maior qualidade
    const dataUri = stageRef.current.toDataURL({ pixelRatio: 3 })
    downloadURI({
      uri: dataUri,
      name: `annotated_${selectedImage?.image.src.split('/').pop() || 'image'}.png`, // Nome do arquivo baseado na imagem original
    })
  }, [selectedImage]) // Depende de selectedImage para o nome do arquivo

  // --- Handlers de Eventos do Mouse ---

  /**
   * @function handleMouseDown
   * @description Gerencia o evento de clique/pressionar o botão do mouse no Stage.
   * Por que estamos adicionando isso?
   * É o ponto de entrada para iniciar o pan (se 'Select' estiver ativo) ou para iniciar o desenho de uma nova forma.
   * Calcula a posição inicial da forma no sistema de coordenadas da Layer (que é escalada e movida).
   */
  const handleMouseDown = () => {
    const stage = stageRef.current
    if (!stage || !selectedImage) return

    // Se a ferramenta for 'Select', apenas permite arrastar o palco (pan), não iniciar um desenho de forma.
    if (currentTool === DrawTools.Select) {
      setIsDrawing(false) // Indica que não estamos desenhando uma nova forma, mas interagindo com o palco/imagem.
      return
    }

    // Impede o desenho se nenhuma label for fornecida.
    if (!currentLabel.trim()) {
      alert('Por favor, insira uma label para o retângulo antes de desenhar.')
      return
    }

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Obtém a Layer que contém a imagem e as formas desenhadas.
    const layer = stage.getLayers()[0]
    if (!layer) return

    // IMPORTANTE: Inverte a transformação da Layer para obter as coordenadas do clique do mouse
    // no sistema de coordenadas "original" da Layer (sem zoom ou pan aplicados).
    // Isso é crucial para que o retângulo seja desenhado nas coordenadas corretas,
    // independentemente do zoom e pan atuais.
    const transform = layer.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer) // 'pos' agora são as coordenadas dentro da Layer.

    setIsDrawing(true) // Ativa o flag de desenho.

    // Seleciona cores aleatórias para o novo retângulo.
    const randomIndex = Math.floor(Math.random() * RGBA_COLORS.length)
    const randomRgbaColor = RGBA_COLORS[randomIndex]
    const randomSolidColor = SOLID_COLORS[randomIndex]

    // Inicializa o `newRect` com as coordenadas de início e um ID único.
    const newRect: RectShape = {
      x: pos.x, // Coordenada X inicial do retângulo na Layer.
      y: pos.y, // Coordenada Y inicial do retângulo na Layer.
      width: 0,
      height: 0,
      label: currentLabel,
      id: `rect-${uuidv4()}`,
      color: randomRgbaColor,
      solidColor: randomSolidColor,
    }
    setNewRect(newRect)
  }

  /**
   * @function handleMouseMove
   * @description Gerencia o evento de movimento do mouse no Stage.
   * Por que estamos adicionando isso?
   * Atualiza as dimensões do retângulo `newRect` em tempo real enquanto o usuário arrasta,
   * e também atualiza a posição do crosshair.
   */
  const handleMouseMove = () => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Atualiza a posição do crosshair, que segue a posição do mouse na tela (coordenadas do Stage).
    setCrosshairPos(pointerPosition)

    // Se a ferramenta for 'Select' ou se não estiver desenhando, não faz nada para desenho de retângulo.
    if (currentTool === DrawTools.Select || !isDrawing || !newRect) {
      return
    }

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const layer = stage.getLayers()[0]
    if (!layer) return

    // Novamente, inverte a transformação da Layer para obter a posição atual do mouse
    // no sistema de coordenadas da Layer.
    const transform = layer.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    // Calcula a largura e altura do retângulo com base na posição inicial (`newRect.x`, `newRect.y`)
    // e na posição atual do mouse (`pos.x`, `pos.y`).
    const width = pos.x - newRect.x
    const height = pos.y - newRect.y

    // Atualiza o estado de `newRect` para renderizar o retângulo em crescimento.
    setNewRect({
      ...newRect,
      width,
      height,
    })
  }

  /**
   * @function handleMouseUp
   * @description Gerencia o evento de soltar o botão do mouse no Stage.
   * Por que estamos adicionando isso?
   * Finaliza o processo de desenho: ajusta o retângulo, adiciona-o à lista de retângulos da imagem,
   * e reseta os estados de desenho. Além disso, **muda a ferramenta para 'Select' automaticamente.**
   */
  const handleMouseUp = () => {
    setIsDrawing(false) // Desativa o flag de desenho.

    // Se a ferramenta for 'Select', significa que o usuário estava arrastando o palco (pan),
    // então não há retângulo para finalizar.
    if (currentTool === DrawTools.Select) {
      return
    }

    // Garante que há um `newRect` e uma `selectedImage` para prosseguir.
    if (!newRect || !selectedImage) return

    // Ajusta o retângulo para garantir que `width` e `height` sejam sempre valores positivos,
    // independentemente da direção em que o usuário arrastou o mouse.
    // Também ajusta `x` e `y` se o arraste foi para a esquerda ou para cima.
    const finalRect = {
      ...newRect,
      x: newRect.width < 0 ? newRect.x + newRect.width : newRect.x,
      y: newRect.height < 0 ? newRect.y + newRect.height : newRect.y,
      width: Math.abs(newRect.width), // Usa valor absoluto para largura
      height: Math.abs(newRect.height), // Usa valor absoluto para altura
    }

    // Adiciona o retângulo à lista de retângulos da imagem selecionada apenas se ele tiver um tamanho mínimo.
    // Isso evita a criação de retângulos minúsculos acidentais.
    if (finalRect.width > 5 && finalRect.height > 5) {
      const updatedSelectedImage: ImageWithRects = {
        ...selectedImage,
        rects: [...selectedImage.rects, finalRect], // Adiciona o novo retângulo
      }
      onUpdateImageRects(updatedSelectedImage) // Atualiza o estado da imagem no componente pai.
      // --- Adição de Funcionalidade: Mudar para Ferramenta de Seleção ---
      // Por que estamos adicionando isso?
      // Após o usuário desenhar e soltar um retângulo, é natural que ele queira imediatamente
      // mover ou redimensionar esse retângulo (ou outros). Mudar a ferramenta para 'Select'
      // automaticamente melhora a experiência do usuário, tornando o fluxo de trabalho mais eficiente.
      setCurrentTool(DrawTools.Select)
    }

    setNewRect(null) // Limpa o estado do `newRect`, removendo-o da renderização.
    onSetCurrentLabel('') // Limpa a label para que o próximo desenho exija uma nova label.
  }

  /**
   * @function handleWheel
   * @description Gerencia o evento de roda do mouse para zoom e pan.
   * Por que estamos adicionando isso?
   * Permite que o usuário use a roda do mouse para controlar o zoom na imagem,
   * o que é uma forma intuitiva e rápida de navegar na visualização.
   */
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault() // Previne o comportamento padrão do navegador (scroll da página).

    const stage = stageRef.current
    if (!stage) return

    const scaleBy = 1.2 // Fator pelo qual o zoom aumenta ou diminui.
    const oldScale = scale // A escala atual da Layer.

    const pointer = stage.getPointerPosition() // Posição do mouse no Stage.
    if (!pointer) return

    const stageMouseX = pointer.x
    const stageMouseY = pointer.y

    // Calcula o ponto no sistema de coordenadas da Layer que está sob o mouse.
    // Isso é crucial para que o zoom pareça "centralizado" no ponto do mouse.
    const mousePointTo = {
      x: (stageMouseX - stageX) / oldScale,
      y: (stageMouseY - stageY) / oldScale,
    }

    // Determina a nova escala com base na direção da roda do mouse.
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limita o zoom para evitar que a imagem fique muito pequena ou muito grande.
    const minScale = 0.05
    const maxScale = 10
    newScale = Math.max(minScale, Math.min(newScale, maxScale))

    setScale(newScale) // Atualiza o estado da escala.

    // Calcula a nova posição (pan) da Layer para que o ponto sob o mouse permaneça no mesmo lugar
    // na tela após o zoom. Isso cria a ilusão de "zoom no centro do mouse".
    const newPos = {
      x: stageMouseX - mousePointTo.x * newScale,
      y: stageMouseY - mousePointTo.y * newScale,
    }
    setStageX(newPos.x) // Atualiza a posição X da Layer.
    setStageY(newPos.y) // Atualiza a posição Y da Layer.
  }

  // --- Efeitos Colaterais (useEffect) ---

  /**
   * @effect
   * @description Passa a função `exportCanvas` para o componente pai.
   * Por que estamos adicionando isso?
   * Permite que um componente pai acione a funcionalidade de exportação
   * do canvas, mesmo que o botão de exportar esteja em outro lugar na UI.
   * `exportCanvas` é uma dependência porque é a função que está sendo passada.
   */
  useEffect(() => {
    onSetExportFunction(exportCanvas)
  }, [onSetExportFunction, exportCanvas])

  /**
   * @effect
   * @description Calcula e atualiza as dimensões do container do Stage.
   * Por que estamos adicionando isso?
   * Garante que o Stage Konva sempre tenha as dimensões corretas do espaço disponível,
   * adaptando-se a redimensionamentos da janela ou alterações de layout.
   * Adiciona um event listener para 'resize' e o remove na limpeza do componente.
   */
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateSize() // Chama uma vez ao montar o componente para definir as dimensões iniciais.
    window.addEventListener('resize', updateSize) // Ouve por eventos de redimensionamento da janela.
    return () => window.removeEventListener('resize', updateSize) // Limpa o event listener ao desmontar.
  }, []) // Array de dependências vazio significa que este efeito roda apenas uma vez (na montagem e limpeza).

  /**
   * @effect --- ULTIMA ALTERAÇÃO: Centralizar a imagem e redefinir o zoom ao trocar de imagem ---
   * @description Redefine o zoom e centraliza a imagem no palco sempre que uma nova imagem é selecionada ou as dimensões do palco mudam.
   * Por que estamos adicionando isso?
   * Melhora a usabilidade, pois o usuário sempre verá a nova imagem em uma posição e zoom consistentes (centralizados e com zoom inicial),
   * eliminando a necessidade de ajustar manualmente o zoom e o pan a cada troca de imagem.
   * Também garante que a centralização seja recalculada se o tamanho da tela mudar.
   */
  useEffect(() => {
    // Verifica se há uma `selectedImage` e se as `dimensions` do palco já foram calculadas (maiores que 0).
    if (selectedImage && dimensions.width > 0 && dimensions.height > 0) {
      setScale(0.5) // Redefine o zoom para o valor inicial desejado (metade do tamanho original da imagem).

      // Calcula a largura e altura da imagem **escalada** pelo zoom inicial (0.5).
      const scaledImageWidth = selectedImage.image.width * 0.5
      const scaledImageHeight = selectedImage.image.height * 0.5

      // Calcula o deslocamento X e Y necessários para centralizar a imagem escalada dentro do palco.
      // (Largura do palco - largura da imagem escalada) / 2
      const offsetX = (dimensions.width - scaledImageWidth) / 2
      const offsetY = (dimensions.height - scaledImageHeight) / 2

      setStageX(offsetX) // Define a posição X da Layer para centralizar.
      setStageY(offsetY) // Define a posição Y da Layer para centralizar.
    } else if (!selectedImage) {
      // Se nenhuma imagem estiver selecionada (e.g., no início ou após remover todas),
      // redefine a posição para 0,0 para garantir um estado limpo.
      setStageX(0)
      setStageY(0)
    }
  }, [selectedImage, dimensions.width, dimensions.height]) // Este efeito é re-executado quando a imagem selecionada muda ou quando as dimensões do palco mudam.

  // --- Renderização do Componente ---

  return (
    <Grid container spacing={0.5} flexDirection={'column'} flexGrow={1} overflow={'hidden'}>
      {/* Seção superior da interface: Botões de ferramenta e área de desenho */}
      <GridStyled
        sx={{
          borderRadius: '0 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: 'purple',
        }}
        flexGrow={3} // Ocupa mais espaço vertical que o carrossel
      >
        {/* Container para os botões de ferramenta */}
        <Grid container spacing={1} columns={12} sx={{ marginY: 2, justifyContent: 'center' }}>
          {PAINT_OPTIONS.map(({ icon: Icon, id }) => (
            <React.Fragment key={id}>
              <Grid>
                <IconButton
                  onClick={() => setCurrentTool(id)} // Define a ferramenta ativa ao clicar
                  color={currentTool === id ? 'primary' : 'default'} // Altera a cor se for a ferramenta ativa
                  disabled={!selectedImage} // Desabilita os botões de ferramenta se não houver imagem
                >
                  <Icon /> {/* Renderiza o ícone da ferramenta */}
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        {/* Área que encapsula o Konva Stage, responsável por gerenciar suas dimensões */}
        <Box
          flexGrow={1}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'red', // Cor de fundo para visualização
          }}
        >
          {/* O container para o Stage Konva, com overflow oculto para gerenciar o zoom/pan */}
          <Box
            sx={{
              border: '1px solid red', // Borda para visualização da área do Stage
              overflow: 'hidden', // Importante para que o conteúdo do Stage não transborde ao fazer pan/zoom
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: 'calc(100% - 20px)', // Margem interna para o Stage
              maxHeight: 'calc(100% - 20px)',
            }}
            ref={containerRef} // Atribui a referência para capturar as dimensões
          >
            {/* Mensagem exibida quando nenhuma imagem está selecionada */}
            {!selectedImage && (
              <Typography variant="h6" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                Por favor, selecione ou carregue uma imagem para começar a desenhar.
              </Typography>
            )}
            {/* O Stage Konva, renderizado apenas se uma imagem estiver selecionada */}
            {selectedImage && (
              <Stage
                width={dimensions.width} // Largura do Stage Konva, baseada nas dimensões do containerRef
                height={dimensions.height} // Altura do Stage Konva
                ref={stageRef} // Atribui a referência ao Stage Konva
                onMouseDown={handleMouseDown} // Lida com o início de interações (pan ou desenho)
                onMousemove={handleMouseMove} // Lida com o movimento do mouse (atualizar forma ou crosshair)
                onMouseup={handleMouseUp} // Lida com o final da interação (finalizar forma)
                onMouseLeave={() => setCrosshairPos(null)} // Esconde o crosshair quando o mouse sai do Stage
                onMouseEnter={() => {
                  const stage = stageRef.current
                  if (!stage) return
                  const pointer = stage.getPointerPosition()
                  if (pointer) setCrosshairPos(pointer)
                }} // Mostra o crosshair quando o mouse entra no Stage
                onWheel={handleWheel} // Habilita o zoom com a roda do mouse
              >
                {/* A Layer Konva onde a imagem e todos os objetos desenhados vivem. */}
                {/* TODAS as transformações de zoom (scaleX, scaleY) e pan (x, y) são aplicadas aqui, */}
                {/* e a capacidade de arrastar (draggable) também. Isso garante que a imagem e as formas */}
                {/* se movam e escalem juntas. */}
                <Layer
                  scaleX={scale} // Aplica o fator de zoom horizontal
                  scaleY={scale} // Aplica o fator de zoom vertical
                  x={stageX} // Aplica o deslocamento horizontal (pan)
                  y={stageY} // Aplica o deslocamento vertical (pan)
                  draggable={currentTool === DrawTools.Select} // Torna a Layer arrastável apenas se a ferramenta 'Select' estiver ativa
                >
                  {/* Componente KonvaImage para exibir a imagem selecionada */}
                  {selectedImage && (
                    <KonvaImage
                      x={0} // A imagem começa em (0,0) dentro da sua Layer
                      y={0}
                      width={selectedImage.image.width} // Usa as dimensões originais da imagem (a escala é aplicada na Layer)
                      height={selectedImage.image.height}
                      image={selectedImage.image} // A imagem em si (objeto Image do JS)
                    />
                  )}
                  {/* Renderiza o crosshair (linhas que seguem o mouse) */}
                  {crosshairPos && (
                    <>
                      {/* Linha vertical do crosshair. Os pontos são convertidos do Stage para a Layer. */}
                      <KonvaLine
                        points={[
                          (crosshairPos.x - stageX) / scale, // Coordenada X relativa à Layer
                          0,
                          (crosshairPos.x - stageX) / scale,
                          selectedImage.image.height, // Se estende pela altura total da imagem na Layer
                        ]}
                        stroke="blue"
                        strokeWidth={1 / scale} // Ajusta a espessura da linha para que pareça constante no zoom
                        dash={[4 / scale, 4 / scale]} // Ajusta o padrão de tracejado para parecer constante
                      />
                      {/* Linha horizontal do crosshair */}
                      <KonvaLine
                        points={[
                          0,
                          (crosshairPos.y - stageY) / scale, // Coordenada Y relativa à Layer
                          selectedImage.image.width, // Se estende pela largura total da imagem na Layer
                          (crosshairPos.y - stageY) / scale,
                        ]}
                        stroke="blue"
                        strokeWidth={1 / scale}
                        dash={[4 / scale, 4 / scale]}
                      />
                    </>
                  )}
                  {/* Mapeia e renderiza todos os retângulos já anotados na imagem selecionada */}
                  {selectedImage &&
                    selectedImage.rects.map((rc) => (
                      // React.Fragment é usado para agrupar o texto e o retângulo sob a mesma key
                      <React.Fragment key={rc.id}>
                        <KonvaText
                          text={rc.label} // Texto da label do retângulo
                          x={rc.x} // Posição X do texto (mesma do retângulo)
                          y={rc.y - 20} // Posição Y do texto (acima do retângulo)
                          width={rc.width} // Largura do espaço do texto
                          fontSize={12}
                          fill={rc.solidColor || 'blue'} // Cor do texto
                          align="left" // Alinhamento do texto
                        />
                        <KonvaRect
                          {...rc} // Espalha todas as propriedades do objeto 'rc' (x, y, width, height, etc.)
                          stroke={rc.solidColor || 'red'} // Cor da borda
                          strokeWidth={2} // Espessura da borda
                          fill={rc.color || 'rgba(255, 0, 0, 0.3)'} // Cor de preenchimento
                        />
                      </React.Fragment>
                    ))}

                  {/* Renderiza o retângulo que está sendo desenhado atualmente (ainda não finalizado) */}
                  {newRect && (
                    <>
                      <KonvaText
                        text={newRect.label}
                        x={newRect.x}
                        y={newRect.y - 20}
                        width={newRect.width}
                        fontSize={12}
                        fill={newRect.solidColor || 'blue'}
                        align="left"
                      />
                      <KonvaRect
                        {...newRect}
                        stroke={newRect.solidColor || 'blue'}
                        strokeWidth={2}
                        fill={newRect.color || 'rgba(0, 0, 255, 0.3)'}
                      />
                    </>
                  )}
                </Layer>
              </Stage>
            )}
          </Box>
        </Box>
      </GridStyled>
      {/* Seção inferior da interface: Carrossel de imagens */}
      <GridStyled
        flexGrow={1}
        sx={{
          padding: '5px',
          width: '100%',
          maxHeight: '170px', // Altura máxima para o carrossel
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '0 0 8px 0',
        }}
      >
        {/* Componente ImageCarousel para exibir e permitir a seleção de imagens */}
        <ImageCarousel
          images={images} // Todas as imagens disponíveis
          selectedImage={selectedImage} // A imagem atualmente selecionada
          onSetSelectedImage={onSetSelectedImage} // Callback para atualizar a imagem selecionada
        />
      </GridStyled>
    </Grid>
  )
}
