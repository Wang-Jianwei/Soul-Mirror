# Agent 开发指南

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装依赖
make setup

# 启动开发环境
make dev
```

### 2. 开发流程

```bash
# 1. 阅读上下文
cat .agent/context.md

# 2. 查看当前任务
cat .agent/tasks/current.md

# 3. 创建功能分支
git checkout -b feature/TASK-001

# 4. 开发并测试
make test

# 5. 提交代码
git commit -m "feat: 实现渴爱追踪功能"

# 6. 合并到 develop
git checkout develop
git merge feature/TASK-001
```

---

## 📝 代码规范

### TypeScript 规范

```typescript
// ✅ 使用显式类型
function calculateScore(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

// ❌ 避免隐式 any
function bad(values) {  // 错误！
  return values.reduce(...);
}
```

### 组件规范

```typescript
// 组件文件: src/components/DesireTracker.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface DesireTrackerProps {
  onRecord: (desire: string) => void;
}

export const DesireTracker: React.FC<DesireTrackerProps> = ({ onRecord }) => {
  // 实现
};
```

---

## 🧪 测试规范

### 单元测试

```typescript
// tests/core/desire.test.ts
import { analyzeDesirePattern } from '@/core/desire';

describe('analyzeDesirePattern', () => {
  it('should identify knowledge anxiety pattern', () => {
    const records = [
      { desire: '想买课', date: '2026-01-01' },
      { desire: '想学新技能', date: '2026-01-15' },
    ];
    const result = analyzeDesirePattern(records);
    expect(result.type).toBe('knowledge_anxiety');
  });
});
```

---

## 📚 文档规范

### 更新文档的时机

- **新增功能** → 更新 `docs/prd/`
- **修改架构** → 更新 `docs/tech/` + `ADR`
- **修复 Bug** → 更新 `CHANGELOG.md`
- **完成任务** → 更新 `.agent/tasks/current.md`

---

## 🤖 Agent 自检清单

提交代码前，确认：

- [ ] 阅读了 `.agent/context.md`
- [ ] 代码通过 `make lint`
- [ ] 测试通过 `make test`
- [ ] 更新了相关文档
- [ ] 提交了清晰的 commit message

---

## 🆘 常见问题

### Q: 如何添加新任务？

A: 在 `.agent/tasks/current.md` 按模板添加。

### Q: 如何记录架构决策？

A: 在 `.agent/memory/decisions.md` 按 ADR 格式添加。

### Q: 遇到不确定的问题？

A: 在 `.agent/memory/todos.md` 记录，等待人工确认。

---

*此心光明，亦复何言。*
