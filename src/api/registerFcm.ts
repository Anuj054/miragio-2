// api/registerFcm.ts
import { Platform } from 'react-native';

const API_BASE_URL = 'https://miragiofintech.org/api/api.php'; // <- change me

type AddFcmResponse =
  | { success: true; message: string; data?: any }
  | { success: false; message: string; error?: any };

export async function registerFcmToken(
  userId: number | string,
  token: string,
  status: number = 1
): Promise<AddFcmResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'add_fcmtoken',
        user_id: String(userId),
        token,
        status,
        platform: Platform.OS, // optional, useful to store
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: json?.message || `HTTP ${res.status}`, error: json };
    }
    // Expect your PHP to return { success: true/false, message, data? }
    return json;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, message: 'Request timed out' };
    }
    return { success: false, message: err?.message || 'Network error', error: err };
  } finally {
    clearTimeout(timeout);
  }
}
