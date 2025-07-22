
declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
      
      getEnabledProvider: () => Promise<Provider[] | undefined>
      listModels: (providerId: string) => Promise<{ id: string; name: string }[]>
      chatToModel: (payload: {
          providerId: string
          model: string
          messages: { role: string; content: string }[]
      }) => Promise<string>

      getProviders: () => Promise<Provider[]>
      addProvider: (provider: Provider) => Promise<void>
      updateProvider: (provider: Provider) => Promise<void>
      removeProvider: (id: string) => Promise<void>
      updateAllProvider: (providers: Provider[]) => Promise<void>
    }
  }
}

export interface Provider {
  id: string
  name: string
  URL: string
  model: string
  apiKey: string
  enabled: boolean
  order: number
  type: string
  icon?: string
}

export {}