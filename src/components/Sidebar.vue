<template>
  <aside class="sidebar">
    <div class="logo">
      <img src="../../public/sietium-logo.png" alt="logo" class="logo-img" />
      <span class="logo-text">芯瞳AI</span>
    </div>
    <ul>
      <li :class="{ active: isActive('/chat'), disabled: !isClickable('/chat') }" @click="go('/chat')">
        <img src="../assets/icons/chat.png" class="icon" />
        <span>聊天对话</span>
      </li>
      <li :class="{ active: isActive('/settings'), disabled: !isClickable('/settings') }" @click="go('/settings')">
        <img src="../assets/icons/settings.png" class="icon" />
        <span>系统设置</span>
      </li>
      <li :class="{ active: isActive('/knowledge'), disabled: !isClickable('/knowledge') }" @click="go('/knowledge')">
        <img src="../assets/icons/knowledge.png" class="icon" />
        <span>知识库</span>
      </li>
      <li :class="{ active: isActive('/program'), disabled: !isClickable('/program') }" @click="go('/program')">
        <img src="../assets/icons/program.png" class="icon" />
        <span>小程序</span>
      </li>
      <li :class="{ active: isActive('/translation'), disabled: !isClickable('/translation') }" @click="go('/translation')">
        <img src="../assets/icons/translation.png" class="icon" />
        <span>翻译</span>
      </li>
      <li :class="{ active: isActive('/picture'), disabled: !isClickable('/picture') }" @click="go('/picture')">
        <img src="../assets/icons/picture.png" class="icon" />
        <span>文生图</span>
      </li>
      <li :class="{ active: isActive('/video'), disabled: !isClickable('/video') }" @click="go('/video')">
        <img src="../assets/icons/video.png" class="icon" />
        <span>文生视频</span>
      </li>
      <li :class="{ active: isActive('/agent'), disabled: !isClickable('/agent') }" @click="go('/agent')">
        <img src="../assets/icons/agent.png" class="icon" />
        <span>Agent</span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isInModelProvider = computed(() => route.path === '/model-provider')

// 判断是否为当前页面
const isActive = (path: string) => route.path.startsWith(path)

// 判断是否可点击
const isClickable = (path: string) => {
  return !isInModelProvider.value || path === '/settings'
}

// 点击事件
const go = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}

</script>

<style scoped>
.sidebar {
  width: clamp(160px, 25vw, 320px); /* 等比例缩放 + 限制最大最小 */
  height: 100vh;
  background: #F6F6F7;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  left: 0;
  margin: 0;
  padding: 0;
  border-right: 1px solid #E8E8EA; /* 添加右侧边框 */
  font-weight: bold;
}

.logo {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 25px;
  font-weight: bold;
  padding: 16px;
  border-bottom: 1px solid #E8E8EA;
}
.logo-img {
  width: 60px;
  height: 60px;
}
.logo-text {
  color: #333;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  padding: 12px 30px;
  cursor: pointer;
}
li.active {
  background: #E8E8EA;
  color: #3C98F7;
}
li:hover {
  background: #E8E8EA;
}
.icon {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  vertical-align: middle;
}
.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-text img {
  width: 20px;
  height: 20px;
}

</style>
