import React, { useEffect } from 'react';
import { Alert, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

import { UserProvider, useUser } from './src/context/UserContext';
import SplashScreen from './src/components/SplashScreen';
import AuthNavigator from './src/Navigation/AuthNavigator';
import MainNavigator from './src/Navigation/MainNavigator';
import type { RootStackParamList } from './src/Navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { isLoggedIn, isLoading } = useUser();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Request notification permissions
    messaging()
      .requestPermission()
      .then(authStatus => {
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permission granted:', authStatus);
        }
      });

    // Get FCM token (important for testing)
    messaging()
      .getToken()
      .then(token => {
        console.log('🔥 FCM Token:', token);

        // Show token in an alert popup for easy copying during dev
        Alert.alert('FCM Token', token);
      })
      .catch(error => {
        console.error('❌ Error fetching FCM token:', error);
      });

    // Handle foreground notifications
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title ?? 'New Notification',
        remoteMessage.notification?.body ?? 'You received a new message'
      );
    });

    return () => {
      unsubscribeOnMessage();
    };
  }, []);

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
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
