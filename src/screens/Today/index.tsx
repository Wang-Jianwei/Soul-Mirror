import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { MOODS, THOUGHT_TYPES } from '@/constants/database';
import { getTodayQuestion } from '@/constants/questions';
import { useMoodStore, useStatsStore, useDailyAnswerStore, usePatternStore } from '@/store';
import { MoodChart } from '@/components/MoodChart';

export function TodayScreen() {
  const navigation = useNavigation();
  const [todayQuestion, setTodayQuestion] = useState(getTodayQuestion());
  
  const { todayMood, recordMood, loadTodayMood, recentMoods, loadRecentMoods } = useMoodStore();
  const { totalThoughts, streakDays, loadStats } = useStatsStore();
  const { todayAnswer, loadTodayAnswer } = useDailyAnswerStore();
  const { weeklyPattern, loadWeeklyPattern } = usePatternStore();
  
  useEffect(() => {
    loadStats();
    loadTodayMood();
    loadTodayAnswer(todayQuestion.day);
    loadWeeklyPattern();
    loadRecentMoods();
  }, []);
  
  // 当页面获得焦点时刷新数据
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
      loadTodayAnswer(todayQuestion.day);
      loadWeeklyPattern();
      loadRecentMoods();
    });
    return unsubscribe;
  }, [navigation, todayQuestion.day]);
  
  const handleMoodSelect = async (moodId: string) => {
    await recordMood(moodId as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 心安状态选择 */}
        <Text style={styles.title}>此刻，你的心安吗？</Text>
        
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                todayMood === mood.id && { borderColor: mood.color, borderWidth: 2 }
              ]}
              onPress={() => handleMoodSelect(mood.id)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 分隔线 */}
        <View style={styles.divider} />
        
        {/* 每日一问 */}
        <Card style={styles.questionCard}>
          <Card.Content style={styles.questionCardContent}>
            <Text style={styles.questionDay}>Day {todayQuestion.day}</Text>
            <Text style={styles.questionText} numberOfLines={2}>{todayQuestion.question}</Text>
            
            {todayAnswer ? (
              <View style={styles.answerPreview}>
                <Text style={styles.answerLabel}>今日回答：</Text>
                <Text style={styles.answerText} numberOfLines={2}>{todayAnswer.answer}</Text>
              </View>
            ) : null}
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DailyAnswer' as never)}
              style={styles.answerButton}
              buttonColor={todayAnswer ? colors.success : colors.primary}
              textColor={colors.background}
              compact
            >
              {todayAnswer ? '修改回答' : '记录回答'}
            </Button>
          </Card.Content>
        </Card>
        
        {/* 分隔线 */}
        <View style={styles.divider} />
        
        {/* 本周模式 */}
        {weeklyPattern?.topType ? (
          <Card style={styles.patternCard}>
            <Card.Content style={styles.patternCardContent}>
              <View style={styles.patternHeader}>
                <Text style={styles.patternTitle}>本周模式</Text>
                {weeklyPattern.trend !== 'stable' && (
                  <View style={styles.trendBadge}>
                    <MaterialCommunityIcons 
                      name={weeklyPattern.trend === 'up' ? 'trending-up' : 'trending-down'} 
                      size={14} 
                      color={weeklyPattern.trend === 'up' ? colors.error : colors.success} 
                    />
                    <Text style={[
                      styles.trendText,
                      { color: weeklyPattern.trend === 'up' ? colors.error : colors.success }
                    ]}>
                      {weeklyPattern.trend === 'up' ? '增加' : '减少'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.patternContent}>
                <Text style={styles.patternType}>
                  「{THOUGHT_TYPES.find(t => t.id === weeklyPattern.topType)?.label}」
                </Text>
                <Text style={styles.patternDesc}>
                  本周出现最多（{weeklyPattern.topTypeCount}次）
                  {weeklyPattern.lastWeekTopCount > 0 && weeklyPattern.lastWeekTopType === weeklyPattern.topType &&
                    `，已连续两周`
                  }
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.patternDetailButton}
                onPress={() => navigation.navigate('ThoughtHistory' as never)}
              >
                <Text style={styles.patternDetailText}>查看详情</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.patternCardEmpty}>
            <Card.Content style={styles.patternCardContent}>
              <Text style={styles.patternTitle}>本周模式</Text>
              <Text style={styles.patternEmptyText}>
                还没有记录念头，开始记录后就能看到你的模式了
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Thoughts' as never)}
                style={styles.patternEmptyButton}
                textColor={colors.primary}
                compact
              >
                记录第一个念头
              </Button>
            </Card.Content>
          </Card>
        )}
        
        {/* 情绪趋势图 */}
        <MoodChart moodData={recentMoods} />
        
        {/* 分隔线 */}
        <View style={styles.divider} />
        
        {/* 本周觉察 */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>本周觉察</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ThoughtHistory' as never)}>
              <Text style={styles.viewAll}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalThoughts}</Text>
              <Text style={styles.statLabel}>念头记录</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streakDays}</Text>
              <Text style={styles.statLabel}>连续记录(天)</Text>
            </View>
          </View>
        </View>
        
        {/* 底部按钮 */}
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Thoughts' as never)}
          style={styles.quickRecordButton}
          textColor={colors.primary}
          compact
        >
          记录念头
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '48%',
    flex: 1,
    minHeight: 80,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginHorizontal: '1%',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
    marginVertical: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  questionCardContent: {
    padding: spacing.md,
  },
  questionDay: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  questionText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 22,
    fontSize: 15,
  },
  answerPreview: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  answerLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  answerText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  answerButton: {
    borderRadius: 8,
  },
  statsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  viewAll: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 32,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 12,
  },
  quickRecordButton: {
    borderColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  // 本周模式样式
  patternCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  patternCardEmpty: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  patternCardContent: {
    padding: spacing.md,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  patternTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    ...typography.caption,
    fontSize: 12,
    marginLeft: 4,
  },
  patternContent: {
    marginBottom: spacing.sm,
  },
  patternType: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  patternDesc: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  patternDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  patternDetailText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 14,
  },
  patternEmptyText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  patternEmptyButton: {
    borderColor: colors.primary,
    borderRadius: 8,
  },
});
