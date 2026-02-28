// AI模型路由

import { Message, ChatResponse, AIModelConfig, getModelConfig, getDefaultModel } from './types';

// 检查模型是否可用
export async function isModelAvailable(modelId: string): Promise<boolean> {
  const model = getModelConfig(modelId);
  if (!model) return false;
  
  // 本地模型始终可用
  if (model.provider === 'local') return true;
  
  // 检查网络
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch('https://www.baidu.com', { 
      method: 'HEAD',
      signal: controller.signal 
    });
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

// 选择最佳模型
export async function selectModel(
  preferredModelId?: string,
  allowFallback: boolean = true
): Promise<AIModelConfig | null> {
  // 1. 检查用户偏好
  if (preferredModelId) {
    const preferred = getModelConfig(preferredModelId);
    if (preferred && await isModelAvailable(preferred.id)) {
      return preferred;
    }
  }
  
  // 2. 检查网络状态
  const isOnline = await isModelAvailable('minimax-2.5');
  if (!isOnline) {
    return getModelConfig('local-llama') || null;
  }
  
  // 3. 返回默认模型
  return getDefaultModel();
}

// 失败降级链
const FALLBACK_CHAIN = [
  'minimax-2.5',
  'qwen-2.5',
  'wenxin-4',
  'local-llama',
];

// 获取下一个降级模型
export function getFallbackModel(currentModelId: string): AIModelConfig | null {
  const currentIndex = FALLBACK_CHAIN.indexOf(currentModelId);
  if (currentIndex === -1 || currentIndex >= FALLBACK_CHAIN.length - 1) {
    return null;
  }
  
  const nextModelId = FALLBACK_CHAIN[currentIndex + 1];
  return getModelConfig(nextModelId) || null;
}

// 路由配置接口
export interface RouterConfig {
  preferredModel?: string;
  allowFallback: boolean;
  maxRetries: number;
  timeoutMs: number;
}

// 默认路由配置
export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  allowFallback: true,
  maxRetries: 2,
  timeoutMs: 10000,
};
