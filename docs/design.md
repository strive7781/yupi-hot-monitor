# 鱼皮热点监控 - 技术设计文档

> 版本：v1.0  
> 日期：2026-05-26  
> 状态：已实现并上线运行

## 1. 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ 关键词管理 │ │ 热点列表  │ │ 通知中心  │ │ 设置面板   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
└───────┼────────────┼────────────┼─────────────┼──────────┘
        │            │            │             │
        └────────────┴────────────┴─────────────┘
                          │ REST API + SSE
┌─────────────────────────┴───────────────────────────────┐
│                  Backend (Express + Node.js)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ 路由层    │ │ 调度器    │ │ AI 服务   │ │ 通知服务   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       │            │            │             │         │
│  ┌────┴────────────┴────────────┴─────────────┴─────┐  │
│  │              数据采集层 (Collectors)               │  │
│  │  Twitter │ WebSearch │ HackerNews │ GoogleNews   │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │ SQLite DB   │                       │
│                   └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
         │                    │                │
    twitterapi.io      DuckDuckGo         OpenRouter
                       HN Algolia API
                       Google News RSS
```

## 2. 目录结构

```
yupi-hot-monitor/
├── docs/
│   ├── requirements.md
│   └── design.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js              # 入口 + Express 启动
│       ├── db/
│       │   ├── index.js          # better-sqlite3 连接
│       │   └── schema.sql        # 建表语句
│       ├── routes/
│       │   ├── keywords.js
│       │   ├── hotspots.js
│       │   ├── notifications.js
│       │   ├── settings.js
│       │   └── scan.js           # 手动触发扫描
│       ├── services/
│       │   ├── ai.js             # OpenRouter AI 分析
│       │   ├── twitter.js        # twitterapi.io
│       │   ├── webSearch.js      # DuckDuckGo 爬虫
│       │   ├── hackerNews.js     # HN Algolia
│       │   ├── googleNews.js     # RSS 解析
│       │   ├── collector.js      # 多源聚合
│       │   ├── scheduler.js      # node-cron 定时任务
│       │   └── notification.js   # 浏览器 SSE + 邮件
│       └── utils/
│           └── rateLimit.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/client.js
│       └── components/
│           ├── Header.jsx
│           ├── KeywordPanel.jsx
│           ├── HotspotFeed.jsx
│           ├── NotificationBell.jsx
│           └── SettingsPanel.jsx
└── .cursor/skills/               # Phase 3
    └── hot-monitor/
        └── SKILL.md
```

## 3. 数据库设计

### 3.1 keywords — 监控关键词

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| keyword | TEXT UNIQUE | 关键词 |
| scope | TEXT | 所属范围，如「AI 编程」 |
| enabled | INTEGER | 1=启用 0=禁用 |
| created_at | TEXT | ISO 时间 |

### 3.2 hotspots — 发现的热点

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| title | TEXT | 标题 |
| summary | TEXT | AI 生成摘要 |
| url | TEXT UNIQUE | 原文链接（去重键） |
| source | TEXT | twitter / web / hackernews / googlenews |
| keyword | TEXT | 关联关键词 |
| score | REAL | AI 热度评分 0-100 |
| is_genuine | INTEGER | AI 判定是否真实热点 |
| raw_content | TEXT | 原始内容 |
| created_at | TEXT | 发现时间 |

### 3.3 notifications — 通知记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| hotspot_id | INTEGER FK | 关联热点 |
| type | TEXT | browser / email |
| message | TEXT | 通知内容 |
| read | INTEGER | 0=未读 1=已读 |
| created_at | TEXT | 发送时间 |

### 3.4 settings — 全局配置

| 字段 | 类型 | 说明 |
|------|------|------|
| key | TEXT PK | 配置键 |
| value | TEXT | 配置值 |

## 4. API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/keywords | 获取关键词列表 |
| POST | /api/keywords | 添加关键词 `{ keyword, scope }` |
| DELETE | /api/keywords/:id | 删除关键词 |
| GET | /api/hotspots | 获取热点列表 `?scope=&limit=` |
| GET | /api/notifications | 获取通知列表 |
| PATCH | /api/notifications/:id/read | 标记已读 |
| GET | /api/notifications/stream | SSE 实时推送 |
| POST | /api/scan | 手动触发一次全量扫描 |
| GET | /api/settings | 获取设置 |
| PUT | /api/settings | 更新设置（监控范围、采集间隔等） |
| GET | /api/health | 健康检查 |

## 5. 外部 API 对接（MCP 最新文档）

### 5.1 OpenRouter — AI 分析

**端点**：`POST https://openrouter.ai/api/v1/chat/completions`

**认证**：
```
Authorization: Bearer <OPENROUTER_API_KEY>
Content-Type: application/json
HTTP-Referer: https://yupi-hot-monitor.local  (可选)
X-OpenRouter-Title: Yupi Hot Monitor           (可选)
```

**结构化输出**（用于 AI 判定热点真伪）：
```json
{
  "model": "deepseek/deepseek-v4-flash",
  "messages": [
    {
      "role": "system",
      "content": "你是热点分析专家，判断内容是否为真实热点..."
    },
    {
      "role": "user",
      "content": "待分析内容..."
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "hotspot_analysis",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "is_genuine": { "type": "boolean", "description": "是否为真实热点" },
          "score": { "type": "number", "description": "热度评分 0-100" },
          "summary": { "type": "string", "description": "50字以内摘要" },
          "reason": { "type": "string", "description": "判定理由" }
        },
        "required": ["is_genuine", "score", "summary", "reason"],
        "additionalProperties": false
      }
    }
  }
}
```

**AI 判定规则**：
- 过滤：营销软文、标题党、无实质内容的转载
- 保留：产品发布、技术突破、行业重大事件
- 评分维度：时效性、传播度、影响范围、内容质量

### 5.2 twitterapi.io — Twitter/X 数据

**认证**：请求头 `X-API-Key: <API_KEY>`

**高级搜索**：
```
GET https://api.twitterapi.io/twitter/tweet/advanced_search
  ?query=<关键词>
  &queryType=Latest
  &cursor=
```

**Query 语法示例**：
```
"AI programming" OR "Claude" OR "GPT"
"AI" from:OpenAI since_time:1740000000
```

**响应结构**：
```json
{
  "tweets": [{
    "id": "...",
    "url": "...",
    "text": "...",
    "likeCount": 123,
    "retweetCount": 45,
    "createdAt": "...",
    "author": { "userName": "...", "name": "..." }
  }],
  "has_next_page": true,
  "next_cursor": "..."
}
```

**频率控制**：每次扫描每个关键词最多取 1 页（20 条），避免超额计费。

### 5.3 网页搜索 — DuckDuckGo Lite 爬虫

无需 API Key，直接请求 HTML 并解析：

```
GET https://lite.duckduckgo.com/lite/?q=<encoded_query>
```

- 使用 `cheerio` 解析 HTML 提取标题和链接
- 请求间隔 ≥ 3 秒
- User-Agent 设置为常规浏览器
- 每次最多取前 10 条结果

### 5.4 Hacker News — Algolia API（免费）

```
GET https://hn.algolia.com/api/v1/search?query=<关键词>&tags=story&hitsPerPage=10
```

无需认证，返回 JSON，含 `title`、`url`、`points`、`num_comments`。

### 5.5 Google News RSS（免费）

```
GET https://news.google.com/rss/search?q=<关键词>&hl=zh-CN&gl=CN&ceid=CN:zh-Hans
```

使用 `rss-parser` 解析，提取 `title`、`link`、`pubDate`。

## 6. 核心流程

### 6.1 定时扫描流程

```
Scheduler (每 N 分钟)
  │
  ├─ 读取所有 enabled 关键词
  │
  ├─ 并行采集（带 rate limit）
  │   ├─ Twitter API
  │   ├─ DuckDuckGo 搜索
  │   ├─ Hacker News
  │   └─ Google News RSS
  │
  ├─ URL 去重（对比 hotspots 表）
  │
  ├─ 新内容 → OpenRouter AI 分析
  │   ├─ is_genuine=false → 丢弃
  │   └─ is_genuine=true  → 写入 hotspots
  │
  └─ 触发通知
      ├─ SSE 推送到前端
      └─ 发送邮件（如已配置 SMTP）
```

### 6.2 通知流程

**浏览器 SSE**：
```
GET /api/notifications/stream
Content-Type: text/event-stream

data: {"type":"hotspot","title":"...","summary":"..."}
```

**邮件**（nodemailer）：
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.NOTIFY_EMAIL,
  subject: `[热点] ${title}`,
  html: `<h2>${title}</h2><p>${summary}</p><a href="${url}">查看原文</a>`
});
```

## 7. 前端设计方向

**美学定位**：「吃瓜雷达站」— 复古终端 + 新闻编辑室混合风格

- **色调**：深墨绿底 (#0a1f1a) + 荧光橙强调 (#ff6b2b) + 米白文字
- **字体**：Display 用 "Playfair Display"，正文用 "IBM Plex Sans"（Google Fonts）
- **布局**：左侧关键词控制面板 + 右侧热点信息流 + 顶部通知铃铛
- **动效**：新热点卡片从右侧滑入 + 脉冲雷达动画
- **响应式**：移动端面板折叠为底部 Tab

## 8. Agent Skills 设计（Phase 3）

路径：`.cursor/skills/hot-monitor/SKILL.md`

Skill 将教 AI Agent 如何：
1. 调用 `POST /api/keywords` 添加监控词
2. 调用 `POST /api/scan` 触发扫描
3. 调用 `GET /api/hotspots` 查询最新热点
4. 调用 `GET /api/notifications` 查看通知

## 9. 风险与应对

| 风险 | 应对 |
|------|------|
| DuckDuckGo 反爬 | 频率限制 + 失败降级（跳过该源） |
| Twitter API 费用 | 每关键词限 1 页 + 可配置开关 |
| OpenRouter 超时 | 30s timeout + 降级为关键词匹配 |
| 邮件发送失败 | 记录日志，不影响浏览器通知 |

## 10. 开发里程碑

| 阶段 | 内容 | 预计 |
|------|------|------|
| M1 | 后端骨架 + DB + 采集器 | 当前 |
| M2 | AI 分析 + 调度 + 通知 | 当前 |
| M3 | 前端 UI + 联调 | 当前 |
| M4 | 测试 + 验收 | 下一步 |
| M5 | Agent Skills | Web 验收后 |
