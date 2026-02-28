import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { useDecisionsStore } from '@/store';

const RATING_OPTIONS = [
  { value: 5, label: '非常正确', icon: 'emoticon-excited-outline', color: '#7D9B76' },
  { value: 4, label: '基本正确', icon: 'emoticon-happy-outline', color: '#9DC183' },
  { value: 3, label: '不确定', icon: 'emoticon-neutral-outline', color: '#D4A574' },
  { value: 2, label: '有点后悔', icon: 'emoticon-sad-outline', color: '#C4956A' },
  { value: 1, label: '非常后悔', icon: 'emoticon-cry-outline', color: '#B87070' },
];

export function DecisionReviewScreen() {
  const navigation = useNavigation();
  const { currentDecision, saveReview } = useDecisionsStore();
  
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentDecision) {
    navigation.navigate('DecisionList' as never);
    return null;
  }

  const handleSave = async () => {
    if (!rating) return;
    
    setIsSaving(true);
    await saveReview(currentDecision.id, rating, notes.trim());
    setIsSaving(false);
    navigation.navigate('DecisionCard' as never);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3个月回顾</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* 决策信息 */}
        <View style={styles.decisionInfo}>
          <Text style={styles.decisionTitle} numberOfLines={2}>{currentDecision.title}</Text>
          <Text style={styles.decisionDate}>决策于 {formatDate(currentDecision.createdAt)}</Text>
        </View>

        {/* 本心发现回顾 */}
        {currentDecision.conclusion && (
          <View style={styles.conclusionBox}>
            <Text style={styles.conclusionLabel}>当时的本心发现</Text>
            <Text style={styles.conclusionText}>{currentDecision.conclusion}</Text>
          </View>
        )}

        {/* 评分 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>回头看，这个决定：</Text>
          <View style={styles.ratingContainer}>
            {RATING_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.ratingOption, rating === option.value && styles.ratingOptionActive]}
                onPress={() => setRating(option.value)}
              >
                <MaterialCommunityIcons 
                  name={option.icon as any} 
                  size={32} 
                  color={rating === option.value ? option.color : colors.textMuted} 
                />
                <Text style={[
                  styles.ratingLabel,
                  rating === option.value && { color: option.color }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 回顾笔记 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>实际发生了什么？有什么新发现？</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="记录你的反思..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{notes.length}/500</Text>
        </View>

        {/* 保存按钮 */}
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!rating || isSaving}
          loading={isSaving}
          style={styles.saveButton}
          buttonColor={colors.primary}
          textColor={colors.background}
        >
          {isSaving ? '保存中...' : '保存回顾'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h3, color: colors.text, fontSize: 18 },
  placeholder: { width: 40 },
  content: { flex: 1, padding: spacing.md },
  decisionInfo: { marginBottom: spacing.lg },
  decisionTitle: { ...typography.h2, color: colors.text, fontSize: 20, marginBottom: spacing.xs },
  decisionDate: { ...typography.caption, color: colors.textMuted, fontSize: 13 },
  conclusionBox: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.lg },
  conclusionLabel: { ...typography.caption, color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs },
  conclusionText: { ...typography.body, color: colors.text, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.body, color: colors.text, fontSize: 16, marginBottom: spacing.md },
  ratingContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingOption: { alignItems: 'center', padding: spacing.sm },
  ratingOptionActive: { backgroundColor: colors.surface, borderRadius: 8 },
  ratingLabel: { ...typography.caption, color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  notesInput: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, color: colors.text, height: 120, ...typography.body },
  charCount: { ...typography.caption, color: colors.textMuted, fontSize: 12, textAlign: 'right', marginTop: spacing.xs },
  saveButton: { borderRadius: 8, marginTop: spacing.md },
});
