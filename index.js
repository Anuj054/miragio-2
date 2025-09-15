import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background FCM message received:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
