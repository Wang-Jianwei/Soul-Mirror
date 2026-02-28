import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/constants/theme';
import { useDecisionsStore } from '@/store';

// 消息气泡组件
function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="compass" size={20} color={colors.primary} />
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
          {content}
        </Text>
      </View>
    </View>
  );
}

export function DecisionConversationScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { currentDecision, currentMessages, sendMessage, completeDecision, isLoading, error, currentCost } = useDecisionsStore();
  
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!currentDecision) {
      navigation.navigate('DecisionList' as never);
    }
  }, [currentDecision]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
  };

  const handleComplete = async () => {
    await completeDecision();
    navigation.navigate('DecisionCard' as never);
  };

  const displayMessages = currentMessages.filter(m => m.role !== 'system');
  const turnCount = Math.floor(displayMessages.filter(m => m.role === 'assistant').length);
  const isCompleted = currentDecision?.completedAt != null;

  if (!currentDecision) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('DecisionList' as never)} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{currentDecision.title}</Text>
            <Text style={styles.headerSubtitle}>第{turnCount}/10轮 · 累计¥{currentCost.toFixed(3)}</Text>
          </View>
          {!isCompleted && (
            <TouchableOpacity onPress={handleComplete} style={styles.completeButton}>
              <Text style={styles.completeText}>结束</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          <View style={styles.introCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.primary} />
            <Text style={styles.introText}>AI将通过提问帮你剥离情绪、看清本心。诚实回答，没有标准答案。</Text>
          </View>

          {displayMessages.map((message, index) => (
            <MessageBubble key={index} role={message.role as 'user' | 'assistant'} content={message.content} />
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="compass" size={20} color={colors.primary} />
              </View>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>思考中...</Text>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {!isCompleted && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="写下你的想法..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <MaterialCommunityIcons name="send" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.h3, color: colors.text, fontSize: 16 },
  headerSubtitle: { ...typography.caption, color: colors.textMuted, fontSize: 12, marginTop: 2 },
  completeButton: { padding: spacing.xs },
  completeText: { ...typography.body, color: colors.primary, fontSize: 14 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: spacing.md, paddingBottom: spacing.lg },
  introCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  introText: { ...typography.body, color: colors.textSecondary, fontSize: 13, marginLeft: spacing.sm, flex: 1, lineHeight: 18 },
  messageContainer: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '85%' },
  userMessageContainer: { alignSelf: 'flex-end' },
  aiMessageContainer: { alignSelf: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  messageBubble: { borderRadius: 16, padding: spacing.md },
  userBubble: { backgroundColor: colors.primary },
  aiBubble: { backgroundColor: colors.surface },
  messageText: { ...typography.body, fontSize: 15, lineHeight: 22 },
  userMessageText: { color: colors.background },
  aiMessageText: { color: colors.text },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  loadingBubble: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md },
  loadingText: { ...typography.body, color: colors.textMuted, fontSize: 14 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.error + '20', borderRadius: 8, padding: spacing.md, marginTop: spacing.sm },
  errorText: { ...typography.body, color: colors.error, fontSize: 14, marginLeft: spacing.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.surface },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text, fontSize: 15, maxHeight: 100 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
  sendButtonDisabled: { backgroundColor: colors.textMuted },
});
