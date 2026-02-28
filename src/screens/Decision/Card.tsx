import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { useDecisionsStore } from '@/store';

export function DecisionCardScreen() {
  const navigation = useNavigation();
  const { currentDecision } = useDecisionsStore();

  if (!currentDecision) {
    navigation.navigate('DecisionList' as never);
    return null;
  }

  const handleShare = async () => {
    const shareContent = `
决策卡片 - 心镜

困境：${currentDecision.title}

本心发现：
${currentDecision.conclusion || '暂无'}

决策建议：
${currentDecision.recommendation || '暂无'}

创建于：${new Date(currentDecision.createdAt).toLocaleDateString()}
    `.trim();

    await Share.share({ message: shareContent, title: '决策卡片' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isReviewDue = currentDecision.reviewAt && currentDecision.reviewAt <= Date.now();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('DecisionList' as never)} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>决策卡片</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            {/* 卡片头部 */}
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="card-text-outline" size={32} color={colors.primary} />
              <Text style={styles.cardDate}>{formatDate(currentDecision.createdAt)}</Text>
            </View>

            <View style={styles.divider} />

            {/* 困境 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>困境</Text>
              <Text style={styles.sectionTitle}>{currentDecision.title}</Text>
              <Text style={styles.sectionContext}>{currentDecision.context}</Text>
            </View>

            <View style={styles.divider} />

            {/* 本心发现 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>本心发现</Text>
              <View style={styles.highlightBox}>
                <MaterialCommunityIcons name="heart" size={20} color={colors.primary} style={styles.highlightIcon} />
                <Text style={styles.highlightText}>
                  {currentDecision.conclusion || '对话中未明确本心发现'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 决策建议 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>决策建议</Text>
              <View style={styles.suggestionBox}>
                <MaterialCommunityIcons name="compass" size={20} color={colors.success} style={styles.suggestionIcon} />
                <Text style={styles.suggestionText}>
                  {currentDecision.recommendation || '对话中未生成具体建议'}
                </Text>
              </View>
            </View>

            {/* 最终决策（如果有） */}
            {currentDecision.finalDecision && (
              <>
                <View style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>你的决定</Text>
                  <View style={styles.finalDecisionBox}>
                    <Text style={styles.finalDecisionText}>{currentDecision.finalDecision}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />

            {/* 回顾提醒 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>3个月回顾</Text>
              {currentDecision.reviewRating ? (
                <View style={styles.reviewCompletedBox}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.reviewCompletedText}>已完成回顾</Text>
                </View>
              ) : (
                <View style={styles.reviewPendingBox}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={isReviewDue ? colors.warning : colors.textMuted} />
                  <Text style={[styles.reviewPendingText, isReviewDue ? styles.reviewDueText : undefined]}>
                    {isReviewDue ? '回顾时间已到' : `提醒时间：${formatDate(currentDecision.reviewAt || Date.now())}`}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* 操作按钮 */}
        <View style={styles.actions}>
          {!currentDecision.reviewRating && isReviewDue && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DecisionReview' as never)}
              style={styles.actionButton}
              buttonColor={colors.primary}
              textColor={colors.background}
            >
              写回顾
            </Button>
          )}
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('DecisionList' as never)}
            style={styles.actionButton}
            textColor={colors.primary}
          >
            返回列表
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h3, color: colors.text, fontSize: 18 },
  shareButton: { padding: spacing.xs },
  scrollView: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardDate: { ...typography.caption, color: colors.textMuted, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.background, marginVertical: spacing.md },
  section: { marginVertical: spacing.sm },
  sectionLabel: { ...typography.caption, color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.text, fontSize: 18, marginBottom: spacing.xs },
  sectionContext: { ...typography.body, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  highlightBox: { flexDirection: 'row', backgroundColor: colors.primary + '15', borderRadius: 8, padding: spacing.md },
  highlightIcon: { marginRight: spacing.sm },
  highlightText: { ...typography.body, color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 },
  suggestionBox: { flexDirection: 'row', backgroundColor: colors.success + '15', borderRadius: 8, padding: spacing.md },
  suggestionIcon: { marginRight: spacing.sm },
  suggestionText: { ...typography.body, color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 },
  finalDecisionBox: { backgroundColor: colors.background, borderRadius: 8, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  finalDecisionText: { ...typography.body, color: colors.text, fontSize: 15, lineHeight: 22 },
  reviewCompletedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '15', borderRadius: 8, padding: spacing.md },
  reviewCompletedText: { ...typography.body, color: colors.success, fontSize: 14, marginLeft: spacing.sm },
  reviewPendingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md },
  reviewPendingText: { ...typography.body, color: colors.textSecondary, fontSize: 14, marginLeft: spacing.sm },
  reviewDueText: { color: colors.warning },
  actions: { marginTop: spacing.lg },
  actionButton: { marginBottom: spacing.sm, borderRadius: 8 },
});
