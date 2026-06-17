# 前端面试 AI 助手 — 项目说明文档

## 项目概述

基于开源 AI Agent 框架 LobeHub 二次开发的垂直场景工具，将通用的 AI 平台改造为面向前端工程师的智能模拟面试助手。

## 快速开始

### 环境要求

- Node.js 22 LTS
- pnpm 10.x + bun
- Docker Desktop（仅需 PostgreSQL + Redis）

### 本地运行

```bash
pnpm install
cp .env.example.development .env
# 编辑 .env 填入 DeepSeek API Key

bun run dev:docker:light   # 启动 PostgreSQL + Redis
bun run db:migrate         # 初始化数据库

# 两个终端
bun run dev:spa            # Vite 前端 (localhost:9876)
bun run dev:next           # Next.js 后端 (localhost:3010)

# 访问 http://localhost:3010
```

### API Key 配置

本项目使用 DeepSeek V4，在 `.env` 中配置：

```env
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_PROXY_URL=https://api.deepseek.com/v1
```

## 功能说明

### 模拟面试

1. 打开首页，选择技术方向（JS / React / 浏览器 / CSS / 算法）
2. 点击「开始面试」，进入双栏面试界面
3. 左侧：代码编辑器（深色主题，支持语法高亮的文本编辑）
4. 右侧：AI 面试官对话区，支持 SSE 流式输出
5. 每道题回答后，Agent 给出四维度评分（正确性/深度/表达/实战）

### 面经知识库（RAG）

1. 在「资源」→「文件」上传 Markdown 面经文档
2. 创建知识库（如「前端面经」），关联文件
3. Agent 出题前自动检索知识库，优先采信真实面试题

### Agent 配置

访问 `/agent/interviewer` 进入面试官 Agent。可在 Agent 设置中调整：
- 模型选择（默认 deepseek-v4-flash）
- System Prompt（四层架构，支持自定义）

## 项目架构

```
lobehub-canary/
├── packages/                          # Monorepo 共享包（核心引擎，不改）
│   ├── builtin-agents/                # 内置 Agent 定义 ★
│   │   └── agents/interviewer/        # 面试官 Agent
│   │       ├── systemRole.ts          # 四层 Prompt 架构
│   │       └── index.ts              # Agent 定义 + 插件注册
│   ├── builtin-tool-knowledge-base/   # 知识库 RAG 工具
│   └── app-config/                    # Feature Flag 配置
│
├── src/
│   ├── features/                      # 业务 UI 组件 ★
│   │   ├── InterviewHome/             # 面试工作台首页
│   │   └── InterviewChat/             # 双栏面试界面
│   │       ├── index.tsx              # 容器 + 拖拽分隔
│   │       ├── QuestionPanel.tsx      # 左侧代码编辑器
│   │       ├── ScoreCard.tsx          # 四维度评分可视化
│   │       └── ReportCard.tsx         # 面试总结报告
│   ├── routes/(main)/
│   │   ├── home/                      # 首页路由
│   │   └── agent/                     # Agent 对话路由
│   ├── store/                         # Zustand 状态管理（只读不改）
│   ├── services/                      # API 服务层（只读不改）
│   └── hooks/                         # 通用 Hooks
│
├── apps/server/                       # 后端服务
├── daily/                             # 开发日报 + 文档
└── README.md
```

## 改造策略

### 核心原则：非侵入式改造

只修改业务层代码，不触碰核心引擎：
- ✅ 修改：`packages/builtin-agents/`（Agent 定义）
- ✅ 修改：`src/features/`（UI 组件）
- ✅ 修改：`src/routes/`（页面路由）
- ✅ 修改：`.env`（Feature Flag 配置）
- ❌ 不改：`packages/agent-runtime/`（Agent 运行时）
- ❌ 不改：`packages/model-runtime/`（模型运行时）
- ❌ 不改：`src/store/`（核心状态管理）
- ❌ 不改：`src/services/chat/`（SSE 流式渲染）

### Feature Flag 功能裁剪

通过 `FEATURE_FLAGS` 环境变量声明式关闭不需要的功能入口，零代码删除：

```env
FEATURE_FLAGS={"market":false,"ai_image":false,"speech_to_text":false,...}
```

裁剪结果：侧边栏从 8 项精简至 4 项（Home / Search / Resource / Settings）。

## 技术实现要点

### Agent 四层 Prompt 架构

```
Layer 1 — 角色设定：定义身份、风格、能力边界
Layer 2 — 流程控制：三阶段面试流程（开场→出题循环→总结）
Layer 3 — 知识领域：JS/React/浏览器/CSS/算法五大方向
Layer 4 — 输出格式：规范评分表格结构，确保流式渲染可用
```

### RAG 检索增强流程

```
面经 Markdown → 上传 → chunk 切分 → Embedding 向量化
→ pgvector 存储 → Agent Function Calling → searchKnowledgeBase
→ 检索相关 chunks → 注入 LLM 上下文 → 生成引用真实面经的面试题
```

### 评分系统

每道题四个维度 1-5 分：正确性 / 深度 / 表达 / 实战洞察。总分加权平均，低于 3.5 分自动追问薄弱维度。

## 内存优化

16GB Mac 开发环境优化方案详见 `daily/memory-optimization-guide.md`。核心措施：

- `NODE_OPTIONS=--max-old-space-size=4096` 限制 V8 heap
- `dev:spa` + `dev:next` 分离启动（平时写 UI 只用 Vite ~500MB）
- Docker 容器 `mem_limit` 硬限制 + Desktop VM 降为 1.5GB
