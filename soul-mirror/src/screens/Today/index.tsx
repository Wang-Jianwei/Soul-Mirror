import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography } from '../constants/theme';
import { MOODS } from '../constants/database';
import { getTodayQuestion } from '../constants/questions';
import { useMoodStore, useStatsStore } from '../store';

export function TodayScreen() {
  const navigation = useNavigation();
  const [todayQuestion, setTodayQuestion] = useState(getTodayQuestion());
  
  const { todayMood, recordMood, loadTodayMood } = useMoodStore();
  const { totalThoughts, streakDays, loadStats } = useStatsStore();
  
  useEffect(() => {
    loadStats();
    loadTodayMood();
  }, []);
  
  const handleMoodSelect = async (moodId: string) => {
    await recordMood(moodId as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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
          <Card.Content>
            <Text style={styles.questionDay}>Day {todayQuestion.day}</Text>
            <Text style={styles.questionText}>{todayQuestion.question}</Text>
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DailyAnswer' as never)}
              style={styles.answerButton}
              buttonColor={colors.primary}
              textColor={colors.background}
            >
              记录回答
            </Button>
          </Card.Content>
        </Card>
        
        {/* 分隔线 */}
        <View style={styles.divider} />
        
        {/* 本周觉察 */}
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
        
        {/* 快速记录按钮 */}
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Thoughts' as never)}
          style={styles.quickRecordButton}
          textColor={colors.primary}
        >
          记录念头
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  moodLabel: {
    ...typography.body,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
    marginVertical: spacing.xl,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  questionDay: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  questionText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 26,
  },
  answerButton: {
    borderRadius: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAll: {
    ...typography.caption,
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickRecordButton: {
    borderColor: colors.primary,
    borderRadius: 8,
  },
});
