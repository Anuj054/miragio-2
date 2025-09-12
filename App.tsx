// App.tsx (Updated with AppNavigator)
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { UserProvider } from './src/context/UserContext';
import SplashScreen from './src/components/SplashScreen';
import AuthNavigator from './src/Navigation/AuthNavigator';
import TabNavigator from './src/Navigation/TabNavigator'; // Import TabNavigator directly
import { useUser } from './src/context/UserContext';
import type { AppStackParamList } from './src/Navigation/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

// Main App Content Component
const AppContent = () => {
  const { isLoggedIn, isLoading } = useUser();
  const colorScheme = useColorScheme();

  // Show loading state while checking authentication
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // Show Auth Navigator when not logged in
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Show Main App (TabNavigator) when logged in
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App Component
const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
