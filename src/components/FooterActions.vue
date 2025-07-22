<template>
  <div class="footer-actions">
    <el-tooltip content="上传文件" placement="top">
      <button class="footer-btn" @click="handleUpload" >
        <img src="../assets/footer-actions/upload.png" alt="上传" />
      </button>
    </el-tooltip>

    <el-tooltip content="切换主题" placement="top">
      <button class="footer-btn" @click="toggleTheme" >
        <img src="../assets/footer-actions/sun-dim.png" alt="换主题" />
      </button>
    </el-tooltip>

    <el-tooltip content="新建对话" placement="top">
      <button class="footer-btn" @click="newChat">
        <img src="../assets/footer-actions/circle-plus.png" alt="新对话" />
      </button>
    </el-tooltip>

    <el-tooltip content="下载聊天记录" placement="top">
      <button class="footer-btn" @click="handleDownload" >
        <img src="../assets/footer-actions/download.png" alt="下载" />
      </button>
    </el-tooltip>

    <el-tooltip content="选择模型" placement="top">
      <button class="footer-btn" @click="handleSelectModel" >
        <img src="../assets/footer-actions/model.png" alt="下载" />
      </button>
    </el-tooltip>

    <el-tooltip content="搜索聊天" placement="top">
      <button class="footer-btn" @click="handleSearch" >
        <img src="../assets/footer-actions/search.png" alt="折叠" />
      </button>
    </el-tooltip>

    <el-tooltip content="折叠" placement="top">
      <button class="footer-btn" @click="toggleCollapse" >
        <img src="../assets/footer-actions/circle-chevron-left.png" alt="折叠" />
      </button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">

const handleUpload = async () => {}
const toggleTheme = async () => {}
const newChat = async () => {}
const handleDownload = async () => {}
const handleSelectModel = async () => {}
const handleSearch = async () => {}
const toggleCollapse = async () => {}
</script>

<style scoped>
.footer-actions {
  position: fixed;
  bottom: 30px;
  right: 36px;
  display: flex;
  gap: 10px;
  z-index: 100;
  left: 40%; /* 从左侧 40% 开始 */
  align-items: center;
}

.footer-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border: none;
  border-radius: 50%;
  background-color: #f4f4f4;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}
.footer-btn:hover {
  background-color: #e0e0e0;
}
.footer-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
