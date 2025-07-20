import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import AdUnitsOutlinedIcon from '@mui/icons-material/AdUnitsOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import Crop54Icon from '@mui/icons-material/Crop54'
import GestureOutlinedIcon from '@mui/icons-material/GestureOutlined'
import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material' // Material-UI components for the visual interface
import type Konva from 'konva' // Types for the Konva.js library
import React, { useCallback, useEffect, useRef, useState, type ElementType } from 'react' // Essential React hooks and types
import {
  Image as KonvaImage,
  Line as KonvaLine,
  Rect as KonvaRect,
  Text as KonvaText,
  Layer,
  Stage,
} from 'react-konva' // Konva components for drawing on the canvas
import { v4 as uuidv4 } from 'uuid' // For generating unique IDs for rectangles
import { useSnackbar } from '../contexts/SnackBarContext'
import { useDrawerContext } from '../pages/Training'
import type { ImageWithRects, RectShape } from '../types/Shapes' // Custom types for images and shapes
import { ImageCarousel } from './commons/AppCarouselImage' // Component to display the image carousel
import { GridStyled } from './muiStyled/GridStyled' // Styled Grid component from Material-UI

// --- Enum and Type Definitions ---

/**
 * @enum {DrawTools}
 * @description Defines the drawing tools available in the application.
 * Why is this added?
 * To standardize and easily manage the tools that the user can select,
 * making the code more readable and less prone to string typos.
 */
export enum DrawTools {
  Select = 'select', // Tool for selecting and moving objects
  Rectangle = 'Rectangle', // Tool for drawing rectangles
  Circle = 'circle', // Tool for drawing circles (not yet implemented, but planned)
  Arrow = 'Arrow', // Tool for drawing arrows (not yet implemented, but planned)
  Brush = 'brush', // Tool for free drawing (not yet implemented, but planned)
  Eraser = 'eraser', // Tool for erasing (not yet implemented, but planned)
}

/**
 * @function downloadURI
 * @description Downloads a URI (usually a base64 image) as a file.
 * @param {Object} props - Object containing the URI and the file name.
 * Why is this added?
 * Allows the user to export the annotated image, transforming the canvas content
 * into a PNG file that can be saved locally.
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
 * @description Array of RGBA colors for filling rectangles (with transparency).
 * Why is this added?
 * Provides a variety of colors for the drawn rectangles, with transparency
 * so that the underlying image is still visible.
 */
const RGBA_COLORS = [
  'rgba(255, 0, 0, 0.3)', // Red
  'rgba(0, 0, 255, 0.3)', // Blue
  'rgba(0, 255, 0, 0.3)', // Green
  'rgba(255, 255, 0, 0.3)', // Yellow
  'rgba(255, 0, 255, 0.3)', // Magenta
  'rgba(0, 255, 255, 0.3)', // Cyan
  'rgba(128, 0, 128, 0.3)', // Purple
  'rgba(255, 165, 0, 0.3)', // Orange
]

/**
 * @constant {string[]} SOLID_COLORS
 * @description Array of solid colors for rectangle borders and text.
 * Why is this added?
 * Complements the RGBA colors, providing opaque colors for borders and text,
 * ensuring they are clearly visible against the image.
 */
const SOLID_COLORS = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'purple', 'orange']

/**
 * @constant {PaintOptions[]} PAINT_OPTIONS
 * @description Array of objects representing the drawing tool options, including Material-UI icons.
 * Why is this added?
 * Facilitates the dynamic rendering of tool buttons in the user interface,
 * associating an ID, a label, and an icon for each tool.
 */
export const PAINT_OPTIONS: PaintOptions[] = [
  { id: DrawTools.Select, label: 'Select', icon: AdsClickOutlinedIcon, disabled: false },
  { id: DrawTools.Rectangle, label: 'Rectangle', icon: Crop54Icon, disabled: false },
  { id: DrawTools.Circle, label: 'Circle', icon: CircleOutlinedIcon, disabled: true },
  { id: DrawTools.Brush, label: 'Free Draw', icon: GestureOutlinedIcon, disabled: true },
  { id: DrawTools.Arrow, label: 'Arrow', icon: ArrowOutwardOutlinedIcon, disabled: true },
  { id: DrawTools.Eraser, label: 'Eraser', icon: AdUnitsOutlinedIcon, disabled: true },
]

// --- Property Types ---

/**
 * @typedef {Object} downloadURIProps
 * @property {string | undefined} uri - The data URI (e.g., base64) to be downloaded.
 * @property {string} name - The file name for the download.
 * Why is this added?
 * Defines the expected structure for the `downloadURI` function arguments, improving code safety and readability.
 */
type downloadURIProps = {
  uri: string | undefined
  name: string
}

/**
 * @typedef {Object} PaintOptions
 * @property {DrawTools} id - The unique ID of the drawing tool (from the DrawTools enum).
 * @property {string} label - The visible text label for the tool.
 * @property {ElementType} icon - The Material-UI icon component for the tool.
 * @property {string} [color] - Optional color for the tool.
 * Why is this added?
 * Defines the format of the objects within the `PAINT_OPTIONS` array, ensuring consistency.
 */
type PaintOptions = {
  id: DrawTools
  label: string
  icon: ElementType
  color?: string
  disabled: boolean
}

/**
 * @typedef {CurrentDrawTool}
 * @description Type for the `currentTool` state, ensuring it only accepts values from the `DrawTools` enum.
 * Why is this added?
 * Ensures that the selected tool is always one of the valid defined values,
 * preventing logic errors and improving type safety.
 */
type CurrentDrawTool = (typeof DrawTools)[keyof typeof DrawTools]

/**
 * @typedef {Object} AppDrawerStageProps
 * @description Defines the properties (props) that the `AppDrawerStage` component expects to receive.
 * Why is this added?
 * Ensures that the component receives the necessary data and functions to operate correctly,
 * such as the list of images, the selected image, the current label, and callbacks to update states.
 */
type AppDrawerStageProps = {
  images: ImageWithRects[] // List of all loaded images
  selectedImage: ImageWithRects | null // The currently selected image for editing
  onSetSelectedImage: (image: ImageWithRects) => void // Callback to change the selected image
  onUpdateImageRects: (updatedImage: ImageWithRects) => void // Callback to update the rectangles for an image
  onSetExportFunction: (exportFn: () => void) => void // Callback to pass the export function to the parent
}

// --- Main Component: AppDrawerStage ---

export const AppDrawerStage = ({
  images,
  selectedImage,
  onUpdateImageRects,
  onSetExportFunction,
  onSetSelectedImage,
}: AppDrawerStageProps) => {
  // --- Component States ---

  /**
   * @state {CurrentDrawTool} currentTool
   * @description Stores the currently selected drawing tool by the user.
   * Why is this added?
   * Controls the mouse behavior on the canvas (drawing rectangles, moving images, etc.)
   * and the visual style of the active tool button.
   */
  const [currentTool, setCurrentTool] = useState<CurrentDrawTool>(DrawTools.Select)

  /**
   * @state {RectShape | null} newRect
   * @description Stores the data of the rectangle being drawn (while the mouse is pressed).
   * Why is this added?
   * Allows the rectangle to be rendered and updated in real-time as the user drags the mouse,
   * before it is finalized and added to the image's list of rectangles.
   */
  const [newRect, setNewRect] = useState<RectShape | null>(null)

  /**
   * @state {boolean} isDrawing
   * @description Indicates whether the user is currently dragging the mouse to draw a shape.
   * Why is this added?
   * Acts as a flag to control the logic of `handleMouseMove` and `handleMouseUp`,
   * ensuring that drawing only occurs when the mouse button is pressed and the drawing tool is active.
   */
  const [isDrawing, setIsDrawing] = useState<boolean>(false)

  // --- STATES FOR ZOOM AND PAN ---
  /**
   * @state {number} scale
   * @description Controls the zoom level of the image and objects on the Konva Layer.
   * Why is this added?
   * Allows the user to zoom in or out of the image view,
   * which is essential for detailed annotation work.
   */
  const [scale, setScale] = useState(0.5) // Initial zoom. A value of 0.5 makes the image start smaller than the stage.

  /**
   * @state {number} stageX
   * @description Controls the X position of the Konva Layer within the Stage (for horizontal pan).
   * Why is this added?
   * Allows the user to "drag" the image horizontally within the viewing area,
   * especially when the image is larger than the stage or is zoomed in.
   */
  const [stageX, setStageX] = useState(0)

  /**
   * @state {number} stageY
   * @description Controls the Y position of the Konva Layer within the Stage (for vertical pan).
   * Why is this added?
   * Allows the user to "drag" the image vertically within the viewing area.
   */
  const [stageY, setStageY] = useState(0)

  const theme = useTheme()
  const { classItems, classItemSelected } = useDrawerContext()
  const { showMessage } = useSnackbar()

  // --- DOM and Konva References ---

  /**
   * @ref {Konva.Stage | null} stageRef
   * @description Direct reference to the Konva Stage object.
   * Why is this added?
   * Allows access to Konva Stage methods and properties (e.g., `toDataURL` for export, `getPointerPosition` for mouse coordinates).
   */
  const stageRef = useRef<Konva.Stage | null>(null)

  /**
   * @ref {HTMLDivElement | null} containerRef
   * @description Reference to the DIV element that contains the Konva Stage.
   * Why is this added?
   * Used to get the dynamic dimensions of the available area for the canvas, ensuring
   * that the Stage adapts to the container's layout.
   */
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * @state {Object} dimensions
   * @property {number} width - Current width of the Stage container.
   * @property {number} height - Current height of the Stage container.
   * Why is this added?
   * Stores the dimensions of the drawing area so that the Konva Stage can be sized correctly,
   * adapting to different screen sizes or UI layouts.
   */
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  /**
   * @state {Object | null} crosshairPos
   * @description Stores the X and Y position of the mouse on the screen to render the crosshair.
   * Why is this added?
   * Provides visual feedback to the user, showing the exact mouse position over the image,
   * useful for drawing precision.
   */
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null)

  // --- Logic Functions ---

  /**
   * @function exportCanvas
   * @description Memoized function to export the current content of the Konva Stage as a PNG image.
   * Why is this added?
   * It is a crucial functionality for the user to save their annotation work.
   * `useCallback` is used for optimization, preventing the function from being recreated on each render,
   * unless `selectedImage` changes.
   */
  const exportCanvas = useCallback(() => {
    if (!stageRef.current) {
      showMessage('No drawing stage found to export.')
      return
    }
    // Converts the Stage to a data URL (Base64 PNG) with a pixelRatio of 3 for higher quality
    const dataUri = stageRef.current.toDataURL({ pixelRatio: 3 })
    downloadURI({
      uri: dataUri,
      name: `annotated_${selectedImage?.image.src.split('/').pop() || 'image'}.png`, // File name based on the original image
    })
  }, [selectedImage?.image.src, showMessage]) // Depends on selectedImage for the file name

  // --- Mouse Event Handlers ---

  /**
   * @function handleMouseDown
   * @description Handles the mouse click/press event on the Stage.
   * Why is this added?
   * It's the entry point to start panning (if 'Select' is active) or to start drawing a new shape.
   * Calculates the initial shape position in the Layer's coordinate system (which is scaled and moved).
   */
  const handleMouseDown = () => {
    const stage = stageRef.current
    if (!stage || !selectedImage) return

    // If the tool is 'select', only allows dragging the stage (pan), not starting a shape draw.
    if (currentTool === DrawTools.Select) {
      setIsDrawing(false) // Indicates we are not drawing a new shape, but interacting with the stage/image.
      return
    }

    // Prevents drawing if no label is provided.
    if (classItemSelected === -1) {
      showMessage('Please enter a label for the rectangle before drawing.')
      return
    }

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Gets the Layer that contains the image and drawn shapes.
    const layer = stage.getLayers()[0]
    if (!layer) return

    // IMPORTANT: Inverts the Layer's transformation to get the mouse click coordinates
    // in the Layer's "original" coordinate system (without zoom or pan applied).
    // This is crucial for the rectangle to be drawn at the correct coordinates,
    // regardless of the current zoom and pan.
    const transform = layer.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer) // 'pos' are now the coordinates inside the Layer.

    setIsDrawing(true) // Activates the drawing flag.

    // Selects random colors for the new rectangle.
    const randomIndex = Math.floor(Math.random() * RGBA_COLORS.length)
    const randomRgbaColor = RGBA_COLORS[randomIndex]
    const randomSolidColor = SOLID_COLORS[randomIndex]

    // Initializes `newRect` with starting coordinates and a unique ID.
    const newRect: RectShape = {
      x: pos.x, // Initial X coordinate of the rectangle in the Layer.
      y: pos.y, // Initial Y coordinate of the rectangle in the Layer.
      width: 0,
      height: 0,
      label: classItems[classItemSelected],
      id: `rect-${uuidv4()}`,
      color: randomRgbaColor,
      solidColor: randomSolidColor,
    }
    setNewRect(newRect)
  }

  /**
   * @function handleMouseMove
   * @description Handles the mouse move event on the Stage.
   * Why is this added?
   * Updates the dimensions of the `newRect` in real-time as the user drags,
   * and also updates the crosshair position.
   */
  const handleMouseMove = () => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Updates the crosshair position, which follows the mouse position on the screen (Stage coordinates).
    setCrosshairPos(pointerPosition)

    // If the tool is 'Select' or if not currently drawing, do nothing for rectangle drawing.
    if (currentTool === DrawTools.Select || !isDrawing || !newRect) {
      return
    }

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const layer = stage.getLayers()[0]
    if (!layer) return

    // Again, inverts the Layer's transformation to get the current mouse position
    // in the Layer's coordinate system.
    const transform = layer.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    // Calculates the width and height of the rectangle based on the starting position (`newRect.x`, `newRect.y`)
    // and the current mouse position (`pos.x`, `pos.y`).
    const width = pos.x - newRect.x
    const height = pos.y - newRect.y

    // Updates the `newRect` state to render the growing rectangle.
    setNewRect({
      ...newRect,
      width,
      height,
    })
  }

  /**
   * @function handleMouseUp
   * @description Handles the mouse button release event on the Stage.
   * Why is this added?
   * Finalizes the drawing process: adjusts the rectangle, adds it to the image's list of rectangles,
   * and resets drawing states. Additionally, **automatically switches the tool to 'Select'.**
   */
  const handleMouseUp = () => {
    setIsDrawing(false) // Deactivates the drawing flag.

    // If the tool is 'Select', it means the user was dragging the stage (pan),
    // so there's no rectangle to finalize.
    if (currentTool === DrawTools.Select) {
      return
    }

    // Ensures there is a `newRect` and a `selectedImage` to proceed.
    if (!newRect || !selectedImage) return

    // Adjusts the rectangle to ensure `width` and `height` are always positive values,
    // regardless of the direction the user dragged the mouse.
    // Also adjusts `x` and `y` if the drag was to the left or up.
    const finalRect = {
      ...newRect,
      x: newRect.width < 0 ? newRect.x + newRect.width : newRect.x,
      y: newRect.height < 0 ? newRect.y + newRect.height : newRect.y,
      width: Math.abs(newRect.width), // Uses absolute value for width
      height: Math.abs(newRect.height), // Uses absolute value for height
    }

    // Adds the rectangle to the selected image's list of rectangles only if it has a minimum size.
    // This prevents accidental tiny rectangles.
    if (finalRect.width > 5 && finalRect.height > 5) {
      const updatedSelectedImage: ImageWithRects = {
        ...selectedImage,
        rects: [...selectedImage.rects, finalRect], // Adds the new rectangle
      }
      onUpdateImageRects(updatedSelectedImage) // Updates the image state in the parent component.
      // --- Feature Addition: Switch to Select Tool ---
      // Why is this added?
      // After the user draws and releases a rectangle, it's natural for them to immediately
      // want to move or resize that rectangle (or others). Switching the tool to 'Select'
      // automatically improves the user experience, making the workflow more efficient.
      setCurrentTool(DrawTools.Select)
    }

    setNewRect(null) // Clears the `newRect` state, removing it from rendering.
  }

  /**
   * @function handleWheel
   * @description Handles the mouse wheel event for zoom and pan.
   * Why is this added?
   * Allows the user to use the mouse wheel to control the image zoom,
   * which is an intuitive and fast way to navigate the view.
   */
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault() // Prevents default browser behavior (page scrolling).

    const stage = stageRef.current
    if (!stage) return

    const scaleBy = 1.2 // Factor by which the zoom increases or decreases.
    const oldScale = scale // The current scale of the Layer.

    const pointer = stage.getPointerPosition() // Mouse position on the Stage.
    if (!pointer) return

    const stageMouseX = pointer.x
    const stageMouseY = pointer.y

    // Calculates the point in the Layer's coordinate system that is under the mouse.
    // This is crucial for the zoom to appear "centered" on the mouse point.
    const mousePointTo = {
      x: (stageMouseX - stageX) / oldScale,
      y: (stageMouseY - stageY) / oldScale,
    }

    // Determines the new scale based on the direction of the mouse wheel.
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limits the zoom to prevent the image from becoming too small or too large.
    const minScale = 0.05
    const maxScale = 10
    newScale = Math.max(minScale, Math.min(newScale, maxScale))

    setScale(newScale) // Updates the scale state.

    // Calculates the new Layer position (pan) so that the point under the mouse remains in the same place
    // on the screen after zooming. This creates the illusion of "zoom to mouse center".
    const newPos = {
      x: stageMouseX - mousePointTo.x * newScale,
      y: stageMouseY - mousePointTo.y * newScale,
    }
    setStageX(newPos.x) // Updates the Layer's X position.
    setStageY(newPos.y) // Updates the Layer's Y position.
  }

  // --- Side Effects (useEffect) ---

  /**
   * @effect
   * @description Passes the `exportCanvas` function to the parent component.
   * Why is this added?
   * Allows a parent component to trigger the canvas export functionality,
   * even if the export button is located elsewhere in the UI.
   * `exportCanvas` is a dependency because it is the function being passed.
   */
  useEffect(() => {
    onSetExportFunction(exportCanvas)
  }, [onSetExportFunction, exportCanvas])

  /**
   * @effect
   * @description Calculates and updates the dimensions of the Stage container.
   * Why is this added?
   * Ensures that the Konva Stage always has the correct dimensions of the available space,
   * adapting to window resizes or layout changes.
   * Adds a 'resize' event listener and removes it on component unmount.
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

    updateSize() // Calls once on component mount to set initial dimensions.
    window.addEventListener('resize', updateSize) // Listens for window resize events.
    return () => window.removeEventListener('resize', updateSize) // Cleans up the event listener on unmount.
  }, []) // Empty dependency array means this effect runs only once (on mount and cleanup).

  /**
   * @effect --- LAST CHANGE: Center the image and reset zoom when changing images ---
   * @description Resets zoom and centers the image on the stage whenever a new image is selected or stage dimensions change.
   * Why is this added?
   * Improves usability, as the user will always see the new image in a consistent position and zoom (centered and with initial zoom),
   * eliminating the need to manually adjust zoom and pan with each image change.
   * Also ensures that centering is recalculated if the screen size changes.
   */
  useEffect(() => {
    // Checks if there is a `selectedImage` and if the `dimensions` of the stage have already been calculated (greater than 0).
    if (selectedImage && dimensions.width > 0 && dimensions.height > 0) {
      setScale(0.5) // Resets the zoom to the desired initial value (half of the image's original size).

      // Calculates the width and height of the image **scaled** by the initial zoom (0.5).
      const scaledImageWidth = selectedImage.image.width * 0.5
      const scaledImageHeight = selectedImage.image.height * 0.5

      // Calculates the necessary X and Y offsets to center the scaled image within the stage.
      // (Stage width - scaled image width) / 2
      const offsetX = (dimensions.width - scaledImageWidth) / 2
      const offsetY = (dimensions.height - scaledImageHeight) / 2

      setStageX(offsetX) // Sets the Layer's X position to center.
      setStageY(offsetY) // Sets the Layer's Y position to center.
    } else if (!selectedImage) {
      // If no image is selected (e.g., at the start or after removing all),
      // resets the position to 0,0 to ensure a clean state.
      setStageX(0)
      setStageY(0)
    }
  }, [selectedImage, dimensions.width, dimensions.height]) // This effect re-runs when the selected image changes or when stage dimensions change.

  // --- Component Rendering ---

  return (
    <Grid container spacing={0.5} flexDirection={'column'} flexGrow={1} overflow={'hidden'}>
      {/* Top section of the interface: Tool buttons and drawing area */}
      <GridStyled
        sx={{
          borderRadius: '0 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
        flexGrow={3} // Occupies more vertical space than the carousel
      >
        {/* Container for the tool buttons */}
        <Grid container spacing={1} columns={12} sx={{ marginY: 2, justifyContent: 'center' }}>
          {PAINT_OPTIONS.map(({ icon: Icon, id }) => (
            <React.Fragment key={id}>
              <Grid>
                <IconButton
                  onClick={() => setCurrentTool(id)} // Sets the active tool on click
                  color={currentTool === id ? 'primary' : 'default'} // Changes color if it's the active tool
                  disabled={!selectedImage} // Disables tool buttons if no image is selected
                >
                  <Icon /> {/* Renders the tool icon */}
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        {/* Area encapsulating the Konva Stage, responsible for managing its dimensions */}
        <Box
          flexGrow={1}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* The container for the Konva Stage, with hidden overflow to manage zoom/pan */}
          <Box
            sx={{
              border: `1px dashed ${theme.palette.grey[400]}`, // Border for visualization of the Stage area
              overflow: 'hidden', // Important so that the Stage content doesn't overflow when panning/zooming
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: 'calc(100% - 20px)', // Inner margin for the Stage
              maxHeight: 'calc(100% - 20px)',
            }}
            ref={containerRef} // Assigns the reference to capture dimensions
          >
            {/* Message displayed when no image is selected */}
            {!selectedImage && (
              <Typography variant="h6" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
                Please select or upload an image to start drawing.
              </Typography>
            )}
            {/* The Konva Stage, rendered only if an image is selected */}
            {selectedImage && (
              <Stage
                width={dimensions.width} // Konva Stage width, based on containerRef dimensions
                height={dimensions.height} // Konva Stage height
                ref={stageRef} // Assigns the reference to the Konva Stage
                onMouseDown={handleMouseDown} // Handles the start of interactions (pan or draw)
                onMousemove={handleMouseMove} // Handles mouse movement (update shape or crosshair)
                onMouseup={handleMouseUp} // Handles the end of interaction (finalize shape)
                onMouseLeave={() => setCrosshairPos(null)} // Hides crosshair when mouse leaves Stage
                onMouseEnter={() => {
                  const stage = stageRef.current
                  if (!stage) return
                  const pointer = stage.getPointerPosition()
                  if (pointer) setCrosshairPos(pointer)
                }} // Shows crosshair when mouse enters Stage
                onWheel={handleWheel} // Enables zoom with the mouse wheel
              >
                {/* The Konva Layer where the image and all drawn objects live. */}
                {/* ALL zoom transformations (scaleX, scaleY) and pan (x, y) are applied here, */}
                {/* and the draggable capability as well. This ensures that the image and shapes */}
                {/* move and scale together. */}
                <Layer
                  scaleX={scale} // Applies horizontal zoom factor
                  scaleY={scale} // Applies vertical zoom factor
                  x={stageX} // Applies horizontal offset (pan)
                  y={stageY} // Applies vertical offset (pan)
                  draggable={currentTool === DrawTools.Select} // Makes the Layer draggable only if the 'Select' tool is active
                >
                  {/* KonvaImage component to display the selected image */}
                  {selectedImage && (
                    <KonvaImage
                      x={0} // The image starts at (0,0) within its Layer
                      y={0}
                      width={selectedImage.image.width} // Uses original image dimensions (scale is applied to the Layer)
                      height={selectedImage.image.height}
                      image={selectedImage.image} // The image itself (JS Image object)
                    />
                  )}
                  {/* Renders the crosshair (lines that follow the mouse) */}
                  {crosshairPos && (
                    <>
                      {/* Vertical crosshair line. Points are converted from Stage to Layer. */}
                      <KonvaLine
                        points={[
                          (crosshairPos.x - stageX) / scale, // X coordinate relative to the Layer
                          0,
                          (crosshairPos.x - stageX) / scale,
                          selectedImage.image.height, // Extends across the full height of the image in the Layer
                        ]}
                        stroke="blue"
                        strokeWidth={1 / scale} // Adjusts line thickness to appear constant on zoom
                        dash={[4 / scale, 4 / scale]} // Adjusts dash pattern to appear constant
                      />
                      {/* Horizontal crosshair line */}
                      <KonvaLine
                        points={[
                          0,
                          (crosshairPos.y - stageY) / scale, // Y coordinate relative to the Layer
                          selectedImage.image.width, // Extends across the full width of the image in the Layer
                          (crosshairPos.y - stageY) / scale,
                        ]}
                        stroke="blue"
                        strokeWidth={1 / scale}
                        dash={[4 / scale, 4 / scale]}
                      />
                    </>
                  )}
                  {/* Maps and renders all already annotated rectangles on the selected image */}
                  {selectedImage &&
                    selectedImage.rects.map((rc) => (
                      // React.Fragment is used to group the text and rectangle under the same key
                      <React.Fragment key={rc.id}>
                        <KonvaText
                          text={rc.label} // Rectangle label text
                          x={rc.x} // X position of the text (same as rectangle)
                          y={rc.y - 20} // Y position of the text (above the rectangle)
                          width={rc.width} // Width of the text space
                          fontSize={12}
                          fill={rc.solidColor || 'blue'} // Text color
                          align="left" // Text alignment
                        />
                        <KonvaRect
                          {...rc} // Spreads all properties of the 'rc' object (x, y, width, height, etc.)
                          stroke={rc.solidColor || 'red'} // Border color
                          strokeWidth={2} // Border thickness
                          fill={rc.color || 'rgba(255, 0, 0, 0.3)'} // Fill color
                        />
                      </React.Fragment>
                    ))}

                  {/* Renders the rectangle currently being drawn (not yet finalized) */}
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
      {/* Bottom section of the interface: Image carousel */}
      <GridStyled
        flexGrow={1}
        sx={{
          padding: '5px',
          width: '100%',
          maxHeight: '170px', // Maximum height for the carousel
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '0 0 8px 0',
        }}
      >
        {/* ImageCarousel component to display and allow image selection */}
        <ImageCarousel
          images={images} // All available images
          selectedImage={selectedImage} // The currently selected image
          onSetSelectedImage={onSetSelectedImage} // Callback to update the selected image
        />
      </GridStyled>
    </Grid>
  )
}
