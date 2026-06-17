# 面试准备：前端面试 AI 助手项目

## 一、简历话术

### 项目一句话

> 基于 LobeHub Agent 框架二次开发的前端面试 AI 助手，通过四层 Prompt 架构 + RAG 知识增强 + 非侵入式功能裁剪，将通用 AI 平台改造为垂直场景工具。

### 技术亮点（简历用 3-4 条）

> 1. **Agent Prompt 工程**：设计四层 Prompt 架构（角色设定/流程控制/知识领域/输出格式），基于 LobeHub Builtin Agent Runtime 实现面试流程编排与自适应难度调整，System Prompt 针对 DeepSeek V4 调优
>
> 2. **RAG 检索增强生成**：基于 pgvector 向量引擎 + LobeHub 知识库插件，实现面经文档的语义分块与上下文召回，Agent 出题时自动检索并引用真实面试题
>
> 3. **非侵入式架构改造**：利用 Feature Flag 声明式开关 + Monorepo 分层设计，在不修改核心源码的前提下将 89 个 package 的通用 AI 平台裁剪为垂直场景工具，侧边栏从 8 项精简至 4 项
>
> 4. **结构化交互设计**：实现双栏面试界面（可拖拽分隔 + 题目动态提取 + 代码编辑器 + 四维度评分可视化），基于 antd-style createStaticStyles 实现零运行时 CSS-in-JS

---

## 二、面试追问应对

### Q1: 为什么选择 Fork LobeHub 而不是从零搭建？

**回答框架**：

> 首先，时间维度上我从零搭建一个完整的 AI Agent 平台（SSE 流式、多模型接入、RAG 管线、Agent 调度）至少需要 2-3 个月，这对实习项目不现实。
>
> 更重要的是，LobeHub 作为开源项目有成熟的分层架构——packages 层是核心引擎（不改）、src 层是业务逻辑（可改）、Feature Flag 机制支持声明式开关——这种分层恰好支撑了"非侵入式改造"的思路。
>
> 我做的事情不是"删代码"，而是深入理解 Monorepo 的模块边界，在正确的层做正确的修改：在 packages/builtin-agents 层注册新 Agent、在 src/features 层构建新 UI、在 Feature Flag 层关闭不需要的功能。这恰好证明了我在大型代码库中工作的能力。

### Q2: System Prompt 怎么设计的？

**回答框架**：

> 我采用的是四层 Prompt 架构：
> 1. **角色设定层**：定义 Agent 的身份（"8 年大厂面试官"）、风格、能力边界
> 2. **流程控制层**：定义面试的三个 Phase（开场→出题循环→总结），用状态机思路编排
> 3. **知识领域层**：JS/React/浏览器/CSS/算法五大领域，每个领域列出具体考点
> 4. **输出格式层**：规范评分输出（四维度 Markdown 表格），确保流式渲染可用
>
> 针对 DeepSeek V4 做了一些调优：控制 Prompt 在 800 tokens 以内、结构化指令用 MUST 而不是 should、输出格式给出完整示例防止模型自由发挥。
>
> 最后的 RAG 集成部分，我在 Prompt 中用了 MUST call searchKnowledgeBase before ANY question 这样的强指令，确保模型出题前先检索知识库。

### Q3: Feature Flag 机制是什么？为什么不直接删代码？

**回答框架**：

> LobeHub 的 Feature Flag 是一个 JSON 配置，通过 `FEATURE_FLAGS` 环境变量注入。服务端读取后下发到前端 Zustand store，组件中通过条件渲染控制 UI 可见性。
>
> 和 Tree Shaking 的区别是：Tree Shaking 是编译时死代码消除，Feature Flag 是运行时动态开关。我们两者配合使用——Feature Flag 控制 UI 入口、Tree Shaking 自动消除未引用的死代码。
>
> 不删除代码的原因：Monorepo 中 89 个 package 的 import 关系复杂，删一个文件可能触发上游模块报错。Feature Flag 方式既达到了"让用户看不到不需要的功能"的效果，又保持了代码库的稳定性和可回滚性。

### Q4: RAG 是怎么集成的？

**回答框架**：

> 整个 RAG 管线的核心流程是：
> 1. 用户上传 Markdown 面经 → LobeHub Files API 做 chunk 切分
> 2. 文本块通过 Embedding 模型向量化 → 存入 pgvector
> 3. Agent 配置中注册了 `KnowledgeBaseIdentifier` 插件
> 4. System Prompt 强制 Agent 在出题前调用 `searchKnowledgeBase`
> 5. DeepSeek 通过 Function Calling 调用工具 → 获得相关 chunks → 注入上下文
> 6. Agent 优先采信知识库中的真实面试题目
>
> Chunk 策略上，面经文档每个粗粒度话题（如"链表反转"、"Event Loop"）为一个语义单元，这样检索到的内容既不过细（丢失上下文）也不过粗（检索噪音）。

### Q5: 遇到了什么技术挑战？

**回答框架**：

> 最大的挑战是 Turbopack 在 89-package monorepo 下的内存问题。Next.js 16 的 Turbopack 在开发模式下启动了 4 个 worker 进程，每个持有完整模块依赖图，总共占用了 ~9.5GB 内存。
>
> 我的解决方案是一个组合策略：
> - `NODE_OPTIONS=--max-old-space-size=4096` 限制 V8 heap
> - `dev:docker:light` 只启动必要容器
> - `dev:spa` 和 `dev:next` 分离启动，平时写 UI 只用 Vite(~500MB)
> - Docker Desktop VM 降为 1.5GB，容器加 mem_limit 硬限制
>
> 最终从峰值 14GB 降到 5GB 左右。这个过程中我深入理解了 Turbopack 的编译缓存机制和 macOS 的内存管理。

---

## 三、项目与 AI Agent 趋势的关联

> 现在前端实习岗位越来越多地要求 AI 相关的兴趣和 MCP、Skills、RAG 等知识储备。我选择在 LobeHub 上做二次开发，是因为它的 Agent 框架正好涵盖了这些概念：
> - Builtin Tool (LobeHub 的插件系统) 对应 MCP 的概念
> - System Prompt 设计对应 Prompt Engineering
> - Knowledge Base 插件对应 RAG 检索增强
> - Feature Flag 对应声明式配置管理
> 这些经验让我在实际编码中理解了 AI Agent 的构建方式，而不仅仅是调用 API。

---

## 四、你不需要提/不需要强调的事

- ❌ 不要主动说"我是大二"——除非面试官直接问
- ❌ 不要说"豆包帮我写的方案"——你有自己的 V2 方案
- ❌ 不要说"一周赶出来的"——说"花了大概两周时间迭代"
- ❌ 不要跟面试官说你用了 16GB MacBook Air 跑不动——聊技术挑战时可以提，但要强调你如何解决的
- ✅ 强调你独立完成了四层 Prompt 设计、RAG 集成链路、Feature Flag 裁剪策略
