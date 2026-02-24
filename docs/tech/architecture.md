# 技术架构文档

## 架构概览

```
┌─────────────────────────────────────────┐
│              客户端层                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   iOS   │ │ Android │ │   Web   │   │
│  │ (Swift) │ │(Kotlin) │ │(React)  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│       └─────────────┴─────────────┘     │
│              本地 SQLite                 │
│         (渴爱记录、本性图谱)              │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│              服务层（云端）              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 用户认证 │ │ 数据同步 │ │ 内容管理 │   │
│  │ (Supabase)│ │(加密存储)│ │(CMS)    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  ┌─────────┐ ┌─────────┐               │
│  │ AI 推理 │ │ 分析引擎 │               │
│  │(OpenAI/ │ │(模式识别)│               │
│  │ Claude) │ │         │               │
│  └─────────┘ └─────────┘               │
└─────────────────────────────────────────┘
```

---

## 技术栈

### 前端

| 技术 | 用途 | 版本 |
|------|------|------|
| React Native | 跨平台框架 | 0.72+ |
| TypeScript | 类型安全 | 5.0+ |
| Zustand | 状态管理 | 4.0+ |
| React Navigation | 导航 | 6.0+ |
| React Native Paper | UI 组件 | 5.0+ |

### 后端

| 技术 | 用途 | 版本 |
|------|------|------|
| Supabase | 后端服务 | 最新 |
| PostgreSQL | 数据库 | 15+ |
| PostgREST | REST API | 内置 |
| Edge Functions | 边缘计算 | 内置 |

### AI

| 技术 | 用途 | 版本 |
|------|------|------|
| Claude API | 复杂推理 | 最新 |
| TensorFlow Lite | 本地模型 | 2.0+ |
| LangChain | AI 编排 | 0.1+ |

---

## 数据模型

### 用户 (users)

```typescript
interface User {
  id: string;
  email: string;
  created_at: Date;
  nature_profile?: NatureProfile;
}
```

### 渴爱记录 (desire_records)

```typescript
interface DesireRecord {
  id: string;
  user_id: string;
  content: string;
  type: 'knowledge' | 'material' | 'relationship' | 'other';
  intensity: number; // 1-10
  created_at: Date;
  fulfilled_at?: Date;
  satisfaction?: number; // 1-10
}
```

### 本性图谱 (nature_profiles)

```typescript
interface NatureProfile {
  id: string;
  user_id: string;
  survival: number;    // 生存优先
  reproduction: number; // 繁衍本能
  belonging: number;   // 群居归属
  pleasure: number;    // 趋乐避苦
  self_interest: number; // 自利利他
  curiosity: number;   // 好奇探索
  emotion: number;     // 共通情绪
  updated_at: Date;
}
```

### 决策记录 (decisions)

```typescript
interface Decision {
  id: string;
  user_id: string;
  title: string;
  context: string;
  ai_conversation: Message[];
  conclusion: string;
  created_at: Date;
  review_at?: Date;
}
```

---

## API 设计

### 渴爱记录

```typescript
// 创建记录
POST /api/desires
{
  content: string;
  type: DesireType;
  intensity: number;
}

// 获取记录列表
GET /api/desires?limit=20&offset=0

// 获取模式分析
GET /api/desires/pattern
```

### 本性图谱

```typescript
// 提交评估
POST /api/nature-profile
{
  answers: number[]; // 70题答案
}

// 获取图谱
GET /api/nature-profile

// 获取相似用户
GET /api/nature-profile/similar?limit=5
```

### 决策辅助

```typescript
// 开始决策对话
POST /api/decisions
{
  title: string;
  context: string;
}

// 继续对话
POST /api/decisions/:id/message
{
  content: string;
}

// 获取决策历史
GET /api/decisions
```

---

## 安全设计

### 本地数据

- SQLite 数据库加密（SQLCipher）
- 敏感字段 AES-256 加密
- 密钥存储在 Keychain/Keystore

### 云端数据

- 传输层 HTTPS/TLS 1.3
- 数据库字段级加密
- Row Level Security (RLS)

### 认证

- JWT Token
- Refresh Token 轮换
- 生物识别支持

---

## 性能优化

### 启动优化

- 代码分割
- 懒加载
- 预加载关键资源

### 运行时优化

- 虚拟列表（长列表）
- 图片懒加载
- 缓存策略

### 离线支持

- Service Worker
- 本地队列同步
- 冲突解决策略

---

*最后更新: 2026-02-24*
