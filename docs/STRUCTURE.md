# 项目根目录说明

## 目录结构

```
Soul-Mirror/
├── .agent/                 # Agent 配置与上下文
│   ├── context.md          # 项目上下文（必读）
│   ├── guidelines.md       # 开发指南
│   ├── tasks/              # 任务队列
│   │   └── current.md      # 当前任务
│   └── memory/             # 迭代记忆
│       ├── decisions.md    # 架构决策
│       └── lessons.md      # 经验教训
│
├── src/                    # 源代码
│   ├── core/               # 核心业务逻辑
│   │   ├── desire/         # 渴爱追踪
│   │   ├── nature/         # 本性图谱
│   │   └── decision/       # 良知决策
│   ├── app/                # 应用层
│   │   ├── components/     # 组件
│   │   ├── screens/        # 页面
│   │   ├── navigation/     # 导航
│   │   └── store/          # 状态管理
│   └── infra/              # 基础设施
│       ├── database/       # 数据库
│       ├── api/            # API 客户端
│       └── ai/             # AI 服务
│
├── docs/                   # 文档
│   ├── prd/                # 产品需求
│   ├── design/             # 设计文档
│   ├── tech/               # 技术文档
│   └── business/           # 商业文档
│
├── tests/                  # 测试
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── e2e/                # 端到端测试
│
├── scripts/                # 脚本工具
│   ├── setup.sh            # 环境设置
│   └── deploy.sh           # 部署脚本
│
├── .github/                # GitHub 配置
│   └── workflows/          # CI/CD
│       └── ci.yml          # 持续集成
│
├── Makefile                # 常用命令
├── CHANGELOG.md            # 变更日志
└── README.md               # 项目说明
```

## 快速导航

| 我想... | 查看... |
|---------|---------|
| 了解项目 | [README.md](../README.md) |
| 开始开发 | [.agent/context.md](.agent/context.md) |
| 查看任务 | [.agent/tasks/current.md](.agent/tasks/current.md) |
| 了解产品 | [docs/prd/README.md](docs/prd/README.md) |
| 了解技术 | [docs/tech/architecture.md](docs/tech/architecture.md) |

## Agent 必读

每个新会话开始前，Agent 必须按顺序阅读：

1. `.agent/context.md` - 项目上下文
2. `.agent/tasks/current.md` - 当前任务
3. `docs/prd/README.md` - 产品需求

---

*此文件由 Agent 生成，用于帮助 Agent 快速理解项目结构。*
