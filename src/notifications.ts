import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

/** Ask for push permissions (iOS) + Android 13+ runtime permission */
export async function requestPushPermission() {
  const authStatus = await messaging().requestPermission();
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    await PermissionsAndroid.request(
      // @ts-ignore - RN types may lag; string works.
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }
}

/** Get the current device token */
export async function getFcmToken(): Promise<string | undefined> {
  const token = await messaging().getToken();
  return token || undefined;
}

/** Foreground handler: show a simple in-app alert (no local notif SDK) */
export function registerForegroundHandler() {
  const unsub = messaging().onMessage(async (remoteMessage) => {
    const title = remoteMessage?.notification?.title ?? 'New message';
    const body  = remoteMessage?.notification?.body ?? '';
    // Basic UI since we don't use a notifications library:
    if (title || body) {
      Alert.alert(title, body);
    }
    // Handle data payloads here if you need custom logic:
    // const data = remoteMessage?.data;
  });
  return unsub;
}

/** Token refresh handler: call with a callback that posts the new token to your backend */
export function registerTokenRefreshHandler(onRefresh: (token: string) => void) {
  return messaging().onTokenRefresh(onRefresh);
}

/** Background/quit messages handler (Android headless; iOS wakes app). No UI here. */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // Without a local notifications library, you can't show a banner here.
  // The OS will auto-display background notifications if your payload includes a `notification` block.
  // For data-only pushes, do your background work here.
});
