import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { RootObject } from './steppers/stepThree/AppStepThree'

// Componente para a visualização da imagem em tela cheia
interface ImageModalProps {
  open: boolean
  imageUrl: string
  onClose: () => void
}

type TestAccordionProps = {
  data: RootObject[]
}

const modalVariants = {
  initial: { opacity: 0 },
  open: { opacity: 1 },
  closed: { opacity: 0 },
}

const ImageModal: React.FC<ImageModalProps> = ({ open, imageUrl, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          variants={modalVariants}
          initial="initial"
          animate="open"
          exit="closed"
          transition={{ type: 'tween', duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1301,
          }}
          onClick={onClose}
        >
          <IconButton
            aria-label="close"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            sx={{
              position: 'fixed',
              right: 20,
              top: 20,
              color: 'white',
              zIndex: 1302,
            }}
          >
            <CloseIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <motion.img
            layoutId={`image-${imageUrl}`}
            src={imageUrl}
            alt="Imagem Ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              zIndex: 1301,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const TestAccordionWithCards = ({ data }: TestAccordionProps) => {
  const [openImage, setOpenImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setOpenImage(true)
  }

  const handleCloseImage = () => {
    setOpenImage(false)
    setSelectedImage('')
  }

  return (
    <Box>
      {data.map((root) => (
        <Accordion defaultExpanded key={root.id} id={`accordion-${root.id}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              ID: {root.id} — {root.title}{' '}
              <Chip
                label={root.status}
                color={root.status === 'Pass' ? 'success' : 'error'}
                size="small"
                sx={{ ml: 2 }}
              />
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Grid container spacing={2}>
              {root.list.map((listItem) =>
                listItem.testcase.map((test) => (
                  <Grid size={{ xs: 12, sm: 6, md: 2 }} key={test.id}>
                    <Card sx={{ maxWidth: 345 }} id={`card-${root.id}-${test.id}`}>
                      <CardContent>
                        <Typography gutterBottom variant="body2" component="div">
                          Labels: {test.label.join(' / ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <ul style={{}}>
                            {test.test.map((t, idx) => (
                              <li key={idx}>
                                {t.name} —{' '}
                                <strong
                                  style={{
                                    color: t.status === 'pass' ? 'green' : 'red',
                                  }}
                                >
                                  {t.status.toUpperCase()}
                                </strong>
                              </li>
                            ))}
                          </ul>
                        </Typography>
                      </CardContent>
                      {/* <CardActions>
                        <Button size="small">Detalhes</Button>
                      </CardActions> */}
                      <CardMedia
                        component="img"
                        alt={test.label.join(', ')}
                        height="140"
                        image={test.image}
                        onClick={() => handleOpenImage(test.image)}
                      />
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <ImageModal open={openImage} imageUrl={selectedImage} onClose={handleCloseImage} />
    </Box>
  )
}
