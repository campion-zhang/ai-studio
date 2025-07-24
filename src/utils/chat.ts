import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface ChatMessage {
    role: 'user' | 'ai'
    content: string
    time: string
}

export const useChatStore = defineStore('chat', () => {
    const messages = ref<ChatMessage[]>([])

    const providerId = ref<string | null>(null)
    const selectedModel = ref<string | null>(null)

    // 自动保存 messages
    watch(messages, (newMessages) => {
        try {
            console.log('[watch]Saving messages:', newMessages)
            window.electronAPI.saveMessages(newMessages)
        } catch (e) {
            console.error('[watch]Saving messages failed.', e)
        }
    }, { deep: true })

    const addMessage = async (msg: ChatMessage) => {
        messages.value.push(msg)
        await saveMessages()
    }

    const updateMessage = async (index: number, msg: ChatMessage) => {
        messages.value.splice(index, 1, msg)
        await saveMessages()
    }
        
    const loadMessages = async () => {
        try {
            const raw = await window.electronAPI.loadMessages()
            messages.value = JSON.parse(raw)
        } catch (e) {
            console.error('loadding messages failed.', e)
        }
    }

    const saveMessages = async () => {
        try {
            console.log('Saving messages:', messages.value)
            await window.electronAPI.saveMessages(messages.value)
        } catch (e) {
            console.error('Saving messages failed', e)
        }
    }

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
        loadMessages,
        updateMessage,
    }
})
