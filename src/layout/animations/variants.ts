// src/animations/variants.ts

import type { Variants } from 'motion/react'

/**
 * Variantes de animação comuns para entrada/saída de componentes.
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
      delayChildren: 0.3, // Atraso para animar itens filhos
      staggerChildren: 0.1, // Atraso entre a animação de cada item filho
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

/**
 * Variantes de animação para itens dentro de um container (usadas com staggerChildren).
 */
export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

/**
 * Variantes de animação para hover.
 */
export const hoverScaleVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 10 } },
  tap: { scale: 0.95 },
}

/**
 * Variantes para uma animação de fade in simples.
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

/**
 * Exemplo de variantes para diferentes direções de slide.
 */
export const slideInFromLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
}

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
}

export const slideFromBottomExit: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  // exit: { opacity: 0, y: -50, transition: { duration: 0.3, ease: 'easeIn' } }, // <-- Adicionado estado de saída
}

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, x: -100 }, // Estado inicial da página
  animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }, // Animação de entrada
  // exit: { opacity: 0, x: 100, transition: { duration: 0.5, ease: 'easeIn' } }, // Animação de saída
}

// ... adicione mais variantes conforme a necessidade
