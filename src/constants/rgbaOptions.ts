/**
 * @constant {string[]} RGBA_COLORS
 * @description Array of RGBA colors for filling rectangles (with transparency).
 * Why is this added?
 * Provides a variety of colors for the drawn rectangles, with transparency
 * so that the underlying image is still visible.
 */
export const RANDOM_RGBA_COLORS = [
  'rgba(255, 0, 0, 0.3)', // Vermelho
  'rgba(0, 0, 255, 0.3)', // Azul
  'rgba(0, 255, 0, 0.3)', // Verde
  'rgba(255, 255, 0, 0.3)', // Amarelo
  'rgba(255, 0, 255, 0.3)', // Magenta
  'rgba(0, 255, 255, 0.3)', // Ciano
  'rgba(128, 0, 128, 0.3)', // Roxo
  'rgba(255, 165, 0, 0.3)', // Laranja
  'rgba(255, 192, 203, 0.3)', // Rosa Claro
  'rgba(139, 69, 19, 0.3)', // Marrom
  'rgba(0, 128, 0, 0.3)', // Verde Escuro
  'rgba(75, 0, 130, 0.3)', // Índigo
  'rgba(238, 130, 238, 0.3)', // Violeta
  'rgba(255, 215, 0, 0.3)', // Dourado
  'rgba(0, 255, 127, 0.3)', // Verde Primavera
  'rgba(100, 149, 237, 0.3)', // Azul Milho
  'rgba(210, 105, 30, 0.3)', // Chocolate
  'rgba(173, 216, 230, 0.3)', // Azul Claro
  'rgba(240, 230, 140, 0.3)', // Caqui
  'rgba(64, 224, 208, 0.3)', // Turquesa
  'rgba(255, 99, 71, 0.3)', // Tomate
  'rgba(152, 251, 152, 0.3)', // Verde Pastel
  'rgba(135, 206, 235, 0.3)', // Azul Celeste
  'rgba(255, 140, 0, 0.3)', // Laranja Escuro
]

/**
 * @constant {string[]} SOLID_COLORS
 * @description Array of solid colors for rectangle borders and text.
 * Why is this added?
 * Complements the RGBA colors, providing opaque colors for borders and text,
 * ensuring they are clearly visible against the image.
 */
export const RANDOM_SOLID_COLORS = [
  'red',
  'blue',
  'green',
  'yellow',
  'magenta',
  'cyan',
  'purple',
  'orange',
  'pink',
  'brown',
  'darkgreen',
  'indigo',
  'violet',
  'gold',
  'springgreen',
  'cornflowerblue',
  'chocolate',
  'lightblue',
  'khaki',
  'turquoise',
  'tomato',
  'palegreen',
  'skyblue',
  'darkorange',
]
