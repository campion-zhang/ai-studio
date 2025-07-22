import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatMessage {
    role: 'user' | 'ai'
    content: string
    time: string
}

export const useChatStore = defineStore('chat', () => {
    const messages = ref<ChatMessage[]>([])

    const addMessage = (msg: ChatMessage) => {
        messages.value.push(msg)
    }

    const selectedModel = ref<string | null>(null)
    const providerId = ref<string | null>(null)

    const setModel = (model: string) => {
        selectedModel.value = model
    }

    const setProvider = (id: string) => {
        providerId.value = id
    }

    return {
        messages,
        addMessage,
        selectedModel,
        setModel,
        providerId,
        setProvider,
    }
})
