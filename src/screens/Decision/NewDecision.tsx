import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { AI_MODELS, getDefaultModel } from '@/lib/ai';
import { useDecisionsStore } from '@/store';

// 紧急度选项
const URGENCY_OPTIONS = [
  { id: 'urgent', label: '很急', desc: '需要尽快决定' },
  { id: 'week', label: '一周内', desc: '有一些时间思考' },
  { id: 'month', label: '还有时间', desc: '可以慢慢考虑' },
] as const;

export function NewDecisionScreen() {
  const navigation = useNavigation();
  const { createDecision, isCreating, error, clearError } = useDecisionsStore();

  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [urgency, setUrgency] = useState<'urgent' | 'week' | 'month'>('week');
  const [modelId, setModelId] = useState(getDefaultModel().id);

  const handleAddOption = () => {
    if (options.length < 3) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleStart = async () => {
    if (!title.trim() || !context.trim()) return;

    clearError();

    const validOptions = options.filter(o => o.trim());
    
    await createDecision(
      {
        title: title.trim(),
        context: context.trim(),
        options: validOptions.length > 0 ? validOptions : undefined,
        urgency,
      },
      { preferredModel: modelId }
    );

    // 创建成功后跳转到对话页面
    if (!error) {
      navigation.navigate('DecisionConversation' as never);
    }
  };

  const isValid = title.trim() && context.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新的决策</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 决策标题 */}
        <View style={styles.section}>
          <Text style={styles.label}>写下你的两难</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="例如：要不要接受这个offer？"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
          <Text style={styles.charCount}>{title.length}/50</Text>
        </View>

        {/* 具体情况 */}
        <View style={styles.section}>
          <Text style={styles.label}>具体情况</Text>
          <TextInput
            style={styles.contextInput}
            placeholder="描述一下你的处境、顾虑、纠结的点..."
            placeholderTextColor={colors.textMuted}
            value={context}
            onChangeText={setContext}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.charCount}>{context.length}/200</Text>
        </View>

        {/* 选项 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>选项（可选）</Text>
            <Text style={styles.labelHint}>最多3个</Text>
          </View>
          
          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <TextInput
                style={styles.optionInput}
                placeholder={`选项${String.fromCharCode(65 + index)}`}
                placeholderTextColor={colors.textMuted}
                value={option}
                onChangeText={(value) => handleOptionChange(index, value)}
                maxLength={30}
              />
              {options.length > 2 && (
                <TouchableOpacity 
                  onPress={() => handleRemoveOption(index)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          {options.length < 3 && (
            <TouchableOpacity onPress={handleAddOption} style={styles.addOptionButton}>
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addOptionText}>添加选项</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 时间压力 */}
        <View style={styles.section}>
          <Text style={styles.label}>时间压力</Text>
          <View style={styles.urgencyContainer}>
            {URGENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.urgencyOption,
                  urgency === option.id && styles.urgencyOptionActive,
                ]}
                onPress={() => setUrgency(option.id)}
              >
                <RadioButton
                  value={option.id}
                  status={urgency === option.id ? 'checked' : 'unchecked'}
                  onPress={() => setUrgency(option.id)}
                  color={colors.primary}
                />
                <View style={styles.urgencyTextContainer}>
                  <Text style={[
                    styles.urgencyLabel,
                    urgency === option.id && styles.urgencyLabelActive,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.urgencyDesc}>{option.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI模型选择 */}
        <View style={styles.section}>
          <Text style={styles.label}>AI模型</Text>
          <View style={styles.modelContainer}>
            {AI_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  modelId === model.id && styles.modelOptionActive,
                ]}
                onPress={() => setModelId(model.id)}
              >
                <RadioButton
                  value={model.id}
                  status={modelId === model.id ? 'checked' : 'unchecked'}
                  onPress={() => setModelId(model.id)}
                  color={colors.primary}
                />
                <View style={styles.modelTextContainer}>
                  <Text style={[
                    styles.modelName,
                    modelId === model.id && styles.modelNameActive,
                  ]}>
                    {model.name}
                  </Text>
                  <Text style={styles.modelCost}>
                    {model.costPer1K.input === 0 ? '免费' : `¥${model.costPer1K.input}/千token`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 错误提示 */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 开始按钮 */}
        <Button
          mode="contained"
          onPress={handleStart}
          disabled={!isValid || isCreating}
          loading={isCreating}
          style={styles.startButton}
          buttonColor={colors.primary}
          textColor={colors.background}
        >
          {isCreating ? '创建中...' : '开始对话'}
        </Button>

        <Text style={styles.hintText}>
          AI将通过苏格拉底式提问帮你剥离情绪、看清本心\n对话最多10轮，最后生成决策卡片
        </Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
  },
  contextInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    height: 100,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
  },
  removeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addOptionText: {
    ...typography.body,
    color: colors.primary,
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  urgencyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  urgencyOptionActive: {
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  urgencyTextContainer: {
    marginLeft: spacing.xs,
  },
  urgencyLabel: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  urgencyLabelActive: {
    color: colors.primary,
  },
  urgencyDesc: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  modelContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  modelOptionActive: {
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  modelTextContainer: {
    marginLeft: spacing.xs,
  },
  modelName: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  modelNameActive: {
    color: colors.primary,
  },
  modelCost: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  startButton: {
    borderRadius: 8,
    marginTop: spacing.md,
  },
  hintText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
