import React, { useEffect } from 'react';
import { Alert, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

import { UserProvider, useUser } from './src/context/UserContext';
import { TranslationProvider } from './src/context/TranslationContext'; // NEW: Translation context
import SplashScreen from './src/components/SplashScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import type { RootStackParamList } from './src/navigation/types';
import { requestPushPermission, getFcmToken, registerForegroundHandler, registerTokenRefreshHandler } from './src/notifications';
import { registerFcmToken } from './src/api/registerFcm';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { isLoggedIn, isLoading } = useUser();
  const colorScheme = useColorScheme();
  useEffect(() => {
    (async () => {
      await requestPushPermission();

      const token = await getFcmToken();
      if (token) {
        // TODO: send token to your PHP backend
        await registerFcmToken(163, token);
      }

      const unsubFG = registerForegroundHandler();
      const unsubTok = registerTokenRefreshHandler(async (newToken) => {
        // Re-register token with backend
      });

      return () => { unsubFG(); unsubTok(); };
    })();
  }, []);


  // useEffect(() => {
  //   // Request notification permissions
  //   messaging()
  //     .requestPermission()
  //     .then(authStatus => {
  //       const enabled =
  //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //       if (enabled) {
  //         console.log('✅ Notification permission granted:', authStatus);
  //       }
  //     });

  //   // Get FCM token (important for testing)
  //   messaging()
  //     .getToken()
  //     .then(token => {
  //       console.log('🔥 FCM Token:', token);

  //       // Show token in an alert popup for easy copying during dev

  //     })
  //     .catch(error => {
  //       console.error('❌ Error fetching FCM token:', error);
  //     });

  //   // Handle foreground notifications
  //   const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
  //     Alert.alert(
  //       remoteMessage.notification?.title ?? 'New Notification',
  //       remoteMessage.notification?.body ?? 'You received a new message'
  //     );
  //   });

  //   return () => {
  //     unsubscribeOnMessage();
  //   };
  // }, []);

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

    < TranslationProvider >
      <UserProvider>
        <AppContent />
      </UserProvider>
    </TranslationProvider>
  );
};

export default App;