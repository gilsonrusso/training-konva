// src/api/abortManager.ts
export class AbortManager {
  private controllers: Map<string, AbortController> = new Map()

  create(key: string): AbortSignal {
    this.abort(key) // se já existe, cancela a anterior
    const controller = new AbortController()
    this.controllers.set(key, controller)
    return controller.signal
  }

  getSignal(key: string): AbortSignal | undefined {
    return this.controllers.get(key)?.signal
  }

  abort(key: string) {
    const controller = this.controllers.get(key)
    if (controller) {
      controller.abort()
      this.controllers.delete(key)
    }
  }

  abortAll() {
    for (const [, controller] of this.controllers) {
      controller.abort()
    }
    this.controllers.clear()
  }
}

// Exporta uma instância singleton
export const abortManager = new AbortManager()
