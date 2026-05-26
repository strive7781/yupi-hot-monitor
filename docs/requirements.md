# 鱼皮热点监控 - 需求文档

> 版本：v1.0  
> 日期：2026-05-26  
> 状态：Phase 1 & 2 已完成，功能已验收

## 1. 项目背景

鱼皮作为 AI 编程博主，需要**第一时间**获取指定领域的热点变化（如 AI 大模型更新），不能依赖人工手动搜索。系统应利用工具自动发现热点、识别真假内容，并及时发送通知，让用户走在「吃瓜第一线」。

## 2. 项目定位

- **类型**：轻量工具类项目
- **开发方式**：敏捷开发，不过度工程化
- **交付形态**：
  1. 响应式 Web 页面（优先完成并验证）
  2. Agent Skills 技能包（Web 版稳定后再做）

## 3. 功能需求

### 3.1 关键词监控（P0）

| 编号 | 需求 | 说明 |
|------|------|------|
| F-01 | 添加监控关键词 | 用户手动输入要监控的关键词 |
| F-02 | 多源信息采集 | 从多个信息源获取内容，避免单一来源 |
| F-03 | AI 内容识别 | 利用 OpenRouter 对接 AI，识别是否为真实热点、过滤假冒/营销/低质内容 |
| F-04 | 实时通知 | 关键词相关内容**首次出现**时，第一时间发送通知 |
| F-05 | 去重 | 同一内容不重复通知 |

### 3.2 热点自动发现（P0）

| 编号 | 需求 | 说明 |
|------|------|------|
| F-06 | 设置监控范围 | 用户输入领域范围，如「AI 编程」 |
| F-07 | 定时采集 | 每隔一段时间自动搜集该范围内的热点 |
| F-08 | 热点展示 | 在 Web 页面展示发现的热点列表，含标题、摘要、来源、热度、时间 |
| F-09 | AI 热点排序/摘要 | AI 对采集内容进行聚合、打分、生成摘要 |

### 3.3 通知（P0）

| 编号 | 需求 | 说明 |
|------|------|------|
| F-10 | 浏览器内通知 | 页面内通知中心 + 浏览器 Push（需用户授权） |
| F-11 | 邮件通知 | 支持 SMTP 配置，热点触发时发送邮件 |

### 3.4 Agent Skills（P1，Web 版完成后）

| 编号 | 需求 | 说明 |
|------|------|------|
| F-12 | 技能封装 | 封装为 Cursor Agent Skills，供其他 AI 调用监控能力 |
| F-13 | API 暴露 | 提供 REST API 供 Skill 脚本调用 |

## 4. 非功能需求

| 编号 | 需求 | 说明 |
|------|------|------|
| NF-01 | 响应式 | Web 页面兼容桌面与移动端 |
| NF-02 | 独特 UI | 前端设计有辨识度，避免千篇一律的 AI 风格 |
| NF-03 | 采集频率控制 | 网页搜索爬虫注意频率限制，避免被封 |
| NF-04 | 配置外置 | API Key、SMTP 等敏感信息通过环境变量配置 |
| NF-05 | 本地可运行 | 单机 SQLite 存储，零外部数据库依赖 |

## 5. 技术栈（已确认）

| 层级 | 技术 |
|------|------|
| 前端 | React + Vite + TailwindCSS |
| 后端 | Node.js + Express |
| 数据库 | SQLite（better-sqlite3） |
| AI 服务 | OpenRouter |
| Twitter/X | twitterapi.io |
| 网页搜索 | 后端直接爬取搜索引擎结果页（无需 API Key） |

## 6. 信息源（已确认）

1. **Twitter/X** — 通过 [twitterapi.io](https://twitterapi.io/) 高级搜索 API 获取最新推文
2. **网页搜索** — 后端爬取 DuckDuckGo Lite 搜索结果（无需 API Key，带频率限制）
3. **Hacker News** — 免费 Algolia API，补充科技热点
4. **Google News RSS** — 免费 RSS 源，补充新闻热点

> 多源聚合，避免单一信息源偏差。

## 7. 环境变量

```env
# OpenRouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=deepseek/deepseek-v4-flash

# Twitter
TWITTER_API_KEY=your_twitterapi_io_key

# 邮件（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=password
NOTIFY_EMAIL=recipient@email.com

# 服务
PORT=3001
CRON_INTERVAL_MINUTES=30
```

## 8. 验收标准

- [x] 可添加/删除监控关键词，定时轮询多源数据
- [x] AI 能过滤低质/假冒内容，仅推送真实热点
- [x] 页面可查看热点列表、通知历史
- [x] 浏览器内通知可用；邮件通知需配置 SMTP
- [x] 页面在移动端正常显示
- [x] Agent Skills 可通过 API 触发监控与查询

## 9. 开发顺序

```
Phase 1: 文档 → 后端骨架 → 数据源 + AI → 前端 UI
Phase 2: 联调测试 → 用户验收
Phase 3: Agent Skills 封装
```
