export interface RectShape {
  x: number
  y: number
  width: number
  height: number
  label: string
  id: string
  color?: string
  solidColor?: string
}

export type ImageWithRects = {
  id: string
  image: HTMLImageElement
  rects: RectShape[]
}

export interface CircleShape {
  x: number
  y: number
  radius: number
  label: string
  id: string
}

export interface ArrowShape {
  startX: number
  startY: number
  endX: number
  endY: number
  label: string
  id: string
}

export interface BrushShape {
  points: { x: number; y: number }[]
  label: string
  id: string
}

export interface EraserShape {
  points: { x: number; y: number }[]
  label: string
  id: string
}
