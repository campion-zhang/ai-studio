import type { Provider } from '../types/preload.d'
import { getProviders } from '../db/providerDb'

// 模型结构
export interface ModelInfo {
  id: string
  name: string
  providerId: string
}

// 调试日志
function debugLog(name: string, ...args: any[]) {
  console.log(`%c[${name}]`, 'color: #3c98f7; font-weight: bold;', ...args)
}

// 主入口：验证 API Key + 获取模型列表
export async function fetchModels(provider: Provider): Promise<ModelInfo[]> {
  debugLog('fetchModels', `Fetching models for provider: ${provider.id}`, provider)
  switch (provider.id) {
    case 'openai':
    case 'openrouter':
    case 'deepseek':
    case 'siliconflow':
    case 'qnaigc':
    case 'grok':
    case 'minimax':
    case 'moonshot':
    case 'aliyunbailian':
    case 'lmstudio':
    case 'aihubmix':
    case 'together':
    case '302.ai':
    case 'hunyuan':
    case 'ppinfra':
    case 'fireworks':
    case 'zhipu':
      return fetchProviderModels(provider)
    case 'githubmodels':
      return fetchAzureModels(provider)
    case 'ollama':
        return fetchOllamaModels(provider)
    case 'anthropic':
        return fetchAnthropicModels(provider)
    case 'generativelanguage':
        return fetchGeminiModels(provider)
    case 'doubao':
        return fetchDoubaoModels(provider)
    default:
      throw new Error(`不支持的供应商类型: ${provider.id}`)
  }
}

async function fetchProviderModels(provider: Provider): Promise<ModelInfo[]> {
    let res: Response
    res = await fetch(`${provider.URL}/models`, {
        headers: {
            Authorization: `Bearer ${provider.apiKey}`,
        }
    })
  
  if (!res.ok) throw new Error('API Key 验证失败')

  const json = await res.json()
  return (json.data || []).map((item: any) => ({
    id: item.id,
    name: item.id,
    providerId: provider.id,
  }))
}

async function fetchAzureModels(provider: Provider): Promise<ModelInfo[]> {
  const res = await fetch(`${provider.URL}/openai/deployments?api-version=2024-10-21`, {
    headers: { 'api-key': provider.apiKey || '' }
  })
  if (!res.ok) throw new Error('API Key 验证失败')
  const json = await res.json()
  return (json.value || []).map((item: any) => ({
    id: item.id,
    name: item.id,
    providerId: provider.id,
  }))
}

async function fetchOllamaModels(provider: Provider): Promise<ModelInfo[]> {
  const res = await fetch(`${provider.URL}/api/tags`)
  if (!res.ok) throw new Error('获取 Ollama 模型失败')
  const data = await res.json()
  return data.models.map((m: any) => ({
    id: m.name,
    name: m.id,
    providerId: provider.id,
  }))
}

// Anthropic 模型（手动列出）
async function fetchAnthropicModels(provider: Provider): Promise<ModelInfo[]> {
  return [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', providerId: provider.id },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', providerId: provider.id },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', providerId: provider.id },
    { id: 'claude-instant-1.2', name: 'Claude Instant (旧版)', providerId: provider.id },
  ]
}

async function fetchGeminiModels(provider: Provider): Promise<ModelInfo[]> {
  const res = await fetch(`${provider.URL}/v1beta2/models`, {
    headers: {
      Authorization: `Bearer ${provider.apiKey}`, // 这里 apiKey 实际是 OAuth Access Token
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`获取 Gemini 模型失败: ${res.status} ${text}`)
  }

  const data = await res.json()

  if (!Array.isArray(data.models)) return []

  return data.models.map((item: any) => ({
    id: item.id,
    name: item.id,
    providerId: provider.id,
  }))
}

async function fetchDoubaoModels(provider: Provider): Promise<ModelInfo[]> {
  const res = await fetch(provider.URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      Action: 'ListFoundationModels',
      Version: '2024-01-01',
      PageNumber: 1,
      PageSize: 100,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`获取豆包模型失败: ${res.status} ${text}`)
  }

  const json = await res.json()

  if (!Array.isArray(json.Models)) {
    return []
  }

  return json.Models.map((item: any) => ({
    id: item.id,
    name: item.id,
    providerId: provider.id,
  }))
}

export async function listModelsForProvider(providerId: string) {
  console.log(`Listing models for provider: ${providerId}`)
  const allProviders = await getProviders()
  const provider = allProviders.find(p => p.id === providerId)
  if (!provider) throw new Error('找不到对应供应商')

  return await fetchModels(provider)
}

export async function chatToModel(providerId: string, modelId: string, messages: any[]) {
  const allProviders = await getProviders()
  const provider = allProviders.find(p => p.id === providerId)
  if (!provider) throw new Error(`未找到供应商配置：${providerId}`)

  debugLog('chatToModel', `Provider: ${providerId}, Model: ${modelId}`, messages)
  switch (providerId) {
    case 'siliconflow':
    case 'openai':
    case 'openrouter':
    case 'deepseek':
    case 'qnaigc':
    case 'grok':
    case 'minimax':
    case 'moonshot':
    case 'aliyunbailian':
    case 'lmstudio':
    case 'aihubmix':
    case 'together':
    case '302.ai':
    case 'hunyuan':
    case 'ppinfra':
    case 'fireworks':
    case 'zhipu':
      return await callProviderChat(provider, modelId, messages)
    case 'azure':
      return await callAzure(provider, modelId, messages)
    case 'local':
      return await callLocalModel(provider, modelId, messages)
    case 'githubmodels':
    case 'ollama':
    case 'generativelanguage':
    case 'anthropic':
    case 'doubao':
    default:
      throw new Error(`未知供应商：${providerId}`)
  }
}

export async function callProviderChat(provider: Provider, model: string, messages: any[]) {
  const { apiKey, URL } = provider
  const url = `${URL}/chat/completions`

  debugLog('callProviderChat', `Calling ${provider.id} with model ${model}`, messages)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices?.[0]?.message?.content || '[空响应]'
}

export async function callAzure(provider: Provider, deployment: string, messages: any[]) {
  const { apiKey, URL } = provider
  const url = `${URL}/openai/deployments/${deployment}/chat/completions?api-version=2023-05-15`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      temperature: 0.7
    })
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices?.[0]?.message?.content || '[空响应]'
}

export async function callLocalModel(provider: Provider, model: string, messages: any[]) {
  const { URL } = provider
  const res = await fetch(`${URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages
    })
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.choices?.[0]?.message?.content || '[空响应]'
}