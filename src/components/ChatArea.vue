<template>
  <div class="chat-area">
    <div class="chat-content" ref="chatBoxRef">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        
        <div class="meta" v-if="msg.role === 'ai' || msg.role === 'user'">
          <img :src="msg.role === 'user' ? userIcon : aiIcon" class="avatar" />
          <span class="username">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
          <span class="timestamp">{{ formatTime(msg.time) }}</span>
        </div>

        <div v-if="msg.role === 'ai'" class="markdown" v-html="renderMarkdown(msg.content)" />
        <div v-else class="plain">{{ msg.content }}</div>

        <div v-if="isLoading" class="loading-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="loading-text">AI 正在回复...</span>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="inputValue"
        type="text"
        class="input-box"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <button class="send-button" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useChatStore } from '../utils/chat'
import { marked } from 'marked'
import userIcon from '../assets/avatar/user.png'
import aiIcon from '../assets/avatar/ai.png'

const chatStore = useChatStore()

onMounted(async () => {
  
})

const inputValue = ref('')
// 用于引用聊天窗口 DOM 元素 
const chatBoxRef = ref<HTMLElement | null>(null)
const renderMarkdown = (text: string) => marked.parse(text)
const isLoading = ref(false) // AI 是否正在回复


const messages = computed(() => chatStore.messages)
const formatTime = (iso: string) => {
    const date = new Date(iso)
    const Y = date.getFullYear()
    const M = String(date.getMonth() + 1).padStart(2, '0')
    const D = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')

    return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

const sendMessage = async () => {
    const content = inputValue.value
    if (!content) return

    const selected = chatStore.selectedModel
    if (!selected) {
      alert('请选择模型')
      return
    }

    const [providerId, model] = selected.split('::')
    const time = new Date().toISOString()
    chatStore.addMessage({ role: 'user', content, time })

    inputValue.value = ''
    isLoading.value = true
    scrollToBottom()

    try {
        const reply = await window.electronAPI.chatToModel({
            providerId,
            model,
            messages: chatStore.messages.map(({ role, content }) => ({ role, content })),
        })

        chatStore.addMessage({
            role: 'ai',
            content: reply,
            time: new Date().toISOString()
        })
        isLoading.value = false
        inputValue.value = ''
    } catch (e) {
        chatStore.addMessage({
            role: 'ai',
            content: '出错了：' + String(e),
            time: new Date().toISOString()
        })
    } finally {
        isLoading.value = false
        scrollToBottom()
    }
}

// 滚动到底部函数
const scrollToBottom = async () => {
    await nextTick() // 等 DOM 渲染完毕
    if (chatBoxRef.value) {
        chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
    }
}

</script>

<style scoped>
.chat-area {
  max-width: auto;
  margin: 0 auto;
  padding: 0px 10px;
}
.chat-content {
  line-height: 1.6;
  word-break: break-word;
  height: calc(100vh - 280px); /* 可按需调整 */
  overflow-y: auto;
  padding: 0px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #ddd; /* 灰色细边框 */
  border-radius: 12px;
  margin-right: 0;
}

.timestamp {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
.username {
  margin-left: 2px;
}

.plain {
  background: #fff;
  padding: 10px;
  border-radius: 6px;
}
.markdown {
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  text-indent: 2em; /* 首行缩进2个字符 */
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  font-size: 15px;
  color: var(--markdown-text);
}
.markdown p {
  margin: 12px 0;
  text-indent: 2em;
}
.markdown ul,
.markdown ol {
  margin: 12px 0 12px 2em;
  padding-left: 1em;
}
.markdown blockquote {
  margin: 12px 0;
  padding: 10px 16px;
  background-color: #f0f2f5;
  border-left: 4px solid #91caff;
  color: #555;
  border-radius: 4px;
  font-style: italic;
}
.markdown pre {
  background: #1e1e1e;
  color: #f8f8f2;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  font-size: 13px;
}
.markdown code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  color: #c7254e;
}
.markdown pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: 14px;
}
.markdown h1,
.markdown h2,
.markdown h3,
.markdown h4 {
  font-weight: bold;
  margin: 16px 0 8px;
  color: #333;
}
.markdown h1 { font-size: 24px; }
.markdown h2 { font-size: 20px; }
.markdown h3 { font-size: 18px; }
.markdown h4 { font-size: 16px; }
.markdown a {
  color: #3c98f7;
  text-decoration: underline;
}
.markdown table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}
.markdown table th,
.markdown table td {
  border: 1px solid #ccc;
  padding: 8px 12px;
  text-align: left;
}
.markdown img {
  max-width: 100%;
  border-radius: 6px;
  margin: 8px 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-left: 4px;
  color: var(--markdown-text, #333);
}
.dot {
  width: 6px;
  height: 6px;
  background-color: #3c98f7;
  border-radius: 50%;
  animation: dotFlash 1.2s infinite ease-in-out;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes dotFlash {
  0% {
      opacity: 0.3;
      transform: scale(1);
  }
  100% {
      opacity: 1;
      transform: scale(1.4);
  }
}
.loading-text {
  font-size: 13px;
  margin-left: 8px;
  color: #999;
}

.meta {
  font-size: 12px;
  margin-bottom: 4px;
  color: #999;
  font-weight: bold;
}

/* 底部输入栏 */
.chat-input {
  display: flex;
  align-items: center;
  padding: 16px 0px;
}
.input-box {
  flex: 1;
  height: 36px;
  border: 1px solid #ccc;
  border-right: none;           /* 去掉右边框，和按钮无缝连接 */
  border-top-left-radius: 20px; /* 左上圆角 */
  border-bottom-left-radius: 20px; /* 左下圆角 */
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}
.input-box:focus {
  border-color: #3C98F7;
  box-shadow: 0 0 0 2px rgba(60, 152, 247, 0.15);
}
.send-button {
  height: 38px;
  padding: 0 20px;
  background-color: #3c98f7;
  color: white;
  border: 1px solid #3c98f7;
  border-top-right-radius: 20px;   /* 右上圆角 */
  border-bottom-right-radius: 20px;/* 右下圆角 */
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}
.send-button:hover {
  background-color: #327fce;
  border-color: #327fce;
}

</style>
