import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, List, Divider } from 'react-native-paper';

import { colors, spacing, typography } from '../constants/theme';
import { useStatsStore } from '../store';
import * as db from '../utils/database';

export function ProfileScreen() {
  const { totalThoughts, totalAnswers, streakDays, loadStats } = useStatsStore();
  const [appVersion] = useState('0.1.0');
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const data = await db.exportAllData();
      const exportData = {
        exportDate: new Date().toISOString(),
        version: appVersion,
        ...data,
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: jsonString,
        title: '心镜数据导出',
      });
    } catch (error) {
      Alert.alert('导出失败', '请重试');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleClearData = () => {
    Alert.alert(
      '确认清空',
      '这将删除所有记录，不可恢复。确定吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '清空', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await db.clearAllData();
              await loadStats();
              Alert.alert('已清空', '所有数据已删除');
            } catch (error) {
              Alert.alert('清空失败', '请重试');
            } finally {
              setIsClearing(false);
            }
          }
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>我的</Text>
        
        {/* 数据统计 */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>数据统计</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalThoughts}</Text>
                <Text style={styles.statLabel}>念头记录</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalAnswers}</Text>
                <Text style={styles.statLabel}>回答一问</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{streakDays}</Text>
                <Text style={styles.statLabel}>连续觉察(天)</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* 数据管理 */}
        <Card style={styles.menuCard}>
          <List.Section>
            <List.Subheader style={styles.subheader}>数据管理</List.Subheader>
            
            <List.Item
              title="导出全部数据"
              description={isExporting ? '导出中...' : 'JSON 格式'}
              left={props => <List.Icon {...props} icon="export" color={colors.primary} />}
              onPress={handleExportData}
              disabled={isExporting}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="清空所有记录"
              description={isClearing ? '清空中...' : '不可恢复'}
              left={props => <List.Icon {...props} icon="delete" color={colors.error} />}
              onPress={handleClearData}
              disabled={isClearing}
              titleStyle={[styles.listItemTitle, { color: colors.error }]}
              descriptionStyle={styles.listItemDescription}
            />
          </List.Section>
        </Card>
        
        {/* 关于 */}
        <Card style={styles.menuCard}>
          <List.Section>
            <List.Subheader style={styles.subheader}>关于心镜</List.Subheader>
            
            <List.Item
              title="版本"
              description={appVersion}
              left={props => <List.Icon {...props} icon="information" color={colors.textSecondary} />}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="项目理念"
              description="不是帮你做更多，而是帮你看清什么值得做"
              left={props => <List.Icon {...props} icon="heart" color={colors.primary} />}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="反馈建议"
              description="告诉我们你的想法"
              left={props => <List.Icon {...props} icon="email" color={colors.textSecondary} />}
              onPress={() => {}}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          </List.Section>
        </Card>
        
        {/* 底部标语 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>此心光明，亦复何言。</Text>
        </View>
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
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  subheader: {
    ...typography.body,
    color: colors.textSecondary,
  },
  listItemTitle: {
    ...typography.body,
    color: colors.text,
  },
  listItemDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    backgroundColor: colors.card,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
