import { ipcRenderer, contextBridge } from 'electron'
import { Provider } from '../src/types/preload.d'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

//专门暴露窗口控制 API 给 UI 组件使用
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  chatToModel: (payload: { messages: any[]; model: string }) => ipcRenderer.invoke('chat-to-model', payload),
  getEnabledProvider: () => ipcRenderer.invoke('get-enabled-provider'),
  listModels: (providerId: string) => ipcRenderer.invoke('list-models', providerId),

  getProviders: () => ipcRenderer.invoke('provider:getAll'),
  addProvider: (provider: Provider) => ipcRenderer.invoke('provider:add', provider),
  updateProvider: (provider: Provider) => ipcRenderer.invoke('provider:update', provider),
  removeProvider: (id: string) => ipcRenderer.invoke('provider:remove', id),
  updateAllProvider: (providers: Provider[]) => ipcRenderer.invoke('provider:updateAll', providers),
})