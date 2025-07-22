<template>
  <div class="title-bar">
    <div class="title">Sietium AI Studio</div>
    <div class="window-controls" style="-webkit-app-region: no-drag">
      <button @click="minimize" class="btn">
        <svg width="12" height="12" viewBox="0 0 10 10"><rect y="4" width="10" height="1" fill="#666B75"/></svg>
      </button>
      <button @click="maximize" class="btn">
        <svg width="12" height="12" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="#666B75" stroke-width="1"/></svg>
      </button>
      <button @click="close" class="btn close">
        <svg width="12" height="12" viewBox="0 0 10 10">
          <line x1="1" y1="1" x2="9" y2="9" stroke="#666B75" stroke-width="1"/>
          <line x1="1" y1="9" x2="9" y2="1" stroke="#666B75" stroke-width="1"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const minimize = () => window.electronAPI?.minimize()
const maximize = () => window.electronAPI?.maximize()
const close = () => window.electronAPI?.close()
</script>

<style scoped>
.title-bar {
  height: 32px;
  background: #E4E4E7;
  color: #666B75;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  -webkit-app-region: drag;
}
.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}
button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
}
button:hover {
  background: rgba(255, 255, 255, 0.8);
}
</style>
