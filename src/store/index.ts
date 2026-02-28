import { create } from 'zustand';
import { Thought, DailyAnswer, ThoughtType, Mood, THOUGHT_TYPES } from '../constants/database';
import { supabase } from '@/lib/supabase';

// ==================== 内存缓存 ====================
// 用于减少重复请求，提升界面响应速度

interface CacheState {
  thoughts: Thought[] | null;
  answers: DailyAnswer[] | null;
  mood: Mood | null;
  lastFetch: {
    thoughts: number;
    answers: number;
    mood: number;
  };
}

const cache: CacheState = {
  thoughts: null,
  answers: null,
  mood: null,
  lastFetch: {
    thoughts: 0,
    answers: 0,
    mood: 0,
  },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

function isCacheValid(key: 'thoughts' | 'answers' | 'mood'): boolean {
  const lastFetch = cache.lastFetch[key];
  return Date.now() - lastFetch < CACHE_DURATION && cache[key] !== null;
}

function updateCache(key: 'thoughts' | 'answers' | 'mood', data: any) {
  cache[key] = data;
  cache.lastFetch[key] = Date.now();
}

function clearCache() {
  cache.thoughts = null;
  cache.answers = null;
  cache.mood = null;
  cache.lastFetch = { thoughts: 0, answers: 0, mood: 0 };
}

// ==================== 念头记录状态 ====================

interface ThoughtsState {
  thoughts: Thought[];
  isLoading: boolean;
  isInitialized: boolean;
  init: () => void;
  addThought: (thought: Omit<Thought, 'id' | 'createdAt'>) => Promise<void>;
  loadThoughts: (forceRefresh?: boolean) => Promise<void>;
  deleteThought: (id: string) => Promise<void>;
}

export const useThoughtsStore = create<ThoughtsState>((set, get) => ({
  thoughts: [],
  isLoading: false,
  isInitialized: false,

  init: () => {
    if (get().isInitialized) return;
    get().loadThoughts();
    set({ isInitialized: true });
  },

  addThought: async (thought) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 乐观更新：先更新本地状态
    const tempThought: Thought = {
      id: 'temp-' + Date.now(),
      content: thought.content,
      type: thought.type,
      intensity: thought.intensity || 3,
      createdAt: Date.now(),
    };
    set({ thoughts: [tempThought, ...get().thoughts] });

    // 然后发送到服务器
    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        user_id: user.id,
        content: thought.content,
        type: thought.type,
      })
      .select()
      .single();

    if (error) {
      console.error('Add thought error:', error);
      // 回滚
      get().loadThoughts(true);
      return;
    }

    if (data) {
      const newThought: Thought = {
        id: data.id,
        content: data.content,
        type: data.type as ThoughtType,
        intensity: data.intensity || 3,
        createdAt: new Date(data.created_at).getTime(),
      };
      // 替换临时数据
      set({ thoughts: [newThought, ...get().thoughts.filter(t => t.id !== tempThought.id)] });
      updateCache('thoughts', [newThought, ...get().thoughts]);
    }
  },

  loadThoughts: async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh && isCacheValid('thoughts')) {
      set({ thoughts: cache.thoughts! });
      return;
    }

    set({ isLoading: true });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load thoughts error:', error);
      set({ isLoading: false });
      return;
    }

    const thoughts: Thought[] = (data || []).map(t => ({
      id: t.id,
      content: t.content,
      type: t.type as ThoughtType,
      intensity: t.intensity || 3,
      createdAt: new Date(t.created_at).getTime(),
    }));

    updateCache('thoughts', thoughts);
    set({ thoughts, isLoading: false });
  },

  deleteThought: async (id) => {
    // 乐观更新
    const previousThoughts = get().thoughts;
    set({ thoughts: get().thoughts.filter(t => t.id !== id) });

    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete thought error:', error);
      // 回滚
      set({ thoughts: previousThoughts });
      return;
    }

    updateCache('thoughts', get().thoughts);
  },
}));

// ==================== 每日回答状态 ====================

interface DailyAnswerState {
  todayAnswer: DailyAnswer | null;
  recentAnswers: DailyAnswer[];
  isLoading: boolean;
  saveAnswer: (answer: Omit<DailyAnswer, 'id' | 'createdAt'>) => Promise<void>;
  loadTodayAnswer: (dayNumber: number) => Promise<void>;
  loadRecentAnswers: (forceRefresh?: boolean) => Promise<void>;
}

export const useDailyAnswerStore = create<DailyAnswerState>((set, get) => ({
  todayAnswer: null,
  recentAnswers: [],
  isLoading: false,

  saveAnswer: async (answer) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 乐观更新
    const tempAnswer: DailyAnswer = {
      id: 'temp-' + Date.now(),
      dayNumber: answer.dayNumber,
      question: answer.question,
      answer: answer.answer,
      createdAt: Date.now(),
    };
    set({ todayAnswer: tempAnswer });

    // 先删除同一天的旧答案
    await supabase
      .from('answers')
      .delete()
      .eq('user_id', user.id)
      .eq('day_number', answer.dayNumber);

    // 插入新答案
    const { data, error } = await supabase
      .from('answers')
      .insert({
        user_id: user.id,
        day_number: answer.dayNumber,
        question: answer.question,
        answer: answer.answer,
      })
      .select()
      .single();

    if (error) {
      console.error('Save answer error:', error);
      get().loadTodayAnswer(answer.dayNumber);
      return;
    }

    if (data) {
      const newAnswer: DailyAnswer = {
        id: data.id,
        dayNumber: data.day_number,
        question: data.question,
        answer: data.answer,
        createdAt: new Date(data.created_at).getTime(),
      };
      set({ todayAnswer: newAnswer });
      updateCache('answers', [newAnswer, ...(cache.answers || [])]);
    }
  },

  loadTodayAnswer: async (dayNumber) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_number', dayNumber)
      .limit(1);

    if (error) {
      console.error('Load answer error:', error);
      set({ todayAnswer: null });
      return;
    }

    if (!data || data.length === 0) {
      set({ todayAnswer: null });
      return;
    }

    set({
      todayAnswer: {
        id: data[0].id,
        dayNumber: data[0].day_number,
        question: data[0].question,
        answer: data[0].answer,
        createdAt: new Date(data[0].created_at).getTime(),
      },
    });
  },

  loadRecentAnswers: async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('answers')) {
      set({ recentAnswers: cache.answers! });
      return;
    }

    set({ isLoading: true });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Load answers error:', error);
      set({ isLoading: false });
      return;
    }

    const answers: DailyAnswer[] = (data || []).map(a => ({
      id: a.id,
      dayNumber: a.day_number,
      question: a.question,
      answer: a.answer,
      createdAt: new Date(a.created_at).getTime(),
    }));

    updateCache('answers', answers);
    set({ recentAnswers: answers, isLoading: false });
  },
}));

// ==================== 心安状态 ====================

interface MoodState {
  todayMood: Mood | null;
  recentMoods: { date: string; mood: Mood }[];
  recordMood: (mood: Mood) => Promise<void>;
  loadTodayMood: () => Promise<void>;
  loadRecentMoods: () => Promise<void>;
}

export const useMoodStore = create<MoodState>((set) => ({
  todayMood: null,
  recentMoods: [],

  recordMood: async (mood) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ todayMood: mood });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await supabase
      .from('moods')
      .delete()
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    const { error } = await supabase
      .from('moods')
      .insert({
        user_id: user.id,
        mood: mood,
      });

    if (error) {
      console.error('Record mood error:', error);
      set({ todayMood: null });
      return;
    }

    updateCache('mood', mood);
  },

  loadTodayMood: async () => {
    if (isCacheValid('mood')) {
      set({ todayMood: cache.mood });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Load mood error:', error);
      set({ todayMood: null });
      return;
    }

    if (!data || data.length === 0) {
      set({ todayMood: null });
      return;
    }

    const mood = data[0].mood as Mood;
    updateCache('mood', mood);
    set({ todayMood: mood });
  },

  loadRecentMoods: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Load recent moods error:', error);
      return;
    }

    const moods = (data || []).map(m => ({
      date: m.created_at,
      mood: m.mood as Mood,
    }));

    set({ recentMoods: moods });
  },
}));

// ==================== 本周模式统计 ====================

export interface WeeklyPattern {
  topType: ThoughtType | null;
  topTypeCount: number;
  totalCount: number;
  typeDistribution: Record<ThoughtType, number>;
  trend: 'up' | 'down' | 'stable';
  lastWeekTopType: ThoughtType | null;
  lastWeekTopCount: number;
}

interface PatternState {
  weeklyPattern: WeeklyPattern | null;
  isLoading: boolean;
  loadWeeklyPattern: () => Promise<void>;
}

function getWeekRange(offsetWeeks: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

function calculatePattern(thoughts: Thought[]): WeeklyPattern {
  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(-1);
  
  // 本周念头
  const thisWeekThoughts = thoughts.filter(t => {
    const date = new Date(t.createdAt);
    return date >= thisWeek.start && date <= thisWeek.end;
  });
  
  // 上周念头
  const lastWeekThoughts = thoughts.filter(t => {
    const date = new Date(t.createdAt);
    return date >= lastWeek.start && date <= lastWeek.end;
  });
  
  // 统计类型分布
  const typeDistribution: Record<ThoughtType, number> = {
    knowledge_anxiety: 0,
    material: 0,
    relationship: 0,
    achievement: 0,
    escape: 0,
    other: 0,
  };
  
  thisWeekThoughts.forEach(t => {
    if (t.type) {
      typeDistribution[t.type]++;
    }
  });
  
  // 找出最频繁类型
  let topType: ThoughtType | null = null;
  let topTypeCount = 0;
  
  (Object.keys(typeDistribution) as ThoughtType[]).forEach(type => {
    if (typeDistribution[type] > topTypeCount) {
      topTypeCount = typeDistribution[type];
      topType = type;
    }
  });
  
  // 上周最频繁类型
  const lastWeekDistribution: Record<ThoughtType, number> = {
    knowledge_anxiety: 0,
    material: 0,
    relationship: 0,
    achievement: 0,
    escape: 0,
    other: 0,
  };
  
  lastWeekThoughts.forEach(t => {
    if (t.type) {
      lastWeekDistribution[t.type]++;
    }
  });
  
  let lastWeekTopType: ThoughtType | null = null;
  let lastWeekTopCount = 0;
  
  (Object.keys(lastWeekDistribution) as ThoughtType[]).forEach(type => {
    if (lastWeekDistribution[type] > lastWeekTopCount) {
      lastWeekTopCount = lastWeekDistribution[type];
      lastWeekTopType = type;
    }
  });
  
  // 计算趋势
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (lastWeekTopCount === 0) {
    trend = topTypeCount > 0 ? 'up' : 'stable';
  } else if (topTypeCount > lastWeekTopCount * 1.2) {
    trend = 'up';
  } else if (topTypeCount < lastWeekTopCount * 0.8) {
    trend = 'down';
  }
  
  return {
    topType,
    topTypeCount,
    totalCount: thisWeekThoughts.length,
    typeDistribution,
    trend,
    lastWeekTopType,
    lastWeekTopCount,
  };
}

export const usePatternStore = create<PatternState>((set) => ({
  weeklyPattern: null,
  isLoading: false,

  loadWeeklyPattern: async () => {
    set({ isLoading: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    // 获取近两周的念头（用于对比）
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', twoWeeksAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load pattern error:', error);
      set({ isLoading: false });
      return;
    }

    const thoughts: Thought[] = (data || []).map(t => ({
      id: t.id,
      content: t.content,
      type: t.type as ThoughtType,
      intensity: t.intensity || 3,
      createdAt: new Date(t.created_at).getTime(),
    }));

    const pattern = calculatePattern(thoughts);
    set({ weeklyPattern: pattern, isLoading: false });
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    // 获取念头数量
    const { count: thoughtsCount } = await supabase
      .from('thoughts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 获取回答数量
    const { count: answersCount } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    set({
      totalThoughts: thoughtsCount || 0,
      totalAnswers: answersCount || 0,
      streakDays: 0,
      isLoading: false,
    });
  },
}));

// ==================== 导出数据功能 ====================

export async function exportAllData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: thoughts }, { data: answers }, { data: moods }] = await Promise.all([
    supabase.from('thoughts').select('*').eq('user_id', user.id),
    supabase.from('answers').select('*').eq('user_id', user.id),
    supabase.from('moods').select('*').eq('user_id', user.id),
  ]);

  return {
    thoughts: thoughts || [],
    answers: answers || [],
    moods: moods || [],
    exportDate: new Date().toISOString(),
  };
}

export async function clearAllData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await Promise.all([
    supabase.from('thoughts').delete().eq('user_id', user.id),
    supabase.from('answers').delete().eq('user_id', user.id),
    supabase.from('moods').delete().eq('user_id', user.id),
  ]);

  // 清空缓存
  clearCache();
}

export * from './decisions';