# MyRadio - 音乐歌单应用架构计划

## 背景

用户有 293 首 MP3 文件存放在 `/run/media/aoralsfout/文件/学长音乐精选/`，需要开发一个可在互联网上访问的音乐歌单应用。技术栈：Vue 3 + TypeScript + Node.js，要求模块化、可扩展、读取 ID3 标签。

## 项目结构 (Monorepo)

```
MyRadio/
├── package.json              # npm workspaces 根配置
├── tsconfig.base.json        # 共享 TS 配置
├── .gitignore
├── .env.example
├── server/                   # Node.js + Express 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── data/                 # 运行时缓存目录
│   └── src/
│       ├── index.ts          # 入口
│       ├── app.ts            # Express 应用工厂
│       ├── config.ts         # 环境配置
│       ├── types/            # song.ts, cache.ts, api.ts
│       ├── services/         # scanner.service.ts, cache.service.ts, stream.service.ts
│       ├── routes/           # songs.routes.ts, stream.routes.ts
│       └── middleware/       # error-handler.ts, cors.ts
└── client/                   # Vue 3 + Vite 前端
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.ts / App.vue
        ├── router/
        ├── stores/           # player.store.ts, library.store.ts, ui.store.ts
        ├── api/              # client.ts (axios)
        ├── composables/      # useAudioPlayer.ts, useMediaSession.ts
        ├── components/       # layout/, player/, library/, common/
        ├── views/            # HomeView.vue
        ├── styles/
        └── types/
```

## 后端架构

### 核心依赖
- `express` + `cors` + `morgan`
- `music-metadata` — 读取 ID3 标签
- `uuid` — 为歌曲生成稳定 ID
- `tsx` — 开发时直接运行 TypeScript

### API 设计
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/songs?search=&sort=&order=` | 歌曲列表，支持搜索/排序 |
| GET | `/api/songs/:id` | 单曲详情 |
| GET | `/api/stream/:id` | 音频流（支持 Range 请求） |
| GET | `/api/cover/:id` | 封面图片 |
| POST | `/api/rescan` | 强制重新扫描 |
| GET | `/api/status` | 健康检查 |

### 关键服务
- **scanner.service.ts**: 遍历目录 → `music-metadata.parseFile()` 批量解析 ID3 → 生成 `SongMetadata[]`。批量并发 10 个，损坏文件跳过不中断。
- **cache.service.ts**: JSON 文件缓存 (`server/data/cache.json`)，原子写入。启动时检查缓存新鲜度（目录路径 + 文件数量 + 随机抽样 mtime），新鲜则直接加载，过期则重新扫描。
- **stream.service.ts**: 解析 HTTP Range 头 → `fs.createReadStream` + pipe → 支持 200/206/416 状态码，浏览器原生 seek。

### CJK 处理
- Linux 的 `fs.readdir` 返回 UTF-8 字符串，文件名无需特殊处理
- `music-metadata` 内部处理 ID3v2 的各种编码 (ISO-8859-1/UTF-16/UTF-8)
- 文件名中的 `#suffix` 模式（如 `唱-Ado#cdjajbeadd.mp3`）在回退标题时用正则去除

## 前端架构

### 核心依赖
- `vue` 3.5 + `vue-router` 4 + `pinia` 2
- `axios`
- `vite` 6 + `@vitejs/plugin-vue`

### 组件树
```
App.vue
├── AppHeader.vue → SearchBar.vue
├── AppSidebar.vue → SongList.vue
├── HomeView.vue → SongGrid.vue → SongCard.vue
└── PlayerBar.vue (固定底部)
    ├── NowPlaying.vue
    ├── PlayerControls.vue
    ├── ProgressBar.vue
    └── VolumeControl.vue
```

### CSS Grid 布局
```
┌──────────────────────────────────────┐
│  AppHeader (60px)                    │
├──────────┬───────────────────────────┤
│ Sidebar  │   Main Content            │
│ (280px)  │   SongGrid (scroll)       │
├──────────┴───────────────────────────┤
│  PlayerBar (80px, fixed bottom)      │
└──────────────────────────────────────┘
```
响应式断点: Desktop >1024px / Tablet 768-1024px / Mobile <768px

### Pinia 状态管理
- **player.store.ts**: 播放队列、当前索引、播放状态、音量、随机/循环模式。`AudioElement` 用 `markRaw` 包装避免 Vue 响应式代理。
- **library.store.ts**: 全量歌曲数据、搜索查询、加载/错误状态。搜索是客户端过滤（已获取全量数据）。
- **ui.store.ts**: 侧边栏开关、视图模式、主题。

### 音频播放
- `useAudioPlayer.ts` 封装 HTML5 `<audio>` 元素，事件 (timeupdate/ended/play/pause/error) 同步到 Pinia store
- `useMediaSession.ts` 集成 Media Session API（锁屏/通知中心控件）
- Vite dev server 代理 `/api` → `localhost:3000`，无跨域问题

### 生产部署
- `NODE_ENV=production` 时 Express 托管 `client/dist/` 静态文件 + SPA fallback
- 单个 Node 进程同时服务 API 和前端

## 实施顺序

1. **基础骨架**: monorepo 配置 → server 入口 + 类型定义 + 配置
2. **核心扫描**: scanner.service.ts (ID3 读取) → cache.service.ts (JSON 缓存)
3. **API 路由**: songs 路由 → stream 路由 (Range 支持) → cover 路由
4. **前端骨架**: Vite + Vue 搭建 → 布局组件 → API 客户端 → library store
5. **播放器**: player store → useAudioPlayer → PlayerBar 全套控件
6. **打磨**: 搜索/排序 → 响应式 → 暗色主题 → 键盘快捷键 → 加载/空状态

## 验证方式

1. 启动后访问 `http://localhost:5173`，确认 293 首歌曲正确显示
2. 点击歌曲播放，确认进度条可拖动 seek
3. 搜索框输入中文/日文关键词，确认过滤正确
4. `curl -H "Range: bytes=0-1024" http://localhost:3000/api/stream/:id` 验证 206 响应
5. 移动端浏览器访问，确认响应式布局正常
