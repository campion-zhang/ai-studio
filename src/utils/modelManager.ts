import { fetchModels } from './providerApi'
import { getProviders } from '../db/providerDb'
//import { Provider } from '../types/provider.d'

export async function listModelsForProvider(providerId: string) {
  const allProviders = await getProviders()
  const provider = allProviders.find(p => p.id === providerId)
  if (!provider) throw new Error('找不到对应供应商')

  return await fetchModels(provider)
}