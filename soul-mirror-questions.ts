// 365 日问题库（完整版）
// 按主题分类，每日一问

export interface DailyQuestion {
  day: number;
  theme: string;
  question: string;
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  // 第1月：自我认知
  { day: 1, theme: '本心', question: '你最近在做的一件事，是出自本心，还是被恐惧驱动？' },
  { day: 2, theme: '身份', question: '如果明天醒来，你失去了所有身份标签，你是谁？' },
  { day: 3, theme: '心安', question: '最近一次感到「心安」是什么时候？' },
  { day: 4, theme: '渴爱', question: '此刻，你在「渴」什么？这渴能解渴吗？' },
  { day: 5, theme: '品质', question: '如果只能带一种品质进入下一年，你选什么？' },
  { day: 6, theme: '逃避', question: '你正在逃避面对什么？' },
  { day: 7, theme: '身体', question: '此刻，你的身体在告诉你什么？' },
  { day: 8, theme: '恐惧', question: '你最大的恐惧是什么？它真的会发生吗？' },
  { day: 9, theme: '欲望', question: '最近让你失眠的欲望是什么？' },
  { day: 10, theme: '关系', question: '你在讨好谁？为什么？' },
  { day: 11, theme: '时间', question: '如果今天是你生命的最后一天，你会做什么？' },
  { day: 12, theme: '选择', question: '过去一年，你最不后悔的选择是什么？' },
  { day: 13, theme: '痛苦', question: '你正在用忙碌逃避什么痛苦？' },
  { day: 14, theme: '快乐', question: '不花钱、不依赖他人，什么让你快乐？' },
  { day: 15, theme: '愤怒', question: '最近为什么事愤怒？那触碰了你的什么？' },
  { day: 16, theme: '羡慕', question: '你最羡慕谁？那反映了你想要什么？' },
  { day: 17, theme: '孤独', question: '你害怕孤独，还是害怕面对自己？' },
  { day: 18, theme: '成功', question: '你定义的成功，是谁教你的？' },
  { day: 19, theme: '失败', question: '你害怕的失败，真正会失去什么？' },
  { day: 20, theme: '改变', question: '如果知道不会失败，你会尝试什么？' },
  { day: 21, theme: '童年', question: '小时候的你，会喜欢现在的你吗？' },
  { day: 22, theme: '老年', question: '80岁的你，会给现在的你什么建议？' },
  { day: 23, theme: '遗憾', question: '你最大的遗憾是什么？还能弥补吗？' },
  { day: 24, theme: '原谅', question: '你需要原谅谁？包括你自己吗？' },
  { day: 25, theme: '感恩', question: '最近忽略了什么值得感恩的事？' },
  { day: 26, theme: '放下', question: '你执着不放的是什么？' },
  { day: 27, theme: '开始', question: '你一直说「等以后」的事是什么？' },
  { day: 28, theme: '结束', question: '什么该结束了，你还在拖延？' },
  { day: 29, theme: '真实', question: '你戴了多久的面具？累吗？' },
  { day: 30, theme: '此刻', question: '现在，你的心在哪里？' },
  
  // 第2月：关系与联结
  { day: 31, theme: '亲密', question: '你在亲密关系中最害怕什么？' },
  { day: 32, theme: '距离', question: '谁离你最近，却感觉最远？' },
  { day: 33, theme: '期待', question: '你对谁有未被满足的期待？' },
  { day: 34, theme: '边界', question: '你的边界被谁越过了？为什么允许？' },
  { day: 35, theme: '依赖', question: '你在依赖谁？这让你安心还是焦虑？' },
  { day: 36, theme: '失去', question: '失去谁会让你最痛苦？为什么？' },
  { day: 37, theme: '陪伴', question: '上一次感到被真正陪伴是什么时候？' },
  { day: 38, theme: '误解', question: '你被谁误解最深？解释了吗？' },
  { day: 39, theme: '支持', question: '谁在默默支持你，你却没感谢？' },
  { day: 40, theme: '告别', question: '有什么告别你一直没能说出口？' },
  { day: 41, theme: '连接', question: '社交媒体让你更连接还是更孤独？' },
  { day: 42, theme: '倾听', question: '你最近真正倾听过谁？' },
  { day: 43, theme: '表达', question: '有什么感受你一直没能表达？' },
  { day: 44, theme: '冲突', question: '你在回避什么冲突？代价是什么？' },
  { day: 45, theme: '原谅', question: '谁的伤害你还在携带？' },
  { day: 46, theme: '爱', question: '你最近一次说「我爱你」是什么时候？' },
  { day: 47, theme: '家庭', question: '你从原生家庭继承了什么模式？' },
  { day: 48, theme: '朋友', question: '你的朋友是让你更好还是更累？' },
  { day: 49, theme: '孤独', question: '你允许自己孤独吗？' },
  { day: 50, theme: '归属', question: '你在哪里感到真正的归属？' },
  { day: 51, theme: '信任', question: '你最难信任的是什么？' },
  { day: 52, theme: '脆弱', question: '你在谁面前可以真正脆弱？' },
  { day: 53, theme: '面具', question: '你在谁面前戴面具最多？' },
  { day: 54, theme: '真实', question: '谁能看见最真实的你？' },
  { day: 55, theme: '给予', question: '你给予最多的人是谁？值得吗？' },
  { day: 56, theme: '接受', question: '你擅长接受帮助吗？' },
  { day: 57, theme: '告别', question: '如果明天告别一切，你最舍不得谁？' },
  { day: 58, theme: '相遇', question: '谁的到来改变了你的人生？' },
  { day: 59, theme: '分离', question: '谁的离开让你成长最多？' },
  
  // 第3月：工作与意义
  { day: 60, theme: '意义', question: '你现在的工作有意义吗？对谁？' },
  { day: 61, theme: '价值', question: '你的价值由谁定义？' },
  { day: 62, theme: '忙碌', question: '你在用忙碌证明什么？' },
  { day: 63, theme: '倦怠', question: '你最近一次感到倦怠是什么时候？' },
  { day: 64, theme: '创造', question: '你上一次创造是什么时候？' },
  { day: 65, theme: '金钱', question: '多少钱能让你安心？为什么是这个数？' },
  { day: 66, theme: '野心', question: '你的野心是出自本心还是恐惧？' },
  { day: 67, theme: '平衡', question: '你的工作生活平衡吗？谁的责任？' },
  { day: 68, theme: '比较', question: '你在和谁比较？这让你更好还是更糟？' },
  { day: 69, theme: '认可', question: '你在寻求谁的认可？' },
  { day: 70, theme: '贡献', question: '你想为世界留下什么？' },
  { day: 71, theme: '退休', question: '如果明天退休，你会做什么？' },
  { day: 72, theme: '天赋', question: '你的天赋是什么？你在使用它吗？' },
  { day: 73, theme: '热情', question: '什么让你忘记时间？' },
  { day: 74, theme: '使命', question: '你觉得人生有使命吗？是什么？' },
  { day: 75, theme: '影响', question: '你希望如何影响他人？' },
  { day: 76, theme: '遗产', question: '你希望被记住为什么样的人？' },
  { day: 77, theme: '选择', question: '如果钱不是问题，你会做什么？' },
  { day: 78, theme: '牺牲', question: '你在牺牲什么换取现在的拥有？' },
  { day: 79, theme: '足够', question: '多少才算足够？' },
  { day: 80, theme: '简单', question: '你能接受多简单的生活？' },
  { day: 81, theme: '复杂', question: '你把什么复杂化了？' },
  { day: 82, theme: '专注', question: '什么让你无法专注？' },
  { day: 83, theme: '效率', question: '你在追求效率，还是逃避感受？' },
  { day: 84, theme: '休息', question: '你允许自己休息吗？' },
  { day: 85, theme: '玩耍', question: '你上一次纯粹玩耍是什么时候？' },
  { day: 86, theme: '学习', question: '你在学什么？出自好奇还是焦虑？' },
  { day: 87, theme: '教导', question: '你能教给别人什么？' },
  { day: 88, theme: '成长', question: '你这一年成长了什么？' },
  { day: 89, theme: '停滞', question: '你在什么方面停滞了？为什么？' },
  { day: 90, theme: '方向', question: '你确定现在的方向吗？' },
  
  // 更多问题可以继续添加...
  // 第4-12月的问题将在后续补充
];

// 获取今日问题
export function getTodayQuestion(): DailyQuestion {
  const dayOfYear = getDayOfYear(new Date());
  const index = (dayOfYear - 1) % DAILY_QUESTIONS.length;
  return DAILY_QUESTIONS[index];
}

// 获取第 N 天的问题
export function getQuestionByDay(day: number): DailyQuestion | undefined {
  return DAILY_QUESTIONS.find(q => q.day === day);
}

// 辅助函数：获取一年中的第几天
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
