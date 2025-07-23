<template>

  <div class="chat-header" >
    <ChatHeaderBar
      v-if="ready"
      v-model="selectedModelId"
      :providers="providers"
      :models-map="modelsMap"
      @update:modelValue="updateModel"
      @change="updateModel"
      @load-models="handleLoadModels"
    />
  </div>

  <div class="chat-area" >
    <ChatArea
    />
  </div>

  <div class="footer-actions-center" >
    <FooterActions
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChatStore } from '../utils/chat'
import type { Provider } from '../types/preload.d'

import ChatHeaderBar from '../components/ChatHeaderBar.vue'
import ChatArea from '../components/ChatArea.vue'
import FooterActions from '../components/FooterActions.vue'

const chatStore = useChatStore()
const providers = ref<Provider[]>([])
const modelsMap = ref<Record<string, string[]>>({})
const selectedModelId = ref('')
const ready = ref(false)

watch(selectedModelId, (val) => {
  const [providerId, model] = val.split('::')
  chatStore.providerId = providerId
  chatStore.selectedModel = model
})

// 监听选中变化并保存
function updateModel(val: string) {
  localStorage.setItem('lastSelectedModelId', val)
  const [providerId, model] = val.split('::')
  selectedModelId.value = val
  chatStore.setProvider(providerId)
  chatStore.setModel(model)
}

async function handleLoadModels(providerId: string) {
  if (modelsMap.value[providerId]) return // 已加载过

  try {
    const models = await window.electronAPI.listModels(providerId)
    modelsMap.value[providerId] = models.map((m: any) => typeof m === 'string' ? m : m.name)
  } catch (err) {
    console.warn(`无法加载 ${providerId} 的模型`, err)
    modelsMap.value[providerId] = []
  }
}

onMounted(async () => {
  console.log('ChatView mounted, loading providers...')
  try {
    const result = await window.electronAPI.getEnabledProvider()
    const enabledProviders: Provider[] = Array.isArray(result) ? result : []
    providers.value = enabledProviders

    // 使用上次的模型（不判断模型是否存在，用户点击再加载）
    const storedModelId = localStorage.getItem('lastSelectedModelId')
    if (storedModelId && storedModelId.includes('::')) {
      const [providerId, model] = storedModelId.split('::')
      await handleLoadModels(providerId)

      selectedModelId.value = storedModelId
      chatStore.setProvider(providerId)
      chatStore.setModel(model)
    }
  } catch (error) {
    console.error('获取可用模型失败', error)
  } finally {
    ready.value = true
  }
  console.log('ChatView mounted, providers loaded:', providers.value)
})

</script>

<style scoped>
.chat-header {
  padding-top: 0px;   /* 顶部工具栏高度 + margin */
  width: 100%;
  box-sizing: border-box;
}

.chat-area {
  /*padding-top: 0px;*/   /* 顶部工具栏高度 + margin */
  padding-top: 45px;   /* 顶部工具栏高度 + margin */
  width: 100%;
  box-sizing: border-box;
}

.footer-actions-center {
  position: fixed;       /* 固定在屏幕底部 */
  bottom: 16px;          /* 距离底部16px */
  left: 50%;             /* 水平位置先移动到屏幕中心 */
  transform: translateX(-50%); /* 左移自身宽度一半，实现居中 */
  max-width: 60vw;       /* 最大宽度不超过视口宽度90% */
  width: 100%;           /* 宽度100%，在max-width限制下伸缩 */
  padding: 0 10px;       /* 左右内边距，防止内容贴边 */
  box-sizing: border-box;
  display: flex;         /* 如果FooterActions是内联块，可以用flex保证内部布局 */
  justify-content: center;
  align-items: center;
  z-index: 1000;         /* 保证浮层在上 */
}

</style>