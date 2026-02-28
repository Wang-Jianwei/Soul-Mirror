import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { colors } from '@/constants/theme';
import { useThoughtsStore, useDailyAnswerStore, useMoodStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import { TodayScreen } from '@/screens/Today';
import { ThoughtsScreen } from '@/screens/Thoughts';
import { ThoughtHistoryScreen } from '@/screens/ThoughtHistory';
import { ProfileScreen } from '@/screens/Profile';
import { DailyAnswerScreen } from '@/screens/DailyAnswer';
import { AuthScreen } from '@/screens/Auth';
import { DecisionListScreen } from '@/screens/Decision';
import { NewDecisionScreen } from '@/screens/Decision/NewDecision';
import { DecisionConversationScreen } from '@/screens/Decision/Conversation';
import { DecisionCardScreen } from '@/screens/Decision/Card';
import { DecisionReviewScreen } from '@/screens/Decision/Review';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 初始化组件
function AppInitializer({ children }: { children: React.ReactNode }) {
  const init = useThoughtsStore(state => state.init);
  const initAuth = useAuthStore(state => state.init);
  
  useEffect(() => {
    init();
    initAuth();
  }, []);
  
  return <>{children}</>;
}

// 主标签导航
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.surface,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          if (route.name === 'Today') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Thoughts') {
            iconName = focused ? 'thought-bubble' : 'thought-bubble-outline';
          } else if (route.name === 'Decision') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'circle';
          }
          
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Today" 
        component={TodayScreen}
        options={{ title: '今日' }}
      />
      <Tab.Screen 
        name="Thoughts" 
        component={ThoughtsScreen}
        options={{ title: '觉察' }}
      />
      <Tab.Screen 
        name="Decision" 
        component={DecisionListScreen}
        options={{ title: '决策' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '我的' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { user, isInitialized } = useAuthStore();
  const [showAuth, setShowAuth] = useState(true);
  const [initTimeout, setInitTimeout] = useState(false);

  // 5秒后强制显示登录页面（防止无限加载）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInitialized) {
        setInitTimeout(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isInitialized]);

  // 等待初始化完成（最多5秒）
  if (!isInitialized && !initTimeout) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 未登录显示认证页面
  if (!user && showAuth) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthScreen onAuthSuccess={() => setShowAuth(false)} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppInitializer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            >
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="DailyAnswer" component={DailyAnswerScreen} />
              <Stack.Screen name="ThoughtHistory" component={ThoughtHistoryScreen} />
              <Stack.Screen name="DecisionList" component={DecisionListScreen} />
              <Stack.Screen name="NewDecision" component={NewDecisionScreen} />
              <Stack.Screen name="DecisionConversation" component={DecisionConversationScreen} />
              <Stack.Screen name="DecisionCard" component={DecisionCardScreen} />
              <Stack.Screen name="DecisionReview" component={DecisionReviewScreen} />
            </Stack.Navigator>
          </AppInitializer>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
