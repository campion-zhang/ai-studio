<template>
  <div class="chat-area">
    <div class="chat-content" ref="chatBoxRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="chat-message"
        :class="msg.role"
      >
        <!-- 左右布局（头像 + 内容） -->
        <img :src="msg.role === 'user' ? userIcon : aiIcon" class="avatar" />

        <div class="content-group">
          <div class="meta-info">
            <span class="role-name">{{ msg.role === 'user' ? '我' : 'AI' }}</span>
            <span class="timestamp">{{ formatTime(msg.time) }}</span>
          </div>

          <div v-if="msg.content === '__PENDING__'" class="bubble loading-indicator">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            <span class="loading-text">AI 正在回复...</span>
          </div>

          <div v-else class="bubble" v-html="renderMarkdown(msg.content)" />
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
import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '../utils/chat'
import { marked } from 'marked'
import userIcon from '../assets/avatar/user.png'
import aiIcon from '../assets/avatar/ai.png'

const chatStore = useChatStore()
const inputValue = ref('')
// 用于引用聊天窗口 DOM 元素 
const chatBoxRef = ref<HTMLElement | null>(null)
const messages = computed(() => chatStore.messages)

const renderMarkdown = (text: string) => marked.parse(text)

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

    const providerId = chatStore.providerId
    const model = chatStore.selectedModel
    if (!providerId || !model) {
      alert('请选择模型')
      return
    }

    const time = new Date().toISOString()
    chatStore.addMessage({ role: 'user', content, time })

    inputValue.value = ''
    scrollToBottom()

    const pendingIndex = chatStore.messages.length
    const all = await window.electronAPI.getProviders()
    const provider = all.find(p => p.id === providerId)
    if (!provider) {
      chatStore.messages[pendingIndex] = {
        role: 'ai',
        content: `请求失败：找不到提供商 ${providerId}`,
        time: new Date().toISOString(),
      }
      scrollToBottom()
      return
    }

    if (!provider.apiKey) {
      chatStore.messages[pendingIndex] = {
        role: 'ai',
        content: `请求失败：提供商 ${providerId} 未配置 API Key`,
        time: new Date().toISOString(),
      }
      scrollToBottom()
      return
    }

    // 插入等待消息
    chatStore.addMessage({ 
      role: 'ai', 
      content: '__PENDING__', 
      time: new Date().toISOString() 
    })
    scrollToBottom()

    try {
        const reply = await window.electronAPI.chatToModel({
            providerId,
            model,
            messages: [{ role: 'user', content }],
            //messages: chatStore.messages
            //  .slice(-10) // 最多取最近10条
            //  .map(({ role, content }) => ({ role, content })),
        })

        chatStore.messages[pendingIndex] = {
          role: 'ai',
          content: reply,
          time: new Date().toISOString()
        }
        scrollToBottom()
        inputValue.value = ''
    } catch (e) {
        chatStore.messages[pendingIndex] = {
          role: 'ai',
          content: '出错了：' + String(e),
          time: new Date().toISOString()
        }
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
  gap: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  margin-right: 0;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  gap: 8px;
  max-width: 100%;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.content-group {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  word-break: break-word;
}

.meta-info {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.chat-message.user .meta-info {
  justify-content: flex-end;
}

.chat-message.ai .meta-info {
  justify-content: flex-start;
}

.role-name {
  font-weight: bold;
}

.timestamp {
  font-size: 12px;
  color: #aaa;
}

.bubble {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
}

.chat-message.user .bubble {
  background-color: #ffffff;
  align-self: flex-end;
}

.chat-message.ai .bubble {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  align-self: flex-start;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
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
  color: #999;
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
  border-right: none; /* 去掉右边框，和按钮无缝连接 */
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
  border-top-right-radius: 20px; /* 右上圆角 */
  border-bottom-right-radius: 20px; /* 右下圆角 */
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}
.send-button:hover {
  background-color: #327fce;
  border-color: #327fce;
}

</style>
