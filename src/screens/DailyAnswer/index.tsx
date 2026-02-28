import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { getTodayQuestion, getQuestionByDay } from '@/constants/questions';
import { useDailyAnswerStore, useStatsStore } from '@/store';

export function DailyAnswerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dayNumber } = route.params as { dayNumber?: number } || {};
  
  const [question, setQuestion] = useState(() => {
    if (dayNumber) {
      return getQuestionByDay(dayNumber);
    }
    return getTodayQuestion();
  });
  
  const [answer, setAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { todayAnswer, saveAnswer, loadTodayAnswer } = useDailyAnswerStore();
  const { loadStats } = useStatsStore();
  
  useEffect(() => {
    if (question) {
      loadTodayAnswer(question.day);
    }
  }, [question]);
  
  useEffect(() => {
    if (todayAnswer && todayAnswer.dayNumber === question?.day) {
      setAnswer(todayAnswer.answer);
    }
  }, [todayAnswer, question]);
  
  const handleSave = async () => {
    if (!question || !answer.trim()) return;
    
    setIsSaving(true);
    await saveAnswer({
      dayNumber: question.day,
      question: question.question,
      answer: answer.trim(),
    });
    
    // 刷新统计数据
    await loadStats();
    
    setIsSaving(false);
    navigation.goBack();
  };
  
  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>问题未找到</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main' as never)} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>每日一问</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.dayLabel}>Day {question.day}</Text>
        <Text style={styles.question}>{question.question}</Text>
        
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={8}
          placeholder="写下你的回答..."
          placeholderTextColor={colors.textMuted}
          value={answer}
          onChangeText={setAnswer}
          maxLength={1000}
          textAlignVertical="top"
        />
        
        <Text style={styles.charCount}>{answer.length} / 1000</Text>
        
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={!answer.trim() || isSaving}
          style={styles.saveButton}
          buttonColor={colors.primary}
          textColor={colors.background}
        >
          保存回答
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    backgroundColor: colors.background,
    minHeight: 56,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  question: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
    lineHeight: 32,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    color: colors.text,
    fontSize: typography.body.fontSize,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  saveButton: {
    borderRadius: 8,
  },
});
