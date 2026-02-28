import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // 方法
  init: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<void>;
}

// 检测是否在 Web 环境
const isWeb = Platform.OS === 'web';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  init: async () => {
    if (get().isInitialized) return;
    
    try {
      // 等待更长时间确保 Supabase 客户端完全初始化
      if (isWeb) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 检查本地 session - Supabase 会自动从 localStorage 恢复
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase getSession error:', error);
        set({ isInitialized: true });
        return;
      }
      
      if (session?.user) {
        console.log('Session restored:', session.user.email);
        set({
          user: {
            id: session.user.id,
            email: session.user.email!,
          },
          isInitialized: true,
        });
      } else {
        console.log('No session found');
        set({ isInitialized: true });
      }

      // 监听 auth 状态变化
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
            },
          });
        } else {
          set({ user: null });
        }
      });
    } catch (error) {
      console.error('Auth init error:', error);
      set({ isInitialized: true });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    set({ isLoading: false });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
      });
    }

    return {};
  },

  signIn: async (email: string, password: string, rememberMe: boolean = false) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ isLoading: false });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
      });
      
      // 如果记住我，设置长期 session
      if (rememberMe && data.session) {
        // 保存登录信息到 localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('soul-mirror-remember', 'true');
        }
      }
    }

    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
        },
      });
    }
  },
}));
