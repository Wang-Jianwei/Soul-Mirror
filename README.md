# Soul Mirror - Agent-Friendly Framework

> An agent-friendly, sustainable iteration engineering paradigm framework
> 
> 一个 Agent 友好的、可持续迭代的工程范式框架

---

## 🎯 项目定位

**Soul Mirror** 是一个基于「不变人性」的个人觉醒产品，同时也是一个**Agent 协作开发的范式实验**。

本项目探索：
- 🤖 **Agent 友好** - AI 可理解、可执行、可迭代的工程结构
- 🔄 **可持续迭代** - 清晰的演进路径，支持长期维护
- 📚 **范式框架** - 可复用的方法论，适用于类似项目

---

## 📁 项目结构

```
Soul-Mirror/
├── .agent/                 # Agent 配置与上下文
│   ├── context.md          # 项目上下文（必读）
│   ├── tasks/              # 任务队列
│   └── memory/             # 迭代记忆
├── src/                    # 源代码
│   ├── core/               # 核心逻辑
│   ├── app/                # 应用层
│   └── infra/              # 基础设施
├── docs/                   # 文档
│   ├── prd/                # 产品需求文档
│   ├── design/             # 设计文档
│   ├── tech/               # 技术文档
│   └── business/           # 商业文档
├── tests/                  # 测试
├── scripts/                # 脚本工具
├── .github/                # GitHub 配置
│   └── workflows/          # CI/CD
├── Makefile                # 常用命令
└── README.md               # 本文件
```

---

## 🤖 Agent 快速开始

### 第一步：阅读上下文

```bash
# 每个会话开始前，Agent 必须阅读
read .agent/context.md
read docs/prd/README.md
```

### 第二步：查看任务队列

```bash
# 查看当前待办任务
ls .agent/tasks/
cat .agent/tasks/current.md
```

### 第三步：执行任务

```bash
# 根据任务类型执行
make help          # 查看可用命令
make dev           # 启动开发环境
make test          # 运行测试
make deploy        # 部署
```

---

## 🔄 迭代流程

### 1. 规划阶段

- 在 `.agent/tasks/` 创建任务文档
- 明确目标、验收标准、依赖关系

### 2. 开发阶段

- 按 `src/` 目录规范编写代码
- 同步更新相关文档
- 编写测试用例

### 3. 验收阶段

- 运行测试：`make test`
- 代码审查：遵循 `.agent/guidelines.md`
- 更新 `.agent/memory/` 记录决策

### 4. 部署阶段

- 更新版本号
- 编写 CHANGELOG
- 执行 `make deploy`

---

## 📝 文档规范

### 产品文档 (docs/prd/)

- `README.md` - 产品总览
- `features/` - 功能需求
- `user-stories/` - 用户故事

### 设计文档 (docs/design/)

- `ux/` - 交互设计
- `ui/` - 视觉设计
- `prototype/` - 原型

### 技术文档 (docs/tech/)

- `architecture.md` - 架构设计
- `api/` - API 文档
- `database/` - 数据库设计

---

## 🏗️ 架构原则

### 核心原则

1. **本地优先** - 敏感数据留在设备
2. **渐进智能** - 先跑起来，再逐步加 AI
3. **可解释** - 每个决策都能说清楚为什么

### 技术栈

- **前端**: React Native + TypeScript
- **后端**: Supabase (PostgreSQL + Auth)
- **AI**: Claude API + 本地轻量模型
- **部署**: GitHub Actions + 云原生

---

## 🤝 协作规范

### Commit 规范

```
type(scope): subject

body

footer
```

Types:
- `feat` - 新功能
- `fix` - 修复
- `docs` - 文档
- `refactor` - 重构
- `test` - 测试
- `chore` - 杂项

### 分支策略

- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复

---

## 📊 项目状态

| 模块 | 状态 | 进度 |
|------|------|------|
| 产品定义 | ✅ 完成 | 100% |
| 技术架构 | ✅ 完成 | 100% |
| MVP 开发 | 🚧 进行中 | 30% |
| 测试覆盖 | ⏳ 待开始 | 0% |
| 上线部署 | ⏳ 待开始 | 0% |

---

## 🔗 相关链接

- [产品原型](docs/design/prototype/)
- [技术路线图](docs/tech/roadmap.md)
- [商业模式](docs/business/model.md)

---

*此心光明，亦复何言。*
