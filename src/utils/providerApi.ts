import type { Provider } from '../types/preload.d'

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
