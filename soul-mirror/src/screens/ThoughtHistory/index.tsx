import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from 'react-native-paper';

import { colors, spacing, typography } from '@/constants/theme';
import { THOUGHT_TYPES } from '@/constants/database';
import { useThoughtsStore } from '@/store';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function groupThoughtsByDate(thoughts: any[]) {
  const groups: { [key: string]: any[] } = {};
  
  thoughts.forEach(thought => {
    const date = new Date(thought.createdAt);
    const dateKey = date.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(thought);
  });
  
  return Object.entries(groups).map(([date, items]) => ({
    date,
    items,
  }));
}

export function ThoughtHistoryScreen() {
  const { thoughts, isLoading, loadThoughts, deleteThought } = useThoughtsStore();
  
  useEffect(() => {
    loadThoughts();
  }, []);
  
  const groupedThoughts = groupThoughtsByDate(thoughts);
  
  const renderThoughtItem = ({ item }: { item: any }) => {
    const typeInfo = THOUGHT_TYPES.find(t => t.id === item.type);
    
    return (
      <Card style={styles.thoughtCard}>
        <Card.Content>
          <Text style={styles.thoughtContent} numberOfLines={3}>
            {item.content}
          </Text>
          
          <View style={styles.thoughtMeta}>
            <View style={styles.metaLeft}>
              {typeInfo && (
                <View style={[styles.typeTag, { backgroundColor: typeInfo.color + '20' }]}>
                  <Text style={[styles.typeText, { color: typeInfo.color }]}>
                    {typeInfo.label}
                  </Text>
                </View>
              )}
              <Text style={styles.timeText}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            
            <View style={styles.intensityDots}>
              {[1, 2, 3, 4, 5].map(level => (
                <View
                  key={level}
                  style={[
                    styles.intensityDot,
                    level <= item.intensity && { backgroundColor: colors.primary }
                  ]}
                />
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  const renderSectionHeader = (date: string) => {
    const dateObj = new Date(date);
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();
    
    let title = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    if (isToday) title = '今天';
    if (isYesterday) title = '昨天';
    
    return (
      <Text style={styles.sectionHeader}>{title}</Text>
    );
  };
  
  if (thoughts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>还没有记录</Text>
          <Text style={styles.emptySubtext}>去「觉察」页面记录你的第一个念头吧</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>念头历史</Text>
        <Text style={styles.subtitle}>共 {thoughts.length} 条记录</Text>
      </View>
      
      <FlatList
        data={groupedThoughts}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.section}>
            {renderSectionHeader(item.date)}
            {item.items.map((thought: any) => (
              <View key={thought.id}>
                {renderThoughtItem({ item: thought })}
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
    lineHeight: 22,
  },
  thoughtMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    ...typography.small,
  },
  timeText: {
    ...typography.small,
    color: colors.textMuted,
  },
  intensityDots: {
    flexDirection: 'row',
    gap: 4,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.card,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
