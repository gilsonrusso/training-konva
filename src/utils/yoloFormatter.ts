import type { RectShape } from '@/types/Shapes'

// This is a generic type based on usage. For a more robust implementation,
// this type should be imported from its definition file.
export type ClassItem = {
  id: number
  name: string
  rgbaColor: string
  solidBorderColor: string
}

export type ImageDimensions = {
  width: number
  height: number
}

/**
 * Formats a list of rectangle annotations into a YOLO-compatible string.
 *
 * @param rects - An array of rectangle shapes to format.
 * @param classItems - An array of all available class definitions.
 * @param imageDimensions - The width and height of the source image.
 * @returns A string with each annotation on a new line in YOLO format.
 */
export const formatToYolo = (
  rects: RectShape[],
  classItems: ClassItem[],
  imageDimensions: ImageDimensions
): string => {
  let yoloContent = ''

  rects.forEach((rect) => {
    const classDef = classItems.find((c) => c.id === rect.classId)
    if (!classDef) {
      console.warn(`Class definition not found for rect with classId: ${rect.classId}`)
      return // Skip this rectangle if the class definition is not found
    }

    const classId = classDef.id
    const { width: imageWidth, height: imageHeight } = imageDimensions

    // Normalization of coordinates to YOLO format
    // x_center = (x + width / 2) / image_width
    // y_center = (y + height / 2) / image_height
    // width_normalized = width / image_width
    // height_normalized = height / image_height

    const x_center = (rect.x + rect.width / 2) / imageWidth
    const y_center = (rect.y + rect.height / 2) / imageHeight
    const width_normalized = rect.width / imageWidth
    const height_normalized = rect.height / imageHeight

    // Format to 6 decimal places for accuracy
    yoloContent += `${classId} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width_normalized.toFixed(6)} ${height_normalized.toFixed(6)}
`
  })

  return yoloContent
}
