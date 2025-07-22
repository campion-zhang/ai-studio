<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import TitleBar from './components/TitleBar.vue'
</script>

<template>
  <TitleBar />
  <div class="layout">
    <Sidebar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: calc(100vh - 32px);
  margin: 0;
}
.content {
  flex: 1;
  background-color: #f4f4f4;
  overflow: auto; /* 内部内容滚动 */
  height: 100%;
}

</style>
