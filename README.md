# 数学之美 · MathViz

交互式数学可视化实验平台：把抽象的数学概念变成可以动手玩的实验 —— 拖动滑块，实时看到傅里叶变换、混沌、概率、分形等上百个数学主题的动态演绎，并配有中文语音讲解。

## 功能特性

- **上百个交互式数学实验**：傅里叶变换、微积分、线性代数、概率论、混沌与分形、数论、图论……每个实验都可交互探索
- **中文语音讲解**：每个实验配有分段讲解音频与同步动画（讲解模式）
- **参数实时调节**：滑块拖动即时重绘，直观感受参数变化的影响
- **实验记录**：保存自己的实验参数组合，支持导出与回顾
- **Bug 反馈**：内置 bug 上报与管理后台
- **移动端适配**：响应式布局 + PWA，可在手机浏览器"添加到桌面"像原生应用一样使用

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 前端 | React 19 + TypeScript + Vite 7 + Tailwind CSS 4 |
| 图表 | Plotly.js（精简定制版）、KaTeX、Math.js |
| 后端 | Node.js + Express + lowdb（JSON 文件数据库）|
| 移动端 | PWA（vite-plugin-pwa，应用外壳预缓存 + 音频按需缓存）|
| 部署 | Docker Compose（nginx 静态托管 + Node API），支持一键启动 |

## 快速开始

```bash
# 安装全部依赖（根目录 / client / server）
npm run install:all

# 本地开发（前端 :5173 + 后端 :3001 并发启动）
npm run dev
```

## 构建

```bash
cd client && npm run build   # 产物输出到 client/dist
cd ../server && npm run build # 产物输出到 server/dist
```

> 构建前会自动做课程完整性检查（`npm run check-courses`）与空音频体检，
> 逻辑见根目录 `deploy.sh`（原生产部署脚本，供参考）。

## Docker 部署

仓库附带 `docker-compose.yml`，包含两个服务：

- **mathviz-web**：nginx:alpine 托管 `client/dist`，`/` 走 SPA 回退，`/api/*` 反代到后端
- **mathviz-api**：Node 22 运行 `server/dist`，数据持久化在 `./data/data.json` 与 `./data/bugs.json`

```bash
# 首次部署：构建前端 -> 同步 dist -> 启动
cd client && npm run build && cd ..
docker compose up -d --build

# 仅更新前端
docker compose up -d --build mathviz-web

# 仅更新后端
docker compose up -d --build mathviz-api

# 查看状态 / 日志
docker compose ps
docker compose logs -f mathviz-web
```

默认前端映射到宿主机 `18080` 端口，访问 `http://<服务器IP>:18080`。
生产环境建议在前面加一层反向代理 / CDN 做 HTTPS（PWA 的 Service Worker 需要 HTTPS 才能激活）。

> 注意：前端构建内存占用较大（约 3GB），小内存机器请在本地构建好 `dist` 后再同步到服务器，不要直接在服务器上 `npm run build`。

## PWA 与移动端

- `public/manifest.json` + `public/icons/`：应用名称、图标（192/512/maskable）、主题色
- `vite-plugin-pwa` 自动生成 Service Worker：**只预缓存应用外壳**（约 10MB），
  讲解音频（700MB+）走运行时按需缓存，听过的下次离线可播
- 已做刘海屏安全区适配（`viewport-fit=cover` + `env(safe-area-inset-*)`）
- 参数面板在移动端可折叠，首屏优先展示图表

手机使用：在浏览器打开站点 → 菜单 → **添加到桌面**，即可获得类原生应用体验。
（Android APK 打包可选用 Capacitor，见分支 `mobile-pwa` 的提交记录。）

## 项目结构

```
├── client/                 # 前端（Vite + React）
│   ├── src/
│   │   ├── experiments/    # 各数学实验模块
│   │   ├── components/     # 通用组件（Layout、ParameterPanel、NarrationPresenter…）
│   │   └── narrations/     # 讲解稿与音频脚本
│   ├── public/
│   │   ├── audio/narrations/  # 讲解音频（体积大，不进 PWA 预缓存）
│   │   ├── icons/          # PWA 图标
│   │   └── manifest.json   # PWA 清单
│   ├── Dockerfile          # nginx 托管镜像
│   └── nginx.conf
├── server/                 # 后端（Express + lowdb）
│   ├── src/
│   │   ├── routes/         # /api/experiments、/api/bugs、/api/admin
│   │   └── db/             # JSON 数据库访问层
│   └── Dockerfile
├── data/                   # 运行时数据（Docker volume 挂载，不进版本库）
├── docker-compose.yml
└── deploy.sh               # 历史生产部署脚本（rsync + nginx，供参考）
```

## 后端 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET/POST | `/api/experiments` | 实验记录 |
| GET/POST | `/api/bugs` | Bug 反馈 |
| POST | `/api/admin/login` | 管理员登录 |

> ⚠️ `server/src/index.ts` 中的管理员密码为示例弱口令，生产环境请务必更换
> （建议改为环境变量读取）。

## License

本项目采用 LICENSE 文件中的开源协议；`COMMERCIAL-LICENSE.md` 与
《数学之美_软件授权报价单.pdf》为商业授权相关文件。
