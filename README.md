# 🍉 Yupi Hot Monitor（吃瓜雷达）

AI 编程热点监控系统 —— 多源采集、AI 过滤、实时通知，让你走在吃瓜第一线。

## 功能特性

- **关键词监控**：添加关键词，自动从 Twitter、网页搜索、Hacker News、Google News 多源采集
- **AI 智能过滤**：通过 OpenRouter 调用 DeepSeek，识别真实热点、过滤营销/标题党，生成摘要与热度评分
- **定时扫描**：默认每 30 分钟自动扫描，也支持手动触发
- **通知中心**：浏览器内 SSE 实时推送 + 可选邮件通知
- **Agent Skill**：内置 Cursor Agent Skill，供 AI 直接操作监控 API

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + TailwindCSS |
| 后端 | Node.js + Express |
| 数据库 | SQLite（better-sqlite3） |
| AI | OpenRouter（默认 `deepseek/deepseek-v4-flash`） |
| Twitter | [twitterapi.io](https://twitterapi.io/) |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/<your-username>/yupi-hot-monitor.git
cd yupi-hot-monitor
```

### 2. 配置环境变量

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`，至少配置以下项：

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
TWITTER_API_KEY=your_twitterapi_io_key
```

### 3. 安装依赖

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. 启动服务

```bash
# 终端 1 — 后端（http://localhost:3001）
cd backend
npm run dev

# 终端 2 — 前端（http://localhost:5173）
cd frontend
npm run dev
```

> **Windows PowerShell 提示**：不支持 `cd xxx && npm run dev`，请分步执行或使用 `working_directory` 分别启动。

### 5. 验证

浏览器访问 http://localhost:5173 ，或检查后端健康状态：

```bash
curl http://localhost:3001/api/health
# 返回 ai: true, twitter: true 表示配置正常
```

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET/POST/DELETE | `/api/keywords` | 关键词管理 |
| GET | `/api/hotspots` | 热点列表 |
| POST | `/api/scan` | 手动触发扫描 |
| GET | `/api/notifications` | 通知列表 |
| GET/PUT | `/api/settings` | 全局设置 |

完整 API 设计见 [docs/design.md](docs/design.md)。

## 项目结构

```
yupi-hot-monitor/
├── backend/          # Express 后端 + SQLite
├── frontend/         # React 前端
├── docs/             # 需求 & 设计文档
└── .cursor/skills/   # Cursor Agent Skill
```

## 文档

- [需求文档](docs/requirements.md)
- [技术设计](docs/design.md)
- [Agent Skill 使用说明](.cursor/skills/hot-monitor/SKILL.md)

## License

MIT
