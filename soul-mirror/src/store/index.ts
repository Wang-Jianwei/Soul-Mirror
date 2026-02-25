import { create } from 'zustand';
import { Thought, DailyAnswer, MoodRecord, ThoughtType, Mood } from '../constants/database';
import * as db from '../utils/database';

// ==================== 念头记录状态 ====================

interface ThoughtsState {
  thoughts: Thought[];
  isLoading: boolean;
  isInitialized: boolean;
  init: () => Promise<void>;
  addThought: (thought: Omit<Thought, 'id'>) => Promise<void>;
  loadThoughts: () => Promise<void>;
  deleteThought: (id: string) => Promise<void>;
}

export const useThoughtsStore = create<ThoughtsState>((set, get) => ({
  thoughts: [],
  isLoading: false,
  isInitialized: false,
  
  init: async () => {
    if (get().isInitialized) return;
    await db.initDatabase();
    await get().loadThoughts();
    set({ isInitialized: true });
  },
  
  addThought: async (thought) => {
    const newThought = await db.createThought(thought);
    set({ thoughts: [newThought, ...get().thoughts] });
  },
  
  loadThoughts: async () => {
    set({ isLoading: true });
    const thoughts = await db.getThoughts(50);
    set({ thoughts, isLoading: false });
  },
  
  deleteThought: async (id) => {
    await db.deleteThought(id);
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
    const newAnswer = await db.saveDailyAnswer(answer);
    set({ todayAnswer: newAnswer });
    await get().loadRecentAnswers();
  },
  
  loadTodayAnswer: async (dayNumber) => {
    const answer = await db.getDailyAnswer(dayNumber);
    set({ todayAnswer: answer });
  },
  
  loadRecentAnswers: async () => {
    set({ isLoading: true });
    const answers = await db.getRecentAnswers(7);
    set({ recentAnswers: answers, isLoading: false });
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
    await db.recordMood({
      mood,
      createdAt: Date.now(),
    });
    set({ todayMood: mood });
  },
  
  loadTodayMood: async () => {
    const record = await db.getTodayMood();
    if (record) {
      set({ todayMood: record.mood });
    }
  },
}));

// ==================== 统计状态 ====================

interface StatsState {
  totalThoughts: number;
  totalAnswers: number;
  streakDays: number;
  isLoading: boolean;
  loadStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  totalThoughts: 0,
  totalAnswers: 0,
  streakDays: 0,
  isLoading: false,
  
  loadStats: async () => {
    set({ isLoading: true });
    const stats = await db.getStats();
    set({ ...stats, isLoading: false });
  },
}));
