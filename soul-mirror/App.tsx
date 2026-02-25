import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { theme } from './src/constants/theme';
import { TodayScreen } from './src/screens/Today';
import { ThoughtsScreen } from './src/screens/Thoughts';
import { ProfileScreen } from './src/screens/Profile';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.surface,
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textMuted,
            }}
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
              name="Profile" 
              component={ProfileScreen}
              options={{ title: '我的' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
