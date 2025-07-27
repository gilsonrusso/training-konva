export interface RectShape {
  x: number
  y: number
  width: number
  height: number
  label: string
  classId: number
  id: string
  color?: string
  solidColor?: string
}

export type ImageWithRects = {
  id: string
  image: HTMLImageElement
  rects: RectShape[]
  originalFile: File
}

export interface ClassDefinition {
  id: number
  name: string
  rgbaColor: string
  solidBorderColor: string
}
