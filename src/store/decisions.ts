import { create } from 'zustand';
import { Decision, DecisionStatus } from '@/constants/database';
import { supabase } from '@/lib/supabase';
import { 
  chat, 
  startDecisionChat, 
  continueDecisionChat, 
  Message,
  DecisionContext,
  RouterConfig 
} from '@/lib/ai';

// ==================== 决策状态 ====================

interface DecisionsState {
  // 数据
  ongoingDecisions: Decision[];
  completedDecisions: Decision[];
  currentDecision: Decision | null;
  currentMessages: Message[];
  
  // UI状态
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  currentCost: number; // 当前对话累计成本
  
  // 方法
  loadDecisions: () => Promise<void>;
  createDecision: (context: DecisionContext, config?: Partial<RouterConfig>) => Promise<void>;
  sendMessage: (content: string, config?: Partial<RouterConfig>) => Promise<void>;
  completeDecision: (finalDecision?: string) => Promise<void>;
  saveReview: (decisionId: string, rating: number, notes: string) => Promise<void>;
  deleteDecision: (decisionId: string) => Promise<void>;
  setCurrentDecision: (decision: Decision | null) => void;
  clearError: () => void;
}

// 解析AI响应，提取决策卡片内容
function parseDecisionCard(content: string): { conclusion?: string; recommendation?: string } {
  const result: { conclusion?: string; recommendation?: string } = {};
  
  // 尝试提取本心发现
  const conclusionMatch = content.match(/\*\*本心发现\*\*[:：]\s*\n?([^\n]+(?:\n(?![\*\-]).+)*)?/i);
  if (conclusionMatch) {
    result.conclusion = conclusionMatch[1]?.trim();
  }
  
  // 尝试提取决策建议
  const recommendationMatch = content.match(/\*\*决策建议\*\*[:：]\s*\n?([^\n]+(?:\n(?![\*\-]).+)*)?/i);
  if (recommendationMatch) {
    result.recommendation = recommendationMatch[1]?.trim();
  }
  
  return result;
}

export const useDecisionsStore = create<DecisionsState>((set, get) => ({
  ongoingDecisions: [],
  completedDecisions: [],
  currentDecision: null,
  currentMessages: [],
  isLoading: false,
  isCreating: false,
  error: null,
  currentCost: 0,

  loadDecisions: async () => {
    set({ isLoading: true, error: null });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false, error: '未登录' });
      return;
    }

    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load decisions error:', error);
      set({ isLoading: false, error: '加载决策记录失败' });
      return;
    }

    const decisions: Decision[] = (data || []).map(d => ({
      id: d.id,
      title: d.title,
      context: d.context,
      options: d.options,
      urgency: d.urgency,
      modelId: d.model_id,
      conversation: d.conversation || [],
      conclusion: d.conclusion,
      recommendation: d.recommendation,
      finalDecision: d.final_decision,
      createdAt: new Date(d.created_at).getTime(),
      completedAt: d.completed_at ? new Date(d.completed_at).getTime() : undefined,
      reviewAt: d.review_at ? new Date(d.review_at).getTime() : undefined,
      reviewRating: d.review_rating,
      reviewNotes: d.review_notes,
    }));

    const ongoing = decisions.filter(d => !d.completedAt);
    const completed = decisions.filter(d => d.completedAt);

    set({ 
      ongoingDecisions: ongoing, 
      completedDecisions: completed,
      isLoading: false 
    });
  },

  createDecision: async (context, config = {}) => {
    set({ isCreating: true, error: null, currentCost: 0 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isCreating: false, error: '未登录' });
      return;
    }

    try {
      // 调用AI开始对话
      const response = await startDecisionChat(context, config);
      
      // 构建决策记录
      const decisionId = `dec-${Date.now()}`;
      const conversation: Message[] = [
        { role: 'system', content: '决策助手' },
        { role: 'user', content: context.title },
        { role: 'assistant', content: response.content },
      ];

      const newDecision: Decision = {
        id: decisionId,
        title: context.title,
        context: context.context,
        options: context.options,
        urgency: context.urgency,
        modelId: response.modelUsed,
        conversation,
        createdAt: Date.now(),
      };

      // 保存到数据库
      const { error } = await supabase.from('decisions').insert({
        id: decisionId,
        user_id: user.id,
        title: context.title,
        context: context.context,
        options: context.options,
        urgency: context.urgency,
        model_id: response.modelUsed,
        conversation,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      set({
        currentDecision: newDecision,
        currentMessages: conversation,
        ongoingDecisions: [newDecision, ...get().ongoingDecisions],
        isCreating: false,
        currentCost: response.cost,
      });
    } catch (error) {
      console.error('Create decision error:', error);
      set({ isCreating: false, error: '创建决策失败，请重试' });
    }
  },

  sendMessage: async (content, config = {}) => {
    const { currentDecision, currentMessages, currentCost } = get();
    
    if (!currentDecision) {
      set({ error: '没有进行中的决策' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 继续对话
      const response = await continueDecisionChat(currentMessages, content, config);
      
      // 更新对话记录
      const updatedMessages: Message[] = [
        ...currentMessages,
        { role: 'user', content },
        { role: 'assistant', content: response.content },
      ];

      // 检查是否生成决策卡片（第10轮或包含特定标记）
      const isCompleted = updatedMessages.filter(m => m.role === 'assistant').length >= 10 ||
                          response.content.includes('**本心发现**');

      let conclusion: string | undefined;
      let recommendation: string | undefined;

      if (isCompleted) {
        const parsed = parseDecisionCard(response.content);
        conclusion = parsed.conclusion;
        recommendation = parsed.recommendation;
      }

      const updatedDecision: Decision = {
        ...currentDecision,
        conversation: updatedMessages,
        conclusion,
        recommendation,
        completedAt: isCompleted ? Date.now() : undefined,
        reviewAt: isCompleted ? Date.now() + 90 * 24 * 60 * 60 * 1000 : undefined, // 3个月后
      };

      // 更新数据库
      const { error } = await supabase
        .from('decisions')
        .update({
          conversation: updatedMessages,
          conclusion,
          recommendation,
          completed_at: isCompleted ? new Date().toISOString() : null,
          review_at: isCompleted ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : null,
        })
        .eq('id', currentDecision.id);

      if (error) {
        throw error;
      }

      // 如果完成，更新列表
      if (isCompleted) {
        set({
          ongoingDecisions: get().ongoingDecisions.filter(d => d.id !== currentDecision.id),
          completedDecisions: [updatedDecision, ...get().completedDecisions],
        });
      }

      set({
        currentDecision: updatedDecision,
        currentMessages: updatedMessages,
        isLoading: false,
        currentCost: currentCost + response.cost,
      });
    } catch (error) {
      console.error('Send message error:', error);
      set({ isLoading: false, error: '发送消息失败，请重试' });
    }
  },

  completeDecision: async (finalDecision) => {
    const { currentDecision } = get();
    if (!currentDecision) return;

    const updatedDecision: Decision = {
      ...currentDecision,
      finalDecision,
      completedAt: Date.now(),
      reviewAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 3个月后
    };

    const { error } = await supabase
      .from('decisions')
      .update({
        final_decision: finalDecision,
        completed_at: new Date().toISOString(),
        review_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', currentDecision.id);

    if (error) {
      console.error('Complete decision error:', error);
      set({ error: '保存失败' });
      return;
    }

    set({
      ongoingDecisions: get().ongoingDecisions.filter(d => d.id !== currentDecision.id),
      completedDecisions: [updatedDecision, ...get().completedDecisions],
      currentDecision: updatedDecision,
    });
  },

  saveReview: async (decisionId, rating, notes) => {
    const { error } = await supabase
      .from('decisions')
      .update({
        review_rating: rating,
        review_notes: notes,
      })
      .eq('id', decisionId);

    if (error) {
      console.error('Save review error:', error);
      set({ error: '保存回顾失败' });
      return;
    }

    // 更新本地状态
    set({
      completedDecisions: get().completedDecisions.map(d =>
        d.id === decisionId
          ? { ...d, reviewRating: rating, reviewNotes: notes }
          : d
      ),
    });
  },

  deleteDecision: async (decisionId) => {
    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', decisionId);

    if (error) {
      console.error('Delete decision error:', error);
      set({ error: '删除失败' });
      return;
    }

    set({
      ongoingDecisions: get().ongoingDecisions.filter(d => d.id !== decisionId),
      completedDecisions: get().completedDecisions.filter(d => d.id !== decisionId),
      currentDecision: get().currentDecision?.id === decisionId ? null : get().currentDecision,
    });
  },

  setCurrentDecision: (decision) => {
    set({ 
      currentDecision: decision,
      currentMessages: decision?.conversation || [],
      currentCost: 0,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
