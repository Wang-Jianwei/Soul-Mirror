import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from 'react-native-paper';

import { colors, spacing, typography } from '@/constants/theme';
import { THOUGHT_TYPES, ThoughtType } from '@/constants/database';
import { useThoughtsStore } from '@/store';

export function ThoughtsScreen() {
  const [content, setContent] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [selectedType, setSelectedType] = useState<ThoughtType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const { thoughts, addThought } = useThoughtsStore();
  
  const handleRecord = async () => {
    if (!content.trim()) return;
    
    setIsRecording(true);
    
    await addThought({
      content: content.trim(),
      intensity,
      type: selectedType || undefined,
    });
    
    // 重置表单
    setContent('');
    setIntensity(3);
    setSelectedType(null);
    setIsRecording(false);
  };
  
  const renderIntensityDots = () => {
    return (
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>强度：低</Text>
        <View style={styles.dotsContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setIntensity(level)}
              style={[
                styles.dot,
                level <= intensity && { backgroundColor: colors.primary }
              ]}
            />
          ))}
        </View>
        <Text style={styles.intensityLabel}>高</Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>觉察</Text>
        
        {/* 记录表单 */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.label}>此刻，你在渴什么？</Text>
            
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="写下你此刻的念头..."
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              maxLength={500}
            />
            <Text style={styles.charCount}>{content.length} / 500</Text>
            
            {/* 强度选择 */}
            {renderIntensityDots()}
            
            {/* 类型选择 */}
            <Text style={styles.label}>类型：</Text>
            <View style={styles.typesContainer}>
              {THOUGHT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && { 
                      backgroundColor: type.color + '30',
                      borderColor: type.color,
                    }
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text style={[
                    styles.typeText,
                    selectedType === type.id && { color: type.color }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* 确认按钮 */}
            <Button
              mode="contained"
              onPress={handleRecord}
              loading={isRecording}
              disabled={!content.trim() || isRecording}
              style={styles.recordButton}
              buttonColor={colors.primary}
              textColor={colors.background}
            >
              确认记录
            </Button>
          </Card.Content>
        </Card>
        
        {/* 最近记录 */}
        {thoughts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>最近记录</Text>
            {thoughts.slice(0, 5).map((thought) => (
              <Card key={thought.id} style={styles.thoughtCard}>
                <Card.Content>
                  <Text style={styles.thoughtContent}>{thought.content}</Text>
                  <View style={styles.thoughtMeta}>
                    <Text style={styles.thoughtType}>
                      {THOUGHT_TYPES.find(t => t.id === thought.type)?.label || '其他'}
                    </Text>
                    <Text style={styles.thoughtIntensity}>
                      {'●'.repeat(thought.intensity)}{'○'.repeat(5 - thought.intensity)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
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
    marginBottom: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.body.fontSize,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  intensityLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.card,
  },
  typeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  recordButton: {
    borderRadius: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  thoughtCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  thoughtContent: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  thoughtMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thoughtType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  thoughtIntensity: {
    ...typography.caption,
    color: colors.primary,
  },
});
