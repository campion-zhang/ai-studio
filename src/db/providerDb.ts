import { existsSync, mkdirSync } from 'fs'
import  path  from 'path'
import { fileURLToPath } from 'url';
import { Provider } from '../types/preload.d'
import { JSONFilePreset } from 'lowdb/node'
import type { Low } from 'lowdb'

// 定义数据库模型
type Data = { providers: Provider[] }

function dbLog(...args: any[]) {
    console.log('[providerDb]', ...args)
}

// 数据库存放路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath  = path.join(__dirname, '../data', 'dataDB.json')
dbLog('Database path:', dbPath)

// 检查文件是否存在
const dbDir = path.dirname(dbPath)
console.log("dbDir:", dbDir);
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
    dbLog('Created database directory:', dbDir)
}

let db: Low<Data> | null = null
let dbReady: Promise<void> | null = null

// 初始化数据库
function ensureDBReady(): Promise<void> {
    if (dbReady) return dbReady
    dbReady = (async () => {
        db = await JSONFilePreset<Data>(dbPath, { providers: [] })
        await db.read()
        if (!db.data.providers) {
            db.data.providers = []
            await db.write()
            dbLog('Initialized empty providers array')
        } else {
            dbLog('Loaded providers:', db.data.providers)
        }
    })()
    return dbReady
}

// 读取数据
async function readDB() {
    await ensureDBReady()
    await db!.read()
    if (!db!.data.providers) {
        dbLog('No providers field found, initializing...')
        db!.data.providers = []
    }
}

export async function getProviders(): Promise<Provider[]> {
    dbLog('getProviders called')
    await readDB()
    return db!.data.providers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function addProvider(provider: Provider) {
    dbLog('addProvider called with:', provider)
    await readDB()

    // ID 唯一性校验
    const exists = db!.data.providers.some(p => p.id === provider.id)
    if (exists) {
        dbLog('Provider with same ID already exists:', provider.id)
        throw new Error(`Provider with id ${provider.id} already exists.`)
    }

    const currentMaxOrder = Math.max(0, ...db!.data.providers.map(p => p.order ?? 0))
    provider.order = currentMaxOrder + 1
    db!.data.providers.push(provider)
    await db!.write()
}

export async function updateProvider(updated: Provider) {
    dbLog('updateProvider called with:', updated)
    await readDB()
    const idx = db!.data.providers.findIndex(p => p.id === updated.id)
    if (idx !== -1) {
        db!.data.providers[idx] = updated
        await db!.write()
    }
}

export async function removeProvider(id: string) {
    dbLog('removeProvider called with id:', id)
    await readDB()
    db!.data.providers = db!.data.providers.filter(p => p.id !== id)
    // 重新排序 order 顺序
    db!.data.providers.forEach((p, i) => {
        p.order = i
    })
    await db!.write()
}

export async function updateAllProvider(providers: Provider[]) {
    dbLog('updateAllProvider called')
    await readDB()

    db!.data.providers = providers
    // 重新排序 order 顺序
    db!.data.providers.forEach((p, i) => {
        p.order = i
    })

    await db!.write()
}