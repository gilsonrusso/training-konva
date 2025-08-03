import { Paper, type PaperProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { motion } from 'motion/react'
import { forwardRef, type ComponentPropsWithRef } from 'react'

export const ItemStyled = styled(Paper)<PaperProps>(({ theme }) => ({
  // backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  // borderRadius: theme.shape.borderRadius,
}))

export const MotionItem = motion.create(ItemStyled)

// 3. **INFERIR as props do MotionItemStyled**
// Isso pega todas as props que MotionItemStyled aceita (MUI Paper props + Motion props)
type MotionStackStyledCombinedProps = ComponentPropsWithRef<typeof MotionItem>

type AnimatedItemProps = MotionStackStyledCombinedProps & {}

// 5. Use React.forwardRef para que ItemMotion possa receber e repassar a 'ref'
export const AnimatedItemStyled = forwardRef<HTMLDivElement, AnimatedItemProps>(
  function MotionItemStyled(
    { children, initial = 'hidden', animate = 'visible', transition, ...rest },
    ref
  ) {
    return (
      <MotionItem
        ref={ref}
        initial={initial}
        animate={animate}
        transition={transition}
        whileInView={{ opacity: 1 }}
        {...rest}
      >
        {children}
      </MotionItem>
    )
  }
)
