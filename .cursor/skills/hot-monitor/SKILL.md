---
name: hot-monitor
description: Monitor AI programming hot topics for Yupi. Use when the user wants to add monitoring keywords, trigger a hotspot scan, query latest hotspots, or check notifications from the Yupi Hot Monitor project.
---

# 鱼皮热点监控 Agent Skill

教 AI Agent 如何操作「吃瓜雷达」热点监控系统。

## 前置条件

1. 后端服务已启动：`cd backend && npm run dev`（默认 http://localhost:3001）
2. 环境变量已配置：`OPENROUTER_API_KEY`、`TWITTER_API_KEY`（见 backend/.env）

## API 基址

```
http://localhost:3001/api
```

## 常用操作

### 1. 健康检查

```bash
curl http://localhost:3001/api/health
```

返回 `ai: true` 表示 OpenRouter 已配置，`twitter: true` 表示 Twitter API 已配置。

### 2. 添加监控关键词

```bash
curl -X POST http://localhost:3001/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"keyword": "Claude 4", "scope": "AI 编程"}'
```

### 3. 查看关键词列表

```bash
curl http://localhost:3001/api/keywords
```

### 4. 删除关键词

```bash
curl -X DELETE http://localhost:3001/api/keywords/1
```

### 5. 手动触发扫描

```bash
curl -X POST http://localhost:3001/api/scan
```

扫描会并行采集 Twitter、网页搜索、Hacker News、Google News，经 OpenRouter AI 过滤后写入热点库并发送通知。

### 6. 查询最新热点

```bash
# 全部热点（按评分排序）
curl "http://localhost:3001/api/hotspots?limit=20"

# 按关键词过滤
curl "http://localhost:3001/api/hotspots?keyword=Claude%204&limit=10"
```

### 7. 查看通知

```bash
curl http://localhost:3001/api/notifications
curl http://localhost:3001/api/notifications/unread-count
```

### 8. 更新设置

```bash
curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{"scope": "AI 编程", "cron_interval": "30", "email_enabled": "true"}'
```

## 典型工作流

当用户说「帮我监控 XXX 热点」时：

1. `POST /api/keywords` 添加关键词
2. `POST /api/scan` 立即扫描
3. `GET /api/hotspots?keyword=XXX` 返回结果
4. 向用户汇报：标题、摘要、来源、评分、原文链接

当用户说「最近 AI 编程有什么热点」时：

1. `GET /api/hotspots?limit=10` 获取最新热点
2. 按 score 排序，筛选 is_genuine=1 的内容
3. 用自然语言汇总汇报

## 数据源说明

| 来源 | 标识 | 说明 |
|------|------|------|
| Twitter/X | twitter | twitterapi.io 高级搜索 |
| 网页搜索 | web | DuckDuckGo Lite 爬虫 |
| Hacker News | hackernews | Algolia 免费 API |
| Google News | googlenews | RSS 解析 |

## AI 过滤规则

OpenRouter 会对每条内容进行结构化分析，返回：
- `is_genuine`: 是否为真实热点（过滤营销/标题党）
- `score`: 热度评分 0-100（低于 40 丢弃）
- `summary`: 50 字以内摘要

## 注意事项

- 扫描每个关键词会调用多个外部 API，注意频率，默认每 30 分钟自动扫描一次
- 无 API Key 时 Twitter 源跳过，AI 不可用时使用关键词规则降级
- 邮件通知需在 backend/.env 配置 SMTP 并在设置中开启 email_enabled
