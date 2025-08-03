import { Stack, type StackProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { motion } from 'motion/react'
import { forwardRef, type ComponentPropsWithRef } from 'react'

export const StackStyled = styled(Stack)<StackProps>(({ theme }) => ({
  // backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  // borderRadius: theme.shape.borderRadius,
}))

export const MotionStack = motion.create(StackStyled)

// 3. **INFERIR as props do MotionStackStyled**
// Isso pega todas as props que MotionGridStyled aceita (MUI Stack props + Motion props)
type MotionStackStyledCombinedProps = ComponentPropsWithRef<typeof MotionStack>

type AnimatedGridProps = MotionStackStyledCombinedProps & {}

// 5. Use React.forwardRef para que StackMotion possa receber e repassar a 'ref'
export const AnimatedStackStyled = forwardRef<HTMLDivElement, AnimatedGridProps>(
  function MotionStackStyled(
    { children, initial = 'hidden', animate = 'visible', transition, ...rest },
    ref
  ) {
    return (
      <MotionStack
        ref={ref}
        initial={initial}
        animate={animate}
        transition={transition}
        whileInView={{ opacity: 1 }}
        {...rest}
      >
        {children}
      </MotionStack>
    )
  }
)
