import { create } from 'zustand';
import { Thought, DailyAnswer, MoodRecord, ThoughtType, Mood } from '../constants/database';

// ==================== 念头记录状态 ====================

interface ThoughtsState {
  thoughts: Thought[];
  isLoading: boolean;
  addThought: (thought: Omit<Thought, 'id'>) => Promise<void>;
  loadThoughts: () => Promise<void>;
  deleteThought: (id: string) => Promise<void>;
}

export const useThoughtsStore = create<ThoughtsState>((set, get) => ({
  thoughts: [],
  isLoading: false,
  
  addThought: async (thought) => {
    // 实际实现需要调用 database.ts
    const newThought: Thought = {
      ...thought,
      id: Date.now().toString(),
    };
    set({ thoughts: [newThought, ...get().thoughts] });
  },
  
  loadThoughts: async () => {
    set({ isLoading: true });
    // 实际实现需要从数据库加载
    set({ isLoading: false });
  },
  
  deleteThought: async (id) => {
    set({ thoughts: get().thoughts.filter(t => t.id !== id) });
  },
}));

// ==================== 每日回答状态 ====================

interface DailyAnswerState {
  todayAnswer: DailyAnswer | null;
  recentAnswers: DailyAnswer[];
  isLoading: boolean;
  saveAnswer: (answer: Omit<DailyAnswer, 'id'>) => Promise<void>;
  loadTodayAnswer: (dayNumber: number) => Promise<void>;
  loadRecentAnswers: () => Promise<void>;
}

export const useDailyAnswerStore = create<DailyAnswerState>((set, get) => ({
  todayAnswer: null,
  recentAnswers: [],
  isLoading: false,
  
  saveAnswer: async (answer) => {
    const newAnswer: DailyAnswer = {
      ...answer,
      id: Date.now().toString(),
    };
    set({ todayAnswer: newAnswer });
  },
  
  loadTodayAnswer: async (dayNumber) => {
    // 从数据库加载
  },
  
  loadRecentAnswers: async () => {
    set({ isLoading: true });
    // 从数据库加载
    set({ isLoading: false });
  },
}));

// ==================== 心安状态 ====================

interface MoodState {
  todayMood: Mood | null;
  recordMood: (mood: Mood) => Promise<void>;
  loadTodayMood: () => Promise<void>;
}

export const useMoodStore = create<MoodState>((set) => ({
  todayMood: null,
  
  recordMood: async (mood) => {
    set({ todayMood: mood });
  },
  
  loadTodayMood: async () => {
    // 从数据库加载
  },
}));

// ==================== 统计状态 ====================

interface StatsState {
  totalThoughts: number;
  totalAnswers: number;
  streakDays: number;
  loadStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  totalThoughts: 0,
  totalAnswers: 0,
  streakDays: 0,
  
  loadStats: async () => {
    // 从数据库加载统计
  },
}));
