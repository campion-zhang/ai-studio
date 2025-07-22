<template>
  <div class="provider-detail">
    <div class="provider-detail-form" v-if="editableProvider">
      <el-form :model="editableProvider" label-width="80px" ref="formRef">

        <el-form-item label="名称">
          <el-input v-model="editableProvider.name" />
        </el-form-item>

        <el-form-item label="API URL">
          <el-input v-model="editableProvider.URL" placeholder='例如 https://api.xxx.com' />
        </el-form-item>

        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model="editableProvider.apiKey" type="password" show-password placeholder='请输入 API Key' />
        </el-form-item>

        <el-form-item label="图标">
          <el-input v-model="editableProvider.icon" placeholder='自定义图标, 放在 assets/provider-icons/ 目录下' />
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="editableProvider.enabled" />
        </el-form-item>

        <el-form-item>
          <el-space wrap>
            <el-button 
              type="primary" 
              style="width: 120px" 
              :loading="verifyLoading"
              :disabled="verifyLoading"
              @click="verifyApiKey" 
              :icon="Check"
              >验证秘钥
            </el-button>

            <el-button 
              type="primary" 
              style="width: 120px" 
              :loading="saveLoading"
              :disabled="saveLoading"
              @click="saveProvider" 
              :icon="DocumentChecked"
              >保存
            </el-button>

          </el-space>
        </el-form-item>
      </el-form>

      <!-- 模型列表 -->
      <el-card
        v-if="modelList.length"
        class="model-list-card"
        shadow="never"
        body-style="padding: 12px 16px;"
      >
        <template #header>
          <div class="card-header">
            <span class="title">模型列表</span>
            <el-tag type="info" effect="light" round>{{ modelList.length }} 个</el-tag>
          </div>
        </template>

        <el-table
          :data="modelList"
          :loading="modelLoading"
          border
          stripe
          highlight-current-row
          empty-text="暂无模型"
          size="small"
          style="width: 100%;"
          height="550"
          max-height="460"
        >
          <el-table-column type="index" label="序号" width="80" align="center" >
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>

          <el-table-column prop="id" label="模型 ID" min-width="120" show-overflow-tooltip />
          <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
        </el-table>
      </el-card>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Provider } from '../../types/preload.d' // 导入类型
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Check, DocumentChecked } from '@element-plus/icons-vue'
import { fetchModels } from '../../utils/providerApi'

const props = defineProps<{
  provider: Provider
}>()

const emit = defineEmits<{
  (e: 'update', val: Provider): void
}>()

const editableProvider = ref<Provider>({ ...props.provider })
const modelList = ref<{ id: string; name: string }[]>([])
const formRef = ref<FormInstance>()

const verifyLoading = ref(false)
const saveLoading = ref(false)
const modelLoading = ref(false)

// 加载模型列表
const loadModelList = async () => {
  modelLoading.value = true
  try {
    const models = await fetchModels(editableProvider.value)
    modelList.value = models
  } catch (e) {
    console.error('[loadModelList] 加载模型失败', e)
    ElMessage.warning('加载模型失败，请确认 API Key 和 URL 是否正确')
  } finally {
    modelLoading.value = false
  }
}

// 监听每次 props.provider 变化时同步
watch(
  () => props.provider,
  async (newVal, oldVal) => {
    if (newVal.id !== oldVal?.id) {
      editableProvider.value = { ...newVal }
      modelList.value = [] // 清空旧数据

      // 自动重新加载模型列表
      if (editableProvider.value.enabled && editableProvider.value.URL) {
        await loadModelList()
      }
    } else {
      // 拖动时避免重设
      editableProvider.value = { ...newVal }
    }
  },
  { immediate: true, deep: true }
)

// 保存
const saveProvider = () => {
  if (!editableProvider.value.name?.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  if (!editableProvider.value.URL?.trim()) {
    ElMessage.warning('请输入 API URL')
    return
  }

  if (saveLoading.value) return
  saveLoading.value = true

  try {
    emit('update', { ...editableProvider.value })
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 验证秘钥
const verifyApiKey = async () => {
  if (!editableProvider.value.URL?.trim()) {
    ElMessage.warning('请输入 API URL')
    return
  }

  if (!editableProvider.value.apiKey?.trim()) {
    ElMessage.warning('请输入 API Key')
    return
  }

  if (verifyLoading.value) return
  verifyLoading.value = true

  try {
    const models = await fetchModels(editableProvider.value)
    modelList.value = models
    ElMessage.success(`获取模型成功，共 ${models.length} 个`)
  } catch (e: any) {
    console.error('[verifyApiKey] 获取模型失败', e)
    ElMessage.error('验证失败，无法获取模型')
  } finally {
    verifyLoading.value = false
  }
}

</script>

<style scoped>
.provider-detail {
  flex: 1;
  padding: 24px;
  overflow: auto; /* 当内容超出时显示垂直滚动条 */
  height: 100%;
}

.model-list-card {
  max-height: 550px; /* 或根据实际需求设定高度 */
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #fafafa;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}
.title {
  font-weight: bold;
  font-size: 16px;
}
.model-list-card ::v-deep(.el-table__body-wrapper) {
  overflow-y: auto !important;
  scroll-behavior: smooth;
}
</style>
