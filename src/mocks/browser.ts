// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handler'

// Este objeto Worker será usado para iniciar a interceptação no browser.
export const worker = setupWorker(...handlers)
