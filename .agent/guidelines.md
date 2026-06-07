# Agent 开发指南

> 哲学立基：[00-思想源泉.md](../docs/00-思想源泉.md)  
> 当前任务：[.agent/tasks/current.md](tasks/current.md)

---

## 🚀 快速开始

```bash
# 查看项目上下文
cat .agent/context.md

# 查看当前任务
cat .agent/tasks/current.md

# 创建功能分支
git checkout -b feature/TASK-XXX

# 写代码、提交
git add -A
git commit -m "feat: ..."
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

- **新增功能** → 更新 [02-功能体系.md](../docs/02-功能体系.md)
- **修改架构** → 更新 [05-技术与路线图.md](../docs/05-技术与路线图.md)
- **完成任务** → 更新 [.agent/tasks/current.md](tasks/current.md)

> 注：原 `CHANGELOG.md` 已删除，重大变更记在 commit message 里。

---

## 🤖 Agent 自检清单

提交前确认：

- [ ] 阅读了 `.agent/context.md`
- [ ] 代码通过 lint
- [ ] 测试通过（如有）
- [ ] 更新了相关文档
- [ ] 提交了清晰的 commit message

---

## 🆘 常见问题

### Q: 如何添加新任务？

A: 在 [.agent/tasks/current.md](tasks/current.md) 按模板添加。

### Q: 如何记录架构决策？

A: 在 [.agent/memory/decisions.md](memory/decisions.md) 按 ADR 格式添加。

### Q: 遇到不确定的问题？

A: 记录到 `.agent/memory/todos.md`（待创建），等待人工确认。

---

*此心光明，亦复何言。*
