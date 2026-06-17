# 前端面试 AI 助手

基于 [LobeHub](https://github.com/lobehub/lobehub) 二次开发的垂直场景 AI Agent 工具——面向前端工程师的智能模拟面试平台。

## 功能

- **模拟面试**：选择 JavaScript / React / 浏览器 / CSS / 算法方向，AI 面试官自适应出题
- **多维度评分**：每道题从正确性、深度、表达、实战四个维度评估
- **RAG 知识增强**：导入个人面经文档，Agent 自动检索真实大厂面试题
- **双栏面试界面**：左侧题目区 + 代码编辑器，右侧对话 + 评分展示
- **精简专注**：通过 Feature Flag 关闭通用 AI 平台冗余功能，聚焦面试场景

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 + React 19 + TypeScript |
| UI | @lobehub/ui + antd-style (createStaticStyles) |
| 状态管理 | Zustand 5 |
| 数据层 | tRPC + SWR + PostgreSQL (Drizzle ORM) |
| AI | DeepSeek V4 + SSE 流式渲染 |
| RAG | pgvector 向量检索 + LobeHub 内置知识库引擎 |
| Agent | Builtin Agent Framework + 四层 Prompt 架构 |

## 架构

```
src/
├── features/
│   ├── InterviewHome/      # 面试工作台首页
│   └── InterviewChat/      # 双栏面试界面 + 评分卡片
├── routes/(main)/
│   ├── home/               # 首页路由（已替换为 InterviewHome）
│   └── agent/              # Agent 对话路由（interviewer 时启用双栏）
packages/builtin-agents/
└── agents/interviewer/     # 面试官 Agent 定义 + System Prompt
```

## 本地运行

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example.development .env
# 编辑 .env，填写 DeepSeek API Key

# 3. 启动 Docker（仅需 PostgreSQL + Redis）
bun run dev:docker:light

# 4. 数据库迁移
bun run db:migrate

# 5. 启动开发环境（两个终端）
bun run dev:spa          # 终端 1: Vite 前端
bun run dev:next         # 终端 2: Next.js 后端

# 6. 访问 http://localhost:3010
```

## 面试知识库

1. 将 Markdown 面经文件上传至「资源」→「文件」
2. 创建知识库（如「前端面经」）
3. Agent 出题时会自动检索知识库中的真实面试题

## License

MIT
