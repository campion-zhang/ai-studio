import type { Provider } from '../types/preload.d'
import { getProviders } from '../db/providerDb'

function debugLog(name: string, ...args: any[]) {
  console.log(`%c[${name}]`, 'color: #3c98f7; font-weight: bold;', ...args)
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

async function callProviderChat(provider: Provider, model: string, messages: any[]) {
  const { apiKey, URL } = provider
  const url = `${URL}/chat/completions`

  debugLog('callProviderChat', `URL: ${url}, apiKey: ${apiKey}, providerId: ${provider.id} model: ${model}`, messages)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7
    })
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices?.[0]?.message?.content
}

async function callAzure(provider: Provider, deployment: string, messages: any[]) {
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

async function callLocalModel(provider: Provider, model: string, messages: any[]) {
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