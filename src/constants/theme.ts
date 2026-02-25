// 心镜主题配置
// 深色优先，温暖静谧

export const colors = {
  // 主色调
  primary: '#E8D5B7',      // 米白/温暖
  secondary: '#8B7355',    // 棕色/沉稳
  
  // 背景
  background: '#1A1A1A',   // 深黑
  surface: '#2A2A2A',      // 次黑
  card: '#3A3A3A',         // 卡片
  
  // 文字
  text: '#F5F5F5',         // 主文字
  textSecondary: '#A0A0A0', // 次文字
  textMuted: '#666666',    // 辅助文字
  
  // 状态
  success: '#7D9B76',      // 平静/正向
  warning: '#D4A574',      // 不安/注意
  error: '#B87070',        // 焦虑/负面
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
};

export const theme = {
  colors,
  spacing,
  typography,
};
