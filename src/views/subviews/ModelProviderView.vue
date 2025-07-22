<template>
  <div class="model-provider-view">
    <div class="top-nav">
      <button class="back-button" @click="goBack">
        <img src="../../assets/footer-actions/arrow-left.png" class="icon"/>返回
      </button>
      <h2 class="nav-title">选择模型服务商</h2>
    </div>
  </div>

  <div class="model-provider-container">
    <!-- 左侧供应商导航栏 -->
    <ProviderSidebar 
      :providers="providers"
      :selected="selectedProvider"
      @select="selectProvider"
      @remove="removeProvider"
      @toggle="toggleProvider"
      @add="addProvider"
      @update="updateProvider"
      @drag-end="onDragEnd"
    />

    <!-- 右侧显示内容区域 -->
    <div class="provider-detail">
      <ProviderDetail 
        v-if="selectedProvider" 
        :provider="selectedProvider" 
        @update="updateProvider" 
      />
    </div>
  </div>

  <!-- 添加供应商弹窗 -->
  <el-dialog v-model="dialogVisible" title="添加自定义服务商" width="600px">
    <el-form label-width="80px">

      <el-form-item label="名称">
        <el-input v-model="newProvider.name" placeholder="请输入服务商名称" />
      </el-form-item>

      <el-form-item label="API 类型">
        <el-select v-model="newProvider.type" placeholder="请选择类型" @change="onTypeChange">
          <el-option label="OpenAI" value="openai" />
          <el-option label="Claude (Anthropic)" value="claude" />
          <el-option label="DeepSeek" value="deepseek" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="API URL">
        <el-input v-model="newProvider.URL" placeholder="例如 https://api.xxx.com" />
      </el-form-item>

      <el-form-item label="API Key">
        <el-input v-model="newProvider.apiKey" placeholder="请输入 API 秘钥" />
      </el-form-item>

      <el-form-item label="图标">
        <el-input v-model="newProvider.icon" placeholder="如 icon-openai.png" />
      </el-form-item>

      <el-form-item label="启用">
        <el-switch v-model="newProvider.enabled" />
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveNewProvider">确定</el-button>
    </template>

  </el-dialog>
</template>

<script setup lang="ts">
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

import ProviderSidebar from '../../components/model-provider/ProviderSidebar.vue'
import ProviderDetail from '../../components/model-provider/ProviderDetail.vue'

import type { Provider } from '../../types/preload.d'
import { ElMessage } from 'element-plus'

const providers = ref<Provider[]>([])
const selectedProvider = ref<Provider | null>(null)

// 添加弹窗控制
const dialogVisible = ref(false)
const newProvider = ref<Partial<Provider>>({
  id: '',
  name: '',
  URL: '',
  model: '',
  apiKey: '',
  enabled: false,
  order: providers.value.length,
  type: 'custom',
  icon: 'custom-color.svg'
})

const loadProviders = async () => {
  try {
    providers.value = await window.electronAPI.getProviders()
    console.log("providers.value: ", providers.value);

    const lastId = localStorage.getItem('lastSelectedProviderId')
    const found = providers.value.find(p => p.id === lastId)

    // 优先用上次选中的，其次用第一个启用的，最后选第一个
    selectedProvider.value = found || providers.value.find(p => p.enabled) || providers.value[0] || null
  } catch (error) {
    console.error('加载供应商失败:', error)
    providers.value = []
    selectedProvider.value = null
  }
}

const selectProvider = (provider: Provider) => {
  console.log('[ModelProviderView.vue] select:')
  selectedProvider.value = { ...provider }
  localStorage.setItem('lastSelectedProviderId', provider.id) // 保存到 localStorage
}

// 保存新供应商
const saveNewProvider = async () => {
  if (!newProvider.value.name?.trim()) {
    ElMessage.warning('请输入供应商名称')
    return
  }
  if (!newProvider.value.URL?.trim()) {
    ElMessage.warning('请输入API URL')
    return
  }

  const full: Provider = {
    id: newProvider.value.id!,
    name: newProvider.value.name,
    URL: newProvider.value.URL,
    model: '',
    apiKey: '',
    enabled: !!newProvider.value.enabled,
    order: newProvider.value.order!,
    type: '',
    icon: newProvider.value.icon || '',
  }

  await window.electronAPI.addProvider(full)
  dialogVisible.value = false
  await loadProviders()
  selectedProvider.value = full
}

const addProvider = async () => {
  console.log('[ModelProviderView.vue] add:')
  newProvider.value = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: '',
    URL: '',
    model: '',
    apiKey: '',
    enabled: false,
    order: 0,
    type: '',
    icon: 'custom-color.svg'
  }
  dialogVisible.value = true
}

const updateProvider = async (p: Provider) => {
  console.log('[ModelProviderView.vue] update:')
  await window.electronAPI.updateProvider(p)
  await loadProviders()
}

const removeProvider = async (id: string) => {
  console.log('[ModelProviderView.vue] remove:')
  await window.electronAPI.removeProvider(id)
  await loadProviders()
}

const toggleProvider = async (p: Provider) => {
  console.log('[ModelProviderView.vue] toggle:')
  await updateProvider({ ...p, enabled: !p.enabled })
}

const onDragEnd = async (pds: Provider[]) => {
  console.log('[ModelProviderView.vue] onDragEnd:')
  for (const [index, p] of pds.entries()) {
    await updateProvider({ ...p, order: index })
  }
}

const onTypeChange = (type: string) => {
  switch (type) {
    case 'openai':
      newProvider.value.name = 'OpenAI'
      newProvider.value.URL = 'https://api.openai.com/v1'
      newProvider.value.icon = 'openai.svg'
      break
    case 'claude':
      newProvider.value.name = 'Claude'
      newProvider.value.URL = 'https://api.anthropic.com'
      newProvider.value.icon = 'claude-color.svg'
      break
    case 'deepseek':
      newProvider.value.name = 'DeepSeek'
      newProvider.value.URL = 'https://api.deepseek.com/v1'
      newProvider.value.icon = 'deepseek-color.svg'
      break
    case 'custom':
    default:
      newProvider.value.name = ''
      newProvider.value.URL = ''
      newProvider.value.icon = 'custom-color.svg'
      break
  }
}

const router = useRouter()
// 是否允许离开当前页面
const allowLeave = ref(false)

const goBack = () => {
  allowLeave.value = true
  //router.back() // 返回上一页
  router.push('/settings')
}

// 拦截页面跳转（阻止跳出页面）
onBeforeRouteLeave((_to, _from, next) => {
  if (allowLeave.value) {
    next() // 放行
  } else {
    next(false) // 阻止跳转
  }
})

// 防止刷新离开
const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
  if (!allowLeave.value) {
    //e.preventDefault() // 会阻止关闭按钮生效
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnloadHandler)
  loadProviders()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

</script>

<style scoped>
.model-provider-view {
  padding: 0px 16px;
  margin: 0;
  font-family: system-ui, sans-serif;
}

/* 顶部导航栏样式 */
.top-nav {
  display: flex;
  align-items: center;
  padding: 33px 0px;
  border-bottom: 0px solid #ddd;
}

.back-button {
  background: none;
  border: none;
  font-size: 18px;
  color: #3c98f7;
  cursor: pointer;
  gap: 6px;
  margin-right: 16px;
  display: flex;
  align-items: center;
}
.back-button .icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.nav-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.model-provider-container {
  display: flex;
  height: calc(100vh - 125px);
  background-color: white;
  overflow: hidden; /* 防止多余滚动条 */
  border-right: 1px solid #e0e0e0;
  padding: 0px 0px;
}

.provider-detail {
  flex: 1;
  padding: 12px 20px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: white;
}

</style>
