import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { useDecisionsStore } from '@/store';
import { Decision } from '@/constants/database';

// 决策列表页面
export function DecisionListScreen() {
  const navigation = useNavigation();
  const { 
    ongoingDecisions, 
    completedDecisions, 
    loadDecisions, 
    setCurrentDecision,
    isLoading 
  } = useDecisionsStore();

  useEffect(() => {
    loadDecisions();
  }, []);

  // 刷新数据当页面获得焦点
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDecisions();
    });
    return unsubscribe;
  }, [navigation]);

  const handleContinueDecision = (decision: Decision) => {
    setCurrentDecision(decision);
    navigation.navigate('DecisionConversation' as never);
  };

  const handleViewCard = (decision: Decision) => {
    setCurrentDecision(decision);
    navigation.navigate('DecisionCard' as never);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 获取紧急度标签
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return '很急';
      case 'week': return '一周内';
      case 'month': return '还有时间';
      default: return '';
    }
  };

  // 获取紧急度颜色
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return colors.error;
      case 'week': return colors.warning;
      case 'month': return colors.success;
      default: return colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>良知决策</Text>
        <Text style={styles.headerSubtitle}>剥离情绪，看清本心</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 进行中的决策 */}
        {ongoingDecisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>进行中的决策（{ongoingDecisions.length}）</Text>
            {ongoingDecisions.map(decision => (
              <Card key={decision.id} style={styles.decisionCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.decisionTitle} numberOfLines={1}>
                      {decision.title}
                    </Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(decision.urgency) + '20' }]} >
                      <Text style={[styles.urgencyText, { color: getUrgencyColor(decision.urgency) }]} >
                        {getUrgencyLabel(decision.urgency)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.decisionContext} numberOfLines={2}>
                    {decision.context}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{formatDate(decision.createdAt)}</Text>
                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={() => handleContinueDecision(decision)}
                    >
                      <Text style={styles.continueText}>继续对话</Text>
                      <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* 已完成的决策 */}
        {completedDecisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>已完成的决策（{completedDecisions.length}）</Text>
            {completedDecisions.map(decision => (
              <Card key={decision.id} style={[styles.decisionCard, styles.completedCard]}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.decisionTitle} numberOfLines={1}>
                      {decision.title}
                    </Text>
                    {decision.reviewRating && (
                      <View style={styles.ratingBadge}>
                        <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
                        <Text style={styles.ratingText}>已回顾</Text>
                      </View>
                    )}
                  </View>

                  {decision.conclusion && (
                    <View style={styles.conclusionPreview}>
                      <Text style={styles.conclusionLabel}>本心发现：</Text>
                      <Text style={styles.conclusionText} numberOfLines={2}>
                        {decision.conclusion}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                      完成于 {formatDate(decision.completedAt || decision.createdAt)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewCard(decision)}
                    >
                      <Text style={styles.viewText}>查看卡片</Text>
                      <MaterialCommunityIcons name="card-text-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* 空状态 */}
        {ongoingDecisions.length === 0 && completedDecisions.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="compass-outline" 
              size={64} 
              color={colors.textMuted} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>还没有决策记录</Text>
            <Text style={styles.emptyText}>
              当你面临两难选择时，\n让AI帮你剥离情绪，看清本心
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('NewDecision' as never)}
              style={styles.emptyButton}
              buttonColor={colors.primary}
              textColor={colors.background}
            >
              开始第一个决策
            </Button>
          </View>
        )}
      </ScrollView>

      {/* 新建按钮 */}
      {(ongoingDecisions.length > 0 || completedDecisions.length > 0) && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('NewDecision' as never)}
          color={colors.background}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 24,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  decisionCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  completedCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  decisionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    flex: 1,
    marginRight: spacing.sm,
  },
  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgencyText: {
    ...typography.caption,
    fontSize: 11,
  },
  decisionContext: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 14,
    marginRight: 4,
  },
  conclusionPreview: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  conclusionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  conclusionText: {
    ...typography.body,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    color: colors.success,
    fontSize: 12,
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 14,
    marginRight: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
