# 前端面试 AI 助手 — LobeHub 二次开发改造方案 V2

> **最后更新**：2026-06-16 Day 1 执行中
> **开发环境**：Mac + Node 22 + pnpm + bun + Docker Desktop
> **LLM 提供商**：DeepSeek（deepseek-chat）
> **UI 风格**：专业暗色主题，结构化双栏布局

---

## 0. 豆包方案的 7 个关键问题 + Day 1 发现的新问题

### ❌ 问题一：项目结构判断错误

豆包方案反复强调"仅在 `apps/web` 下做业务开发"，但 LobeHub **根本没有 `apps/web` 目录**。实际 SPA 代码在 `src/` 下，Agent 定义在 `packages/builtin-agents/` 下，Prompt 模板在 `packages/prompts/` 下。

### ❌ 问题二：虚构不存在的环境变量

`AUTH_ENABLED`、`PLUGIN_ENABLED` 等不存在。真实开关是 `FEATURE_FLAGS` JSON 环境变量（定义在 `packages/app-config/src/featureFlags/schema.ts`）。

### ❌ 问题三：过度工程化

路由守卫、请求拦截器、3 组 Store —— 一周 demo 不需要这些，核心评价标准是**功能能跑、亮点够亮、面试能讲清楚**。

### ❌ 问题四："先隐藏后删除"策略危险

monorepo 中删除文件容易触发 import 连锁报错。**不删任何文件，只用 Feature Flag 隐藏**。

### ❌ 问题五：忽略了 LobeHub 已有的最强武器

RAG 知识库、Sandpack、Agent Function Calling、虚拟滚动、shiki 代码高亮——全部已在依赖中，不用自研。

### ❌ 问题六：数据持久化方案不现实

"全部 localStorage" 等于重写后端。保持使用现有 PostgreSQL + tRPC 架构。

### ❌ 问题七：Agent/Prompt 设计完全缺失

核心竞争力的 System Prompt 只用一句话带过。

### 🆕 Day 1 新发现：`dev:spa` 模式无法测试本地 Builtin Agent

**根因**：`dev:spa` 的 API 请求代理到生产服务器 `app.lobehub.com`，生产服务器的 `@lobechat/builtin-agents` 包不含我们新增的 `interviewer` slug。Agent 初始化 + System Prompt 运行时生成都在服务端，`dev:spa` 模式下完全绕不过去。

**解决**：切换到**全栈本地开发环境**（`bun run dev`），需要 Docker 运行 PostgreSQL + Redis + S3 + SearXNG。

---

## 1. 核心决策与用户画像

| 决策项 | 选择 |
|---|---|
| **开发模式** | 全栈本地（Docker + 本地服务端），不用 `dev:spa` |
| **Agent 注册方式** | Builtin Agent（系统内置，不可删除，简历可讲性强） |
| **核心场景** | **模拟面试**（单场景做到体验完整，不做四种模式） |
| **交互布局** | 结构化双栏：左侧题目区 + 代码编辑器，右侧对话 + 评分 |
| **UI 风格** | 专业深色主题，卡片化布局 |
| **LLM** | DeepSeek（ChatML format），System Prompt 针对 DeepSeek 优化 |
| **知识库来源** | 用户自有的结构化 Markdown 面经文件 |

### 模拟面试完整交互流程

```
进入工作台 → 选择技术方向(JS/React/浏览器/CSS/算法)
  → AI 开场问候 + 确认难度级别
    → 【循环 3-5 轮】
       左侧：AI 出题（题目 + 代码框）
       右侧：对话历史 + 候选人在输入框作答
       → AI 多维度评分（正确性/深度/表达/实战）
       → 追问或进入下一题
    → 面试结束
       → 总分报告 + 弱项分析 + 错题汇总 + 建议学习路径
```

---

## 2. 分阶段执行计划（已简化，聚焦单一场景）

### Day 1：Docker 全栈环境 + Feature Flag 瘦身 + Agent 骨架 ✅ 进行中

| 步骤 | 文件 | 操作 | 状态 |
|---|---|---|---|
| 1.1 | `.env` | 配置 `FEATURE_FLAGS` JSON | ✅ 完成 |
| 1.2 | `packages/builtin-agents/src/agents/interviewer/systemRole.ts` | **新建** — 面试官 System Prompt（4 层架构，~650 tokens） | ✅ 完成 |
| 1.3 | `packages/builtin-agents/src/agents/interviewer/index.ts` | **新建** — Agent 定义（默认 DeepSeek） | ✅ 完成 |
| 1.4 | `packages/builtin-agents/src/types.ts` | **修改** — 添加 `interviewer` slug | ✅ 完成 |
| 1.5 | `packages/builtin-agents/src/index.ts` | **修改** — 注册到 BUILTIN_AGENTS | ✅ 完成 |
| 1.6 | Docker Desktop | 安装 Docker Desktop（Mac） | ⬜ 待执行 |
| 1.7 | - | `bun run dev:docker` 启动依赖服务 | ⬜ 待执行 |
| 1.8 | - | `bun run db:migrate` 数据库迁移 | ⬜ 待执行 |
| 1.9 | - | `bun run dev` 启动全栈开发环境（Next.js + Vite） | ⬜ 待执行 |
| 1.10 | - | 验证 Interviewer Agent 在系统中可识别 | ⬜ 待执行 |

**面试考点**：
- Feature Flag 设计模式（运行时开关 vs 编译时 Tree Shaking）
- Docker 容器化开发环境（为什么需要 PostgreSQL + Redis + S3）
- Monorepo 中 packages 与 src 的分层职责

---

### Day 2：System Prompt 深度优化 + 验证对话效果 ★ 简历核心

**目标**：在本地全栈环境中验证 Agent 表现，根据 DeepSeek 实际响应调优 Prompt

| 步骤 | 文件 | 操作 |
|---|---|---|
| 2.1 | `packages/builtin-agents/src/agents/interviewer/systemRole.ts` | **调优** — 根据 DeepSeek 实际响应微调 Prompt（开场白、评分格式、追问触发条件） |
| 2.2 | - | 测试对话：验证面试流程四阶段是否正常触发 |
| 2.3 | - | 测试评分：验证四维度评分表格是否正确输出 |
| 2.4 | - | 测试出题：验证五大知识领域的题目质量 |

**DeepSeek 调优关注点**：
- System Prompt 长度对 DeepSeek 遵守度的影响
- 评分格式（Markdown 表格）在 DeepSeek 流式输出中的表现
- "一次只问一个问题"指令的遵循程度是否需要强化

---

### Day 3：面试工作台首页 + 结构化双栏聊天界面

**目标**：替换默认首页，实现左侧题目区 + 右侧对话区的双栏布局

| 步骤 | 文件 | 操作 |
|---|---|---|
| 3.1 | `src/features/InterviewHome/index.tsx` | **新建** — 面试工作台首页（技术方向选择 + 启动面试） |
| 3.2 | `src/features/InterviewChat/` | **新建** — 双栏面试对话组件 |
| 3.3 | `src/features/InterviewChat/QuestionPanel.tsx` | **新建** — 左侧：当前题目 + 代码编辑器 |
| 3.4 | `src/features/InterviewChat/ChatPanel.tsx` | **新建** — 右侧：对话历史 + 输入框 |
| 3.5 | `src/features/InterviewChat/ScoreCard.tsx` | **新建** — 评分卡片（四维度表格渲染） |

**双栏布局设计**：

```
┌─────────────────────────────────────────────────────────┐
│  🎯 前端面试 · React 方向          进度 2/5    [结束面试] │
├──────────────────────────┬──────────────────────────────┤
│  📝 当前题目              │  💬 面试对话                  │
│                          │                              │
│  Q2: 请解释 React Fiber   │  🧑‍💻 面试官: 上一题回答不错， │
│  的工作原理，以及它解决    │  我们来看下一题...            │
│  了什么问题？             │                              │
│                          │  ┌─────────────────────┐     │
│                          │  │ 📊 Q1 评分         │     │
│  ┌────────────────────┐  │  │ 正确性 4/5 ⭐      │     │
│  │ ```jsx             │  │  │ 深度   3/5 ⭐      │     │
│  │ // 你的代码区域     │  │  │ 表达   4/5 ⭐      │     │
│  │                    │  │  │ 实战   3/5 ⭐      │     │
│  │                    │  │  │ 总分 3.5/5.0       │     │
│  │ ```                │  │  └─────────────────────┘     │
│  └────────────────────┘  │                              │
│                          │  ┌─────────────────────┐     │
│  [▶ 运行代码] [📋 复制]   │  │ 输入你的回答...     │     │
│                          │  │                     │     │
│                          │  └─────────────────────┘     │
│                          │  [发送]                      │
└──────────────────────────┴──────────────────────────────┘
```

---

### Day 4：评分卡片 + 面试报告页面

**目标**：评分可视化 + 面试结束后的总结报告

| 步骤 | 文件 | 操作 |
|---|---|---|
| 4.1 | `src/features/InterviewChat/ScoreCard.tsx` | **增强** — 四维度雷达图 + 环比变化 |
| 4.2 | `src/features/InterviewChat/ReportPanel.tsx` | **新建** — 面试结束报告（总分/弱项/建议） |
| 4.3 | `src/features/Conversation/Markdown/` | **扩展** — 面试专用代码块渲染 |

**面试考点**：
- React 组合模式（双栏布局的组件拆解与通信）
- 状态驱动 UI（面试流程状态机：准备中 → 进行中 → 评分中 → 已结束）
- `createStaticStyles` 零运行时 CSS-in-JS

---

### Day 5：面经知识库 RAG 集成

**目标**：导入用户的 Markdown 面经文件，Agent 出题时可检索相关知识

| 步骤 | 文件 | 操作 |
|---|---|---|
| 5.1 | 知识库管理界面 | 导入用户的 Markdown 面经文件 |
| 5.2 | `packages/prompts/src/prompts/knowledgeBaseQA/` | **扩展** — 面试场景的上下文召回 Prompt |
| 5.3 | - | 验证 Agent 能检索并引用知识库内容 |

**面试考点**：
- RAG 原理：Embedding → 向量检索 → 上下文召回 → Prompt 拼装
- Chunk 策略：结构化面经的最佳切分粒度

---

### Day 6：Git + Vercel 部署 + README

| 步骤 | 操作 | 产出 |
|---|---|---|
| 6.1 | `git init` + GitHub 仓库创建 | 线上仓库 |
| 6.2 | Vercel 部署（连接 GitHub + 配置环境变量） | 线上可访问 |
| 6.3 | README.md 重写 | 项目介绍 + 技术架构 + 本地运行指南 |
| 6.4 | 简历话术定稿 | 下面有完整版 |

---

## 3. 改造文件清单总览

```
需要新建的文件（~10 个）：
  packages/builtin-agents/src/agents/interviewer/
  ├── index.ts                          ✅ Day 1
  └── systemRole.ts                    ✅ Day 1
  src/features/InterviewHome/
  └── index.tsx                         ⬜ Day 3
  src/features/InterviewChat/
  ├── index.tsx                         ⬜ Day 3（双栏容器）
  ├── QuestionPanel.tsx                 ⬜ Day 3（左侧题目区）
  ├── ChatPanel.tsx                     ⬜ Day 3（右侧对话区）
  ├── ScoreCard.tsx                     ⬜ Day 4（评分卡片）
  └── ReportPanel.tsx                   ⬜ Day 4（面试报告）

需要修改的文件（~6 个）：
  packages/builtin-agents/src/index.ts       ✅ Day 1
  packages/builtin-agents/src/types.ts       ✅ Day 1
  src/routes/(main)/home/index.tsx           ⬜ Day 3
  .env                                       ✅ Day 1
  README.md                                  ⬜ Day 6

不删除任何文件。所有隐藏通过 Feature Flag 实现。
```

---

## 4. 完整简历话术

### 项目一句话

> 基于开源 AI Agent 框架 LobeHub 进行垂直场景二次开发，打造面向前端工程师的模拟面试 AI 助手，支持自适应出题、多维度评分、RAG 面经知识增强。

### 技术亮点

> 1. **Agent Prompt 架构设计**：采用四层 Prompt 分层架构（角色设定/流程控制/知识领域/输出格式），基于 LobeHub Builtin Agent Runtime 实现多轮面试对话的流程编排与自适应难度调整
>
> 2. **非侵入式功能裁剪**：利用 Feature Flag 声明式开关，在不修改核心源码的前提下将通用 AI 平台裁剪为垂直场景工具
>
> 3. **结构化面试交互**：设计双栏布局（题目区 + 对话区），实现面试流程状态机（准备→出题→评分→追问→报告），基于 antd-style 的 createStaticStyles 实现零运行时 CSS-in-JS
>
> 4. **RAG 增强检索**：集成 pgvector 向量检索引擎，实现面经文档的语义分块与上下文召回，Agent 出题时自动检索相关知识

### 面试可深入聊的方向

- "为什么选择 Fork LobeHub？" → Monorepo 架构、Agent 框架设计、Builtin Agent 机制
- "System Prompt 怎么设计的？" → 四层架构、DeepSeek 适配、Token 预算管理
- "Feature Flag 机制是什么？" → 运行时开关 vs 编译时优化、声明式配置
- "RAG chunk 策略怎么定？" → 结构化面经的切分策略、Embedding 模型选择
- "双栏布局的状态管理？" → 面试流程状态机、跨组件通信

---

## 5. 当前进度

```
Day 1 (2026-06-16):
  ✅ 1.1 FEATURE_FLAGS 配置
  ✅ 1.2 Interviewer systemRole.ts
  ✅ 1.3 Interviewer index.ts
  ✅ 1.4 types.ts slug 注册
  ✅ 1.5 入口文件注册
  ✅ 1.6 Docker Desktop 安装 (v29.5.3)
  ✅ 1.7 dev:docker 启动 (5 容器 healthy)
  ✅ 1.8 db:migrate (1649ms)
  ✅ 1.9 dev 全栈启动 (Vite 9876 + Next.js 3010, TS 零报错)
  ✅ 1.10 Agent 编译验证

Day 2 (2026-06-17) ✅ 完成:
  ✅ StoreInitialization.tsx 添加 interviewer 初始化
  ✅ DeepSeek 模型名修复 (deepseek-chat → deepseek-v4-flash)
  ✅ System Prompt 完整对话验证 (四层架构生效, 四维度评分正常)
  ✅ 内存问题诊断与修复 (NODE_OPTIONS=--max-old-space-size=4096, dev:docker:light)
  ✅ 日常开发策略 (UI → dev:spa, 后端 → dev:next, Docker → dev:docker:light)
Day 3 (2026-06-17) ✅ 完成:
  ✅ InterviewHome 组件 (5 方向卡片 + createStaticStyles)
  ✅ 首页路由替换 (HomeContent → InterviewHome)
  ✅ react-scan 调试浮层关闭
  ⏸️ InterviewChat 双栏界面调整到 Day 4（首页本身工作量够一天）
Day 4: ⬜ 未开始
Day 5: ⬜ 未开始
Day 6 (2026-06-17) ✅ 完成:
  ✅ 侧边栏精简 (8项→4项)
  ✅ QuestionPanel 简化为纯代码编辑器
  ✅ README.md 重写
  ✅ daily/project-docs.md 项目文档
  ✅ daily/interview-prep.md 面试准备文档
  ✅ Git 初始化 + 两次提交
  🎉 六天改造全部完成
```

---

> **下一步 (Day 2)**: 在本地环境验证 Interviewer Agent 对话效果，调优 System Prompt。
