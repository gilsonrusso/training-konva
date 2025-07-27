import Box, { type BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { motion } from 'motion/react'
import { forwardRef, type ComponentPropsWithRef } from 'react'
import { containerVariants } from '../../../layout/animations/variants'

export const BoxStyled = styled(Box)<BoxProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}))

export const MotionBoxStyled = motion.create(BoxStyled)
type MotionBoxStyledCombinedProps = ComponentPropsWithRef<typeof MotionBoxStyled>

type AnimatedBoxProps = MotionBoxStyledCombinedProps & {}

export const AnimatedBoxStyled = forwardRef<HTMLDivElement, AnimatedBoxProps>(function AnimatedBox(
  {
    children,
    variants = containerVariants,
    initial = 'initial',
    animate = 'animate',
    exit = 'exit',
    transition,
    ...restProps
  },
  ref
) {
  return (
    <MotionBoxStyled
      ref={ref}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      {...restProps}
    >
      {children}
    </MotionBoxStyled>
  )
})
