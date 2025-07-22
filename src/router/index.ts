import { createRouter, createWebHashHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'

import SettingsView from '../views/SettingsView.vue'
import ModelProviderView from '../views/subviews/ModelProviderView.vue'

import KnowledgeView from '../views/KnowledgeView.vue'
import ProgramView from '../views/ProgramView.vue'
import TranslationView from '../views/TranslationView.vue'
import PictureView from '../views/PictureView.vue'
import VideoView from '../views/VideoView.vue'
import AgentView from '../views/AgentView.vue'



const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/chat', name: 'Chat', component: ChatView },

  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/model-provider', name: 'ModelProvider', component: ModelProviderView },

  { path: '/knowledge', component: KnowledgeView },
  { path: '/program', component: ProgramView },
  { path: '/translation', component: TranslationView },
  { path: '/picture', component: PictureView },
  { path: '/video', component: VideoView },
  { path: '/agent', component: AgentView },
  
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
