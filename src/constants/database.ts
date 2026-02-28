// 心镜数据库配置
// SQLite 本地存储

export const DB_NAME = 'soulmirror.db';

// 数据库版本
export const DB_VERSION = 1;

// 建表语句
export const CREATE_TABLES = `
-- 念头记录表
CREATE TABLE IF NOT EXISTS thoughts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  intensity INTEGER DEFAULT 3,
  type TEXT,
  created_at INTEGER NOT NULL
);

-- 每日一问回答表
CREATE TABLE IF NOT EXISTS daily_answers (
  id TEXT PRIMARY KEY,
  day_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at INTEGER NOT NULL
);

-- 心安状态记录表
CREATE TABLE IF NOT EXISTS mood_records (
  id TEXT PRIMARY KEY,
  mood TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_thoughts_created ON thoughts(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_created ON mood_records(created_at);
`;

// Supabase decisions 表结构（用于参考）
export const DECISIONS_TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  options TEXT[], -- PostgreSQL array
  urgency TEXT NOT NULL CHECK (urgency IN ('urgent', 'week', 'month')),
  model_id TEXT NOT NULL,
  conversation JSONB NOT NULL DEFAULT '[]',
  conclusion TEXT,
  recommendation TEXT,
  final_decision TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  review_at TIMESTAMPTZ,
  review_rating INTEGER CHECK (review_rating BETWEEN 1 AND 5),
  review_notes TEXT
);

-- 创建索引
CREATE INDEX idx_decisions_user ON decisions(user_id);
CREATE INDEX idx_decisions_created ON decisions(created_at);
CREATE INDEX idx_decisions_review ON decisions(review_at) WHERE review_at IS NOT NULL;
`;

// 念头类型
export const THOUGHT_TYPES = [
  { id: 'knowledge_anxiety', label: '知识焦虑', color: '#D4A574' },
  { id: 'material', label: '物质欲望', color: '#B87070' },
  { id: 'relationship', label: '关系渴望', color: '#7D9B76' },
  { id: 'achievement', label: '成就驱动', color: '#8B7355' },
  { id: 'escape', label: '逃避行为', color: '#666666' },
  { id: 'other', label: '其他', color: '#A0A0A0' },
] as const;

// 心安状态
export const MOODS = [
  { id: 'anxious', label: '不安', emoji: '😔', color: '#B87070' },
  { id: 'calm', label: '平静', emoji: '😌', color: '#7D9B76' },
  { id: 'joy', label: '喜悦', emoji: '😊', color: '#D4A574' },
  { id: 'confused', label: '迷茫', emoji: '😶', color: '#8B7355' },
] as const;

// TypeScript 类型
export type ThoughtType = typeof THOUGHT_TYPES[number]['id'];
export type Mood = typeof MOODS[number]['id'];

export interface Thought {
  id: string;
  content: string;
  intensity: number;
  type?: ThoughtType;
  createdAt: number;
}

export interface DailyAnswer {
  id: string;
  dayNumber: number;
  question: string;
  answer: string;
  createdAt: number;
}

// 决策记录类型
export interface Decision {
  id: string;
  title: string;
  context: string;
  options?: string[];
  urgency: 'urgent' | 'week' | 'month';
  modelId: string;
  conversation: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  conclusion?: string;
  recommendation?: string;
  finalDecision?: string;
  createdAt: number;
  completedAt?: number;
  reviewAt?: number;
  reviewRating?: number;
  reviewNotes?: string;
}

// 决策状态
export type DecisionStatus = 'ongoing' | 'completed' | 'reviewed';
