// AI服务主入口

import { Message, ChatResponse, DecisionContext, AIModelConfig, estimateCost } from './types';
import { getSystemPrompt } from './prompts';
import { selectModel, getFallbackModel, RouterConfig, DEFAULT_ROUTER_CONFIG } from './router';

// 模拟AI响应（用于开发和测试）
async function mockAIResponse(
  messages: Message[],
  model: AIModelConfig
): Promise<ChatResponse> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content || '';
  
  // 简单的模拟响应
  let response = '';
  if (content.includes('恐惧') || content.includes('害怕')) {
    response = '这个决定里，有多少是恐惧，有多少是真实的情况？如果完全不用担心后果，你会怎么选？';
  } else if (content.includes('想要') || content.includes('需要')) {
    response = '你真正想要的是什么？这个选择能满足你什么深层的需求？';
  } else {
    response = '让我们再深入一点。抛开所有的"应该"和"必须"，你的本心在说什么？';
  }
  
  return {
    content: response,
    usage: {
      inputTokens: content.length * 2,
      outputTokens: response.length * 2,
    },
    model: model.id,
  };
}

// 调用MiniMax API
async function callMiniMax(
  messages: Message[],
  model: AIModelConfig
): Promise<ChatResponse> {
  const apiKey = (process as any).env?.EXPO_PUBLIC_MINIMAX_API_KEY;
  if (!apiKey) {
    console.warn('MiniMax API key not found, using mock response');
    return mockAIResponse(messages, model);
  }

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: model.maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
      model: model.id,
    };
  } catch (error) {
    console.error('MiniMax API call failed:', error);
    // 降级到模拟响应
    return mockAIResponse(messages, model);
  }
}

// 调用文心一言 API
async function callWenxin(
  messages: Message[],
  model: AIModelConfig
): Promise<ChatResponse> {
  // TODO: 实现真实的文心API调用
  return mockAIResponse(messages, model);
}

// 调用通义千问 API
async function callQwen(
  messages: Message[],
  model: AIModelConfig
): Promise<ChatResponse> {
  // TODO: 实现真实的通义API调用
  return mockAIResponse(messages, model);
}

// 调用本地模型
async function callLocalModel(
  messages: Message[],
  model: AIModelConfig
): Promise<ChatResponse> {
  // TODO: 实现本地模型调用（llama.cpp等）
  // 使用简化Prompt
  return mockAIResponse(messages, model);
}

// 根据provider调用对应API
async function callProviderAPI(
  messages: Message[],
  model: AIModelConfig
): Promise<ChatResponse> {
  switch (model.provider) {
    case 'minimax':
      return callMiniMax(messages, model);
    case 'baidu':
      return callWenxin(messages, model);
    case 'alibaba':
      return callQwen(messages, model);
    case 'local':
      return callLocalModel(messages, model);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

// 主聊天函数
export async function chat(
  messages: Message[],
  config: Partial<RouterConfig> = {}
): Promise<ChatResponse & { cost: number; modelUsed: string }> {
  const finalConfig = { ...DEFAULT_ROUTER_CONFIG, ...config };
  
  // 选择模型
  let model = await selectModel(finalConfig.preferredModel, finalConfig.allowFallback);
  if (!model) {
    throw new Error('No available AI model');
  }
  
  let lastError: Error | null = null;
  let retries = 0;
  
  while (retries <= finalConfig.maxRetries) {
    try {
      // 调用API
      const response = await Promise.race([
        callProviderAPI(messages, model),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), finalConfig.timeoutMs)
        ),
      ]);
      
      // 计算成本
      const cost = estimateCost(
        response.usage?.inputTokens || 0,
        response.usage?.outputTokens || 0,
        model.id
      );
      
      return {
        ...response,
        cost,
        modelUsed: model.id,
      };
    } catch (error) {
      lastError = error as Error;
      
      // 尝试降级
      if (finalConfig.allowFallback) {
        const fallbackModel = getFallbackModel(model.id);
        if (fallbackModel) {
          model = fallbackModel;
          retries++;
          continue;
        }
      }
      
      break;
    }
  }
  
  throw lastError || new Error('AI request failed');
}

// 开始决策对话
export async function startDecisionChat(
  context: DecisionContext,
  config: Partial<RouterConfig> = {}
): Promise<ChatResponse & { cost: number; modelUsed: string }> {
  const systemPrompt = getSystemPrompt(false);
  
  // 构建初始消息
  const userPrompt = `我面临一个决策：${context.title}

具体情况：${context.context}
${context.options ? `选项：${context.options.join(' / ')}` : ''}
时间压力：${context.urgency === 'urgent' ? '很急' : context.urgency === 'week' ? '一周内' : '还有时间'}

请帮我理清思路。`;

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  return chat(messages, config);
}

// 继续决策对话
export async function continueDecisionChat(
  history: Message[],
  userReply: string,
  config: Partial<RouterConfig> = {}
): Promise<ChatResponse & { cost: number; modelUsed: string }> {
  const messages: Message[] = [
    ...history,
    { role: 'user', content: userReply },
  ];
  
  return chat(messages, config);
}

// 导出所有类型和工具
export * from './types';
export * from './prompts';
export * from './router';
