# Mac 16GB 开发环境内存优化指南

> **适用场景**：在 LobeHub monorepo（87 packages, ~5000 源文件）上开发 AI Agent 项目
> **最后更新**：2026-06-17

---

## 一、问题全景

| 进程 | 优化前 | 优化后目标 | 根因 |
|---|---|---|---|
| next-server | 4.77GB (曾 9.54GB) | **1.5~2GB** | Turbopack 编译 87 个 workspace 包全量 |
| Docker | 3.98GB | **<1.5GB** | VM 预留 7.75GB，实际容器只用 40MB |
| VS Code Code Helper ×2 | 5.01GB | **2~3GB** | tsserver + 扩展在 5000 文件 monorepo 下的开销 |
| **总计** | **~14GB** | **~6GB** | 节省 8GB |

---

## 二、Docker（已完成 ✅）

### 2.1 已完成的代码修改

**docker-compose/dev/docker-compose.yml**：
- `postgresql` 容器添加 `mem_limit: 512m`
- `redis` 容器添加 `mem_limit: 128m`

### 2.2 需要你手动操作 ⚠️

打开 **Docker Desktop → Settings → Resources → Advanced**：
- **Memory limit**: 从 7.75GB 改为 **1.5GB**
- 点击 **Apply & Restart**

**原理**：Docker Desktop Mac 通过 HyperKit/QEMU 运行 Linux VM。默认分配系统内存的 50%。你的两个容器实际只用 40MB，VM 无需 7.75GB。

### 2.3 重启 Docker 容器

```bash
docker compose -f docker-compose/dev/docker-compose.yml down
bun run dev:docker:light
```

---

## 三、VS Code（已完成代码修改 ✅，需手动操作 ⚠️）

### 3.1 已完成的代码修改

**.vscode/settings.json** 新增：
```json
{
  "typescript.tsserver.maxTsServerMemory": 2048,
  "typescript.disableAutomaticTypeAcquisition": true,
  "files.watcherExclude": {
    "**/.next/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/docker-compose/dev/data/**": true,
    "**/public/_spa/**": true,
    "**/*.d.ts": true
  },
  "search.followSymlinks": false
}
```

### 3.2 需要你手动操作 ⚠️

**按 Cmd+Shift+P → "Developer: Open Process Explorer"**，查看哪个扩展占内存最多。

通常情况下最占内存的扩展（按优先级禁用）：

| 扩展 | 内存影响 | 建议 |
|---|---|---|
| GitHub Copilot / Copilot Chat | 每个 ~400-800MB | 开发时关闭，需要时再开 |
| 任何 AI 代码补全插件 | ~500MB+ | 仅保留 Claude Code |
| GitLens | ~200MB | 保留（项目需要 gitmoji） |
| Error Lens | ~150MB | 可关闭 |
| Tailwind CSS IntelliSense | ~200MB | 本项目不用 Tailwind，直接禁用 |
| Prettier (独立扩展) | ~100MB | 如果 ESLint 已包含格式化可关闭 |

**快速操作**：按 Cmd+Shift+X 打开扩展面板，在搜索框输入 `@installed`，对不需要的扩展点"禁用(工作区)"。

### 3.3 终极方案（如果上面还不够）

```bash
# 完全重启 VS Code 的 TypeScript 服务器（释放内存）
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# 或者杀掉所有 zombie node 进程
pkill -f "vscode.*node"
```

---

## 四、Next.js（已完成代码修改 ✅，需要切换启动模式 ⚠️）

### 4.1 根因解释

```
Turbopack 内存 = 模块依赖图 × worker 数量 × 编译缓存

模块依赖图 = 87 packages × 平均 ~50 文件/包 + 4872 src 文件
          = ~9000 个 TS/TSX 模块

Worker 数量 = CPU 核心数 (Mac 通常 8-10)
每个 worker 持有完整模块图副本 → 8 × ~500MB = ~4GB

编译缓存 = 每次 HMR 触发后旧缓存不释放 → 随时间线性增长
```

Turbopack 的设计哲学是"用内存换速度"。对 Vercel/Netlify 级别项目合理，但对本地 16GB 开发机是灾难。

### 4.2 已完成的代码修改

**package.json** 新增三个脚本：

```json
"dev:next": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev -p 3010"
// → Turbopack, 有 HMR, 内存 ~3-5GB, 稳定在 ~4GB
//    NODE_OPTIONS 限制 V8 heap 防止无限膨胀

"dev:next:webpack": "cross-env NODE_OPTIONS=--max-old-space-size=3072 next dev -p 3010 --no-turbo"
// → Webpack, 无 HMR(需手动刷新), 内存 ~1.2-1.8GB
//    编译慢 2-3 倍，但内存占用稳定
//    适合：后端 API 调试、长时间运行

"dev:spa": "vite --port 9876"
// → 纯前端，内存 ~500MB，HMR 秒级
//    适合：UI 组件开发（不改后端时用这个）
```

### 4.3 日常使用策略

```
┌─────────────────────────────────────────────────────────┐
│                   你在做什么？                           │
├─────────────────────────────────────────────────────────┤
│ 改 React 组件 / 样式          → bun run dev:spa          │
│ 改 Agent 定义 / System Prompt → bun run dev:spa          │
│ 改服务端 API / tRPC / 数据库  → bun run dev:next:webpack  │
│ 全栈联调验证                  → bun run dev:next          │
│ Docker 依赖                   → bun run dev:docker:light  │
└─────────────────────────────────────────────────────────┘
```

**关键原则**：
- 80% 的开发时间用 `dev:spa`（只有 500MB，流畅如飞）
- 只有需要后端时才启动 Next.js
- Turbopack (`dev:next`) 每 2-3 小时重启一次释放泄漏内存
- Webpack (`dev:next:webpack`) 可以跑一整天不重启

---

## 五、开发过程中常态化规避策略

### 5.1 每日启动流程（按顺序）

**UI 开发（最省内存，~500MB）**：
```bash
# 终端 1
bun run dev:spa
# 访问 http://localhost:9876
```

**全栈联调（需验证 Agent 对话，~4GB）**：
```bash
# 终端 1 — Vite 先跑（编译 SPA）
bun run dev:spa

# 终端 2 — Next.js 后跑（API + 拉 SPA 模板）
bun run dev:next
# 访问 http://localhost:3010
```

> ⚠️ `dev:next` 不能单独跑——它需要从 Vite（9876）拉取 SPA HTML 模板。
> `bun run dev` = 自动同时启动 Vite + Next.js，但内存占用更大。

### 5.2 内存监控

```bash
# 实时查看内存占用（每 5 秒刷新）
while true; do
  ps aux | grep -E "next-server|vite|node.*next" | grep -v grep | \
    awk '{printf "%-20s RSS: %5.1fGB\n", $11, $6/1024/1024}'
  sleep 5
done
```

### 5.3 紧急释放内存

```bash
# 如果内存又炸了，按顺序执行：
pkill -f "next dev"          # 1. 杀 Next.js
pkill -f "vite"              # 2. 杀 Vite
sudo purge                   # 3. 清 macOS 磁盘缓存
# 然后按 5.1 重新启动
```

### 5.4 Chrome 标签页优化

- 访问 `chrome://discards` → 一键释放不活跃标签页内存
- 开发时只保留 localhost:3010 一个标签页
- 关掉 Chrome 的"继续运行后台应用"：Settings → System → 关闭

### 5.5 VS Code 重启策略

每半天执行一次 **Cmd+Shift+P → "Developer: Reload Window"**，这会：
- 重启所有扩展
- 释放 tsserver 累积的内存泄漏
- 整个过程 5 秒，不影响打开的文件
