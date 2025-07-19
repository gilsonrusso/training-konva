import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Box, Grid, IconButton, Paper, useTheme } from '@mui/material'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import { useEffect, useRef } from 'react' // Import useEffect
import type { ImageWithRects } from '../../types/Shapes'
import { Dot } from '../muiStyled/DotStyled'

type ImageCarouselProps = {
  images: ImageWithRects[]
  selectedImage: ImageWithRects | null
  onSetSelectedImage: (image: ImageWithRects) => void
}
const IMAGE_ITEM_WIDTH = 108
const SCALE_FACTOR = 1.2

export const ImageCarousel = ({
  images,
  selectedImage,
  onSetSelectedImage,
}: ImageCarouselProps) => {
  const scrollContainerRef = useRef<HTMLUListElement | null>(null)

  const theme = useTheme()

  const isActiveImageOnCarousel = (id: string) => selectedImage?.id && selectedImage.id === id

  const scroll = (direction: string) => {
    if (scrollContainerRef.current) {
      const currentScrollLeft = scrollContainerRef.current.scrollLeft
      let targetScrollLeft = currentScrollLeft

      if (direction === 'left') {
        targetScrollLeft = Math.max(0, currentScrollLeft - IMAGE_ITEM_WIDTH)
      } else {
        targetScrollLeft = Math.min(
          scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth,
          currentScrollLeft + IMAGE_ITEM_WIDTH
        )
      }

      scrollContainerRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  const scrollToImageByIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const targetScrollLeft = index * IMAGE_ITEM_WIDTH
      scrollContainerRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    if (selectedImage && scrollContainerRef.current) {
      const selectedIndex = images.findIndex((img) => img.id === selectedImage.id)
      if (selectedIndex !== -1) {
        scrollToImageByIndex(selectedIndex)
      }
    }
  }, [selectedImage, images])

  return (
    <Box>
      <Grid
        sx={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // paddingY: `${(100 * (SCALE_FACTOR - 1)) / 2}px`,?
        }}
      >
        <IconButton
          disabled={!selectedImage || images[0].id === selectedImage.id}
          onClick={() => scroll('left')}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <ImageList
          ref={scrollContainerRef}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            paddingX: '2px',
            overflowX: 'hidden',
            overflowY: 'hidden',
            marginX: '8px',
            padding: '10px',
            msOverflowStyle: 'none', // IE and Edge
            scrollbarWidth: 'none', // Firefox
            scrollBehavior: 'smooth', // Ensure smooth scroll
            // Optional: Add scroll-snap-type for better UX on manual scrolls
            scrollSnapType: 'x mandatory',
          }}
          rowHeight={80}
        >
          {images &&
            images.map((imgItem) => (
              <ImageListItem
                key={imgItem.id}
                onClick={() => onSetSelectedImage(imgItem)}
                sx={{
                  minWidth: 80,
                  maxWidth: 80,
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  marginX: selectedImage?.id === imgItem.id ? 2 : 0,
                  zIndex: selectedImage?.id === imgItem.id ? 1 : 0,
                  // Ensure scroll-snap-align is set for each item
                  scrollSnapAlign: 'start',
                  // --- New styles for scaling effect ---
                  transform: isActiveImageOnCarousel(imgItem.id)
                    ? `scale(${SCALE_FACTOR})`
                    : 'scale(1)',
                  transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out',
                }}
              >
                <img
                  src={imgItem.image.src}
                  alt={`img-${imgItem.id}`}
                  loading="lazy"
                  style={{
                    border: `
                      ${
                        selectedImage?.id === imgItem.id
                          ? `2px solid ${theme.palette.primary.main}`
                          : '1px solid gray'
                      }
                    `,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </ImageListItem>
            ))}

          {images.length === 0 &&
            Array.from({ length: 9 }).map((_, index) => (
              <Paper key={`paper-${index}`} style={{ height: '80px', width: '80px' }}></Paper>
            ))}
        </ImageList>
        <IconButton
          disabled={!selectedImage || images[images.length - 1].id === selectedImage.id}
          onClick={() => scroll('right')}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Grid>
      {/* Indicator dots */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 2,
        }}
      >
        {images.map((image) => (
          <Dot
            key={`dot-${image.id}`}
            active={image.id === selectedImage?.id}
            onClick={() => onSetSelectedImage(image)}
          />
        ))}
        {images.length == 0 &&
          Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={`box-${index}`}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.grey[700],
                margin: '8px 4px',
              }}
            >
              <></>
            </Box>
          ))}
      </Box>
    </Box>
  )
}
