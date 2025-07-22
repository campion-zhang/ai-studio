<template>
  <div class="provider-sidebar">

    <draggable
      v-model="localProviders"
      item-key="id"
      class="provider-list"
      @end="dragEnd"
    >
      <template #item="{ element: provider }">
        <li 
          class="menu-item"
          :key="provider.id"
          :ref="provider.id === selected?.id ? 'activeItem' : undefined"
          :class="{ active: provider.id === selected?.id }"
        >
          <div class="left-actions">
            <span class="drag-handle" title="拖动排序" >
              <img class="icon drag-handle" src="../../assets/footer-actions/icon-move.png" />
            </span>
            <button class="btn-delete" @click.stop="confirmRemove(provider)" title="删除">
              <img class="icon btn-delete" src="../../assets/footer-actions/icon-delete.png" />
            </button>
          </div>

          <div class="label" @click="$emit('select', provider)" >
            <img 
              v-if="provider.icon" 
              :src="getIconPath(provider.icon)"
              class="icon provider-icon"
              :alt="provider.name"
            />
            {{ provider.name }}
          </div>

          <label class="switch">
            <input
              type="checkbox"
              v-model="provider.enabled"
              @click.stop="$emit('toggle', provider)"
            />
            <span class="slider"></span>
          </label>
        </li>
      </template>
    </draggable>

    <!-- 底部添加按钮 -->
    <div class="add-provider" @click="$emit('add')">
      <span class="add-icon">
        <img class="icon add-icon" src="../../assets/footer-actions/icon-add.png" />
      </span>
      <span class="add-label">添加服务商</span>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, watch, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { Provider } from '../../types/preload.d'
import { ElMessageBox } from 'element-plus'
import isEqual from 'lodash/isEqual'

const props = defineProps<{
  providers: Provider[]
  selected: Provider | null
}>()

const emit = defineEmits<{
  (e: 'select', provider: Provider): void
  (e: 'add'): void
  (e: 'remove', id: string): void
  (e: 'toggle', provider: Provider): void
  (e: 'update', val: Provider): void
  (e: 'drag-end', val: Provider[]): void
}>()

const localProviders = ref<Provider[]>([])

const activeItem = ref<HTMLElement | null>(null)
const scrollToSelected = () => {
  nextTick(() => {
    if (activeItem.value) {
      activeItem.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

// 当 selected 变化时触发滚动
// 同步 props.providers 到本地
watch(
  () => props.providers,
  (newVal) => {
    const sorted = [...newVal].sort((a, b) => a.order - b.order)
    if (!isEqual(sorted, localProviders.value)) {
      localProviders.value = sorted
      scrollToSelected()
    }
  },
  { immediate: true, deep: true }
)

const getIconPath = (fileName: string): string => {
  try {
    return new URL(`../../assets/provider-icons/${fileName}`, import.meta.url).href
  } catch (e) {
    console.warn('[ProviderSidebar] 图标加载失败:', fileName)
    return new URL(`../../assets/provider-icons/default.png`, import.meta.url).href
  }
}

const dragEnd = async () => {
  localProviders.value.forEach((p, i) => {
    p.order = i
  })
  emit('drag-end', localProviders.value)
}

const confirmRemove = (provider: Provider) => {
  ElMessageBox.confirm(
    `确定要删除供应商「${provider.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      emit('remove', provider.id)
    })
    .catch(() => {
    })
}

</script>

<style scoped>
.provider-sidebar {
  width: clamp(160px, 30vw, 320px);
  height: 100%;
  min-height: 100%;
  border-right: 1px solid #e0e0e0;
  overflow-y: overlay;
  position: relative;
  padding: 0;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
/* 悬停时显示滚动条 */
.provider-sidebar:hover {
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}
.provider-sidebar::-webkit-scrollbar {
  width: 6px;              /* 始终占位 */
  background-color: transparent;
}
.provider-sidebar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}
.provider-sidebar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
}

/* 供应商图标 */
.provider-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 0px;
  padding: 8px 0px;
  vertical-align: middle;
}

.menu-item {
  list-style: none;
  margin-bottom: 0px;
  border-radius: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 8px 2px;
  gap: 0px;
  pointer-events: auto;
  scroll-margin-top: 10px;
}
.menu-item.active {
  background: #E8E8EA;
  font-weight: bold;
  color: black;
}
.menu-item:hover {
  background: #E8E8EA;
}

/* 左侧操作按钮组 */
.left-actions {
  display: flex;
  align-items: center;
  gap: 0px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
/* 只有 hover 显示图标 */
.menu-item:hover .left-actions {
  opacity: 1;
}
/* 图标统一大小与样式 */
.icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;     /* 图标基线对齐（辅助） */
  margin-top: 1px;            /* 微调：根据字体基线微移 */
}

/* 拖拽手柄样式 */
.drag-handle {
  cursor: grab;
  font-size: 16px;
  margin-left: 1px;
  padding: 1px 0px;
}

/* 删除按钮 */
.btn-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #e53e3e;
  font-size: 16px;
  padding: 0;
  user-select: none;
  margin-right: 1px;
}
.btn-delete:hover {
  color: #c53030;
}

/* 供应商名称 */
.label {
  flex: 1;
  text-align: left;
  user-select: none;
}

/* 开关样式，参考 iOS 风格 */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
  align-items: center;
  margin-right: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4caf50;
}
input:checked + .slider:before {
  transform: translateX(16px);
}

.add-provider {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-top: 0px;
  cursor: pointer;
  color: #555;
  font-size: 14px;
  transition: background-color 0.2s, color 0.2s;
}
.add-provider:hover {
  background-color: #e8e8ea;
  color: #000;
  border-radius: 6px;
}
.add-icon {
  font-size: 16px;
}
</style>
