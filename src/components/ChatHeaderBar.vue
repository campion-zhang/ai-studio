<template>
  <div class="header-bar">
    <div class="page-title">聊天对话</div>

    <el-select
      v-model="selectedValue"
      placeholder="选择模型"
      class="model-select"
      :teleported="false"
      @visible-change="onDropdownVisibleChange"
      :value-key="null"
      :label="selectedLabel"
      :title="selectedProviderName"
      popper-class="model-select-dropdown"
    >
      <template #prefix>
        <div class="option-content">
          <img v-if="selectedIcon" :src="selectedIcon" class="icon-left" />
        </div>
      </template>

      <el-option-group
        v-for="provider in providers"
        :key="provider.id"
        :label="provider.name"
      >
        <el-option
          v-for="model in props.modelsMap[provider.id] || []"
          :key="`${provider.id}::${model}`"
          :label="model"
          :value="`${provider.id}::${model}`"
        >
          <template #default>
            <div class="option-content">
              <img v-if="provider.icon" class="icon-left" :src="getProviderIcon(provider.icon)" />
              <span>{{ model }}</span>
            </div>
          </template>
        </el-option>

        <el-option
          v-if="(modelsMap[provider.id]?.length ?? 0) === 0"
          :key="`${provider.id}::(empty)`"
          :label="'(无模型)'"
          :value="`${provider.id}::`"
          disabled
        />

      </el-option-group>
    </el-select>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import type { Provider } from '../types/preload.d'

const props = defineProps<{
  modelValue: string
  providers: Provider[]
  modelsMap: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'change', val: string): void
  (e: 'load-models', providerId: string): void
}>()

const selectedProviderId = ref('')
const selectedModelId = ref('')

watch(() => props.modelValue, (val) => {
  console.log('Model selection changed:', val)
  if (!val.includes('::')) return
  const [provider, model] = val.split('::')
  selectedProviderId.value = provider
  selectedModelId.value = model
})

// 等待 modelsMap 加载后自动同步
watchEffect(() => {
  console.log('Watching modelsMap for changes...')
  const val = props.modelValue
  if (!val || !val.includes('::')) return

  const [providerId, modelId] = val.split('::')
  const models = props.modelsMap[providerId]

  // 等模型数据加载后再赋值，避免提前赋值导致未匹配
  if (models && models.includes(modelId)) {
    selectedProviderId.value = providerId
    selectedModelId.value = modelId
  }
})

const selectedValue = computed({
  get() {
    if (!selectedProviderId.value || !selectedModelId.value) return ''
    return `${selectedProviderId.value}::${selectedModelId.value}`
  },
  set(val: string) {
    const [provider, model] = val.split('::')
    selectedProviderId.value = provider
    selectedModelId.value = model
    emit('update:modelValue', val)
    emit('change', val)
  },
})

function getProviderIcon(icon: string) {
  return new URL(`../assets/provider-icons/${icon}`, import.meta.url).href
}

const selectedLabel = computed(() => selectedModelId.value)

const selectedProviderName = computed(() =>
  props.providers.find(p => p.id === selectedProviderId.value)?.name || ''
)

const selectedIcon = computed(() => {
  const provider = props.providers.find(p => p.id === selectedProviderId.value)
  return provider?.icon ? getProviderIcon(provider.icon) : ''
})

// 在展开模型选择下拉时触发模型加载
const loadedProviders = ref<Set<string>>(new Set())

function onDropdownVisibleChange(visible: boolean) {
  if (!visible) return
  props.providers.forEach(p => {
    if (!loadedProviders.value.has(p.id)) {
      emit('load-models', p.id)
      loadedProviders.value.add(p.id)
    }
  })
}

</script>

<style scoped>
.header-bar {
  position: fixed;
  height: 60px;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 16px 34px;
  gap: 20px;
}

.page-title {
  font-weight: bold;
  flex-shrink: 0;
  white-space: nowrap;
}

.model-select {
  min-width: 380px;
  border-radius: 20px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  left: 10%;
}

::v-deep(.model-select-dropdown .el-select-dropdown__item) {
  font-weight: 500;
}
/* 输入框字体颜色 */
::v-deep(.model-select .el-input__inner) {
  color: #333;
}

.model-select-dropdown {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 可选美化阴影 */
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-left {
  width: 18px;
  height: 18px;
}

</style>
