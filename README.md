# Vue 3 + TypeScript + Vite + Electron

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

注意：
   windows下用 npm.cmd 命令
   Linux下用 npm 命令

Electron + node.js中对splite3兼容性不太好，所以会存在用不了的情况。因此工具中使用lowdb来存储本地数据。
关于lowdb数据库：
    lowdb 是一个非常轻量级的本地 JSON 文件数据库，非常适合 Electron + Vue3 + TypeScript + Vite 项目用作本地配置或数据持久化存储，
    比如：用户设置、历史记录、小量结构化数据等。优点：存储格式是JSON 文件（人类可读）、无需安装数据库服务、支持 Lodash 风格链式查询、适合前端、桌面应用、小型数据存储等。



清理缓存和编译文件：

rm -rf node_modules
rm -rf package-lock.json  # 或 yarn.lock
rm -rf dist dist-electron  # 若你使用 Vite + Electron
npm cache clean --force



2、build
   cd sietium-ai-studio
   npm install --verbose    # 安装依赖
   npm install lowdb @types/lowdb element-plus
   npm run dev              # 启动项目
   npm run build            # 打包发布

3、目录说明
   sietium-ai-studio/
   ├── electron/               # Electron 主进程
   │   ├── electron-env.d.ts
   │   ├── main.ts             # 主进程
   │   └── preload.ts
   ├── public/                 # 存放公共资源文件
   │   └── sietium-logo.png
   ├── release/                # 编译输出目录
   │   ├── win-unpacked/       # 程序编译输出文件包
   │   └── Sietium-AI-Studio Setup 0.0.1.exe # 安装包程序
   ├── src/
   │   ├── assets/
   │   │   └── icons/          # 侧边栏组件图标
   │   ├── components/
   │   │   ├── TitleBar.vue    # 标题栏组件
   │   │   └── Sidebar.vue     # 侧边导航栏组件
   │   ├── router/
   │   │   └── index.ts
   │   ├── types/               # 全局类型声明文件
   │   │   └── preload.d.ts
   │   ├── views/
   │   │   ├── AgentView.vue        # Agent
   │   │   ├── ChatView.vue         # 聊天对话
   │   │   ├── KnowledgeView.vue    # 知识库
   │   │   ├── PictureView.vue      # 文生图
   │   │   ├── ProgramView.vue      # 小程序
   │   │   ├── SettingsView.vue     # 系统设置
   │   │   ├── TranslationView.vue  # 翻译
   │   │   └── VideoView.vue        # 文生视频
   │   ├── App.vue                  # 根组件
   │   ├── main.ts                  # VUE 应用入口
   │   ├── style.css                # 全局样式
   │   └── vite-env.d.ts
   ├── index.html
   ├── .env                         # 存放 key
   ├── package-lock.json
   ├── package.json
   ├── README.md
   ├── tsconfig.json
   ├── tsconfig.node.json
   └── vite.config.ts
