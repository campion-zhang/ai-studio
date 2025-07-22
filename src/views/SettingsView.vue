<template>
  <div class="header-bar">
    <div class="page-title">系统设置</div>
  </div>

  <div class="settings-container">
    <div class="setting-card">
      <div class="setting-row">
        <div>
          <div class="setting-header">深色模式</div>
          <div class="setting-desc">切换浅色或深色界面风格</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="darkEnabled" @change="applyTheme" />
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <div class="setting-card">
      <div class="setting-row">
        <div>
          <div class="setting-header">语音输入</div>
          <div class="setting-desc">允许通过语音输入指令</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="speechEnabled" />
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <div class="setting-card">
      <div class="setting-row">
        <div>
          <div class="setting-header">隐私模式</div>
          <div class="setting-desc">不保存聊天历史记录</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="privacyEnabled" />
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <div class="setting-card clickable" @click="goToProvider">
      <div class="setting-row">
        <div>
          <div class="setting-header">大模型服务商</div>
          <div class="setting-desc">选择服务商和对应模型</div>
        </div>
        <div class="right-arrow">
          <img src="../assets/footer-actions/chevron-right.png" />
        </div>
      </div>
    </div>

    <div class="setting-card clickable" @click="goToMCP">
      <div class="setting-row">
        <div>
          <div class="setting-header">MCP设置</div>
          <div class="setting-desc">启用或禁用MCP功能和工具</div>
        </div>
        <div class="right-arrow">
          <img src="../assets/footer-actions/chevron-right.png" />
        </div>
      </div>
    </div>

    <div class="setting-card clickable" @click="goToPrompt">
      <div class="setting-row">
        <div>
          <div class="setting-header">Prompt管理</div>
          <div class="setting-desc">系统提示词管理</div>
        </div>
        <div class="right-arrow">
          <img src="../assets/footer-actions/chevron-right.png" />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const darkEnabled = ref(localStorage.getItem('theme') === 'dark')
const speechEnabled = ref(true)
const privacyEnabled = ref(false)
const router = useRouter()

const applyTheme = () => {
  const theme = darkEnabled.value ? 'dark' : 'light'
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
  localStorage.setItem('theme', theme)
}

onMounted(() => {
  applyTheme()
})

// 大模型供应商
const goToProvider = () => {
  router.push({ name: 'ModelProvider' })
}

// MCP设置
const goToMCP = () => {
  //router.push({ name: 'ModelProvider' })
}

// Prompt管理
const goToPrompt = () => {
  //router.push({ name: 'ModelProvider' })
}
</script>


<style scoped>
.settings-container {
  max-width: auto;
  margin: 0 auto;
  padding: 32px;
}

.setting-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.setting-header {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}
.setting-desc {
  font-size: 14px;
  color: #888;
}
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  background-color: #ccc;
  transition: .3s;
  border-radius: 28px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.slider:before {
  content: "";
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #3c98f7;
}
input:checked + .slider:before {
  transform: translateX(24px);
}

.theme-label {
  margin-left: 10px;
  color: #666;
}

.provider-select {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable:hover {
  background-color: #f2f2f2;
}

.right-arrow {
  font-size: 18px;
  color: #888;
  margin-left: 16px;
  flex-shrink: 0; /* 防止挤压变形 */
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0px 0px;
}
</style>