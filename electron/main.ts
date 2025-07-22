import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'

import { 
  getProviders, 
  addProvider, 
  updateProvider, 
  removeProvider,
  updateAllProvider,
} from '../src/db/providerDb'
import { Provider } from '../src/types/preload.d'
import { listModelsForProvider, chatToModel } from '../src/utils/providerApi'

dotenv.config()

const require = createRequire(import.meta.url)
require('module-alias/register') // Register module aliases
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    show: false,  // 先不立即显示，避免闪烁
    frame: false, // 是否显示窗口边框
    //titleBarStyle: 'hidden', // 隐藏标题栏
    autoHideMenuBar: true, // 自动隐藏菜单栏
    icon: path.join(process.env.VITE_PUBLIC, 'sietium-logo.png'), // 窗口图标
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'), // 用于暴露 API
      nodeIntegration: false,
    },
  })

  //设置最大化显示
  win.maximize()
  win.show()

  // 监听渲染进程的窗口操作指令
  ipcMain.on('window-minimize', () => win?.minimize())
  ipcMain.on('window-maximize', () => win?.isMaximized() ? win.unmaximize() : win?.maximize())
  ipcMain.on('window-close', () => win?.close())

  // 供应商 IPC Handlers
  ipcMain.handle('provider:getAll', () => getProviders())
  ipcMain.handle('provider:add', (_event, provider: Provider) => addProvider(provider))
  ipcMain.handle('provider:update', (_event, provider: Provider) => updateProvider(provider))
  ipcMain.handle('provider:remove', (_event, id: string) => removeProvider(id))
  ipcMain.handle('provider:updateAll', (_event, providers: Provider[]) => updateAllProvider(providers))

  ipcMain.handle('get-enabled-provider', async () => {
    const providers = await getProviders()
    return providers.filter(p => p.enabled)
  })

  // 返回模型列表
  ipcMain.handle('list-models', async (_event, providerId: string) => {
    return await listModelsForProvider(providerId)
  })

  // 模型对话接口
  ipcMain.handle('chat-to-model', async (_event, { providerId, model, messages }) => {
    console.log(`Chatting with model: ${model} on provider: ${providerId}`, messages)
    return await chatToModel(providerId, model, messages)
  })


  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  try {
    createWindow()
  } catch (err) {
    console.error('[createWindow error]', err)
  }
})
