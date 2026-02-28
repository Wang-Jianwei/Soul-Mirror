import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { Mood, MOODS } from '@/constants/database';

interface MoodChartProps {
  moodData: { date: string; mood: Mood }[];
}

// 心情数值映射（用于图表高度）
const MOOD_VALUES: Record<Mood, number> = {
  anxious: 1,  // 不安
  confused: 2, // 迷茫
  calm: 3,     // 平静
  joy: 4,      // 喜悦
};

// 获取心情颜色
function getMoodColor(mood: Mood): string {
  const moodConfig = MOODS.find(m => m.id === mood);
  return moodConfig?.color || colors.textMuted;
}

// 获取心情标签
function getMoodLabel(mood: Mood): string {
  const moodConfig = MOODS.find(m => m.id === mood);
  return moodConfig?.label || '';
}

// 格式化日期（显示几号）
function formatDay(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 获取星期几
function getWeekDay(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return days[date.getDay()];
}

export function MoodChart({ moodData }: MoodChartProps) {
  // 只显示最近7天
  const recentData = moodData.slice(0, 7).reverse();
  
  // 如果没有数据，显示空状态
  if (recentData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>近7天心情</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>还没有记录心情</Text>
        </View>
      </View>
    );
  }

  const maxValue = 4; // 最大心情值
  const chartHeight = 120;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>近7天心情</Text>
      
      <View style={styles.chartContainer}>
        {/* Y轴标签 */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>喜</Text>
          <Text style={styles.yLabel}>平</Text>
          <Text style={styles.yLabel}>迷</Text>
          <Text style={styles.yLabel}>安</Text>
        </View>

        {/* 图表区域 */}
        <View style={styles.chartArea}>
          {/* 网格线 */}
          <View style={styles.gridLines}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.gridLine, { bottom: (i / 3) * chartHeight }]} />
            ))}
          </View>

          {/* 数据点和连线 */}
          <View style={styles.dataContainer}>
            {recentData.map((item, index) => {
              const value = MOOD_VALUES[item.mood];
              const x = (index / (recentData.length - 1 || 1)) * 100;
              const y = ((maxValue - value) / (maxValue - 1)) * chartHeight;

              return (
                <View key={item.date} style={[styles.dataPoint, { left: `${x}%`, bottom: y }]}>
                  {/* 数据点 */}
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: getMoodColor(item.mood) },
                    ]}
                  />
                  
                  {/* 连线到下一个点 */}
                  {index < recentData.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        {
                          width: `${100 / (recentData.length - 1)}%`,
                          backgroundColor: colors.surface,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* X轴标签 */}
          <View style={styles.xAxis}>
            {recentData.map((item, index) => (
              <View key={item.date} style={styles.xLabelContainer}>
                <Text style={styles.xLabelDay}>{getWeekDay(item.date)}</Text>
                <Text style={styles.xLabelDate}>{formatDay(item.date)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 图例 */}
      <View style={styles.legend}>
        {MOODS.map(mood => (
          <View key={mood.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: mood.color }]} />
            <Text style={styles.legendText}>{mood.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  emptyState: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 160,
  },
  yAxis: {
    width: 20,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  yLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    height: 160,
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  dataContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.background,
  },
  line: {
    position: 'absolute',
    height: 2,
    left: '50%',
    top: '50%',
    marginTop: -1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  xLabelContainer: {
    alignItems: 'center',
  },
  xLabelDay: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  xLabelDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
