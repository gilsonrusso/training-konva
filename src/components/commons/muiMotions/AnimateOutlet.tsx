// src/components/AnimatedOutlet.tsx
import { AnimatePresence } from 'framer-motion' // Importe AnimatePresence
import React from 'react'
import { useLocation, useOutlet } from 'react-router'

function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet() // Obtém o elemento que seria renderizado pelo Outlet

  return (
    <AnimatePresence mode="wait">
      {/* Use a key da localização para que AnimatePresence detecte a mudança de rota */}
      {React.cloneElement(outlet as React.ReactElement, { key: location.pathname })}
      {/*
        O 'outlet' é o componente da rota ativa (e.g., <AnalysisPage />).
        Precisamos cloná-lo para injetar a 'key' correta no momento certo
        para que o AnimatePresence saiba qual componente está mudando.
        'location.pathname' é uma excelente key para rotas.
      */}
    </AnimatePresence>
  )
}

export default AnimatedOutlet
