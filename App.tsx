// App.tsx (Fixed version)
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { UserProvider } from './src/context/UserContext';
import SplashScreen from './src/components/SplashScreen';
import AuthNavigator from './src/Navigation/AuthNavigator';
import RootNavigator from './src/Navigation/RootNavigator';
import { useUser } from './src/context/UserContext';

const Stack = createNativeStackNavigator();

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
        {isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />

        ) : (
          <Stack.Screen name="Root" component={RootNavigator} />
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