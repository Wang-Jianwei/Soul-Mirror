// AI服务类型定义

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DecisionContext {
  title: string;
  context: string;
  options?: string[];
  urgency: 'urgent' | 'week' | 'month';
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'minimax' | 'baidu' | 'alibaba' | 'local';
  modelId: string;
  maxTokens: number;
  costPer1K: { input: number; output: number }; // RMB
}

export interface ChatResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

// 模型配置
export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'minimax-2.5',
    name: 'MiniMax 2.5',
    provider: 'minimax',
    modelId: 'abab6.5s-chat',
    maxTokens: 4000,
    costPer1K: { input: 0.015, output: 0.06 },
  },
  {
    id: 'wenxin-4',
    name: '文心一言 4.0',
    provider: 'baidu',
    modelId: 'ERNIE-Bot-4',
    maxTokens: 4000,
    costPer1K: { input: 0.12, output: 0.12 },
  },
  {
    id: 'qwen-2.5',
    name: '通义千问 2.5',
    provider: 'alibaba',
    modelId: 'qwen-max-0403',
    maxTokens: 4000,
    costPer1K: { input: 0.02, output: 0.02 },
  },
  {
    id: 'local-llama',
    name: '本地模型',
    provider: 'local',
    modelId: 'llama-3-8b',
    maxTokens: 2000,
    costPer1K: { input: 0, output: 0 },
  },
];

// 获取模型配置
export function getModelConfig(modelId: string): AIModelConfig | undefined {
  return AI_MODELS.find(m => m.id === modelId);
}

// 获取默认模型
export function getDefaultModel(): AIModelConfig {
  return AI_MODELS[0]; // MiniMax 2.5
}

// 计算预估成本（人民币）
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): number {
  const model = getModelConfig(modelId);
  if (!model) return 0;
  
  const inputCost = (inputTokens / 1000) * model.costPer1K.input;
  const outputCost = (outputTokens / 1000) * model.costPer1K.output;
  return Math.round((inputCost + outputCost) * 1000) / 1000;
}
