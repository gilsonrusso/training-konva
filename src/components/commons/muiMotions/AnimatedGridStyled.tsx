import Grid, { type GridProps } from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { motion } from 'motion/react'
import { forwardRef, type ComponentPropsWithRef } from 'react'

export const GridStyled = styled(Grid)<GridProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}))

export const MotionGrid = motion.create(GridStyled)

// 3. **INFERIR as props do MotionGridStyled**
// Isso pega todas as props que MotionGridStyled aceita (MUI Grid props + Motion props)
type MotionGridStyledCombinedProps = ComponentPropsWithRef<typeof MotionGrid>

type AnimatedGridProps = MotionGridStyledCombinedProps & {}

// 5. Use React.forwardRef para que GridMotion possa receber e repassar a 'ref'
export const AnimatedGridStyled = forwardRef<HTMLDivElement, AnimatedGridProps>(
  function MotionGridStyled(
    { children, initial = 'hidden', animate = 'visible', transition, ...rest },
    ref
  ) {
    return (
      <MotionGrid
        ref={ref}
        initial={initial}
        animate={animate}
        transition={transition}
        whileInView={{ opacity: 1 }}
        {...rest}
      >
        {children}
      </MotionGrid>
    )
  }
)
