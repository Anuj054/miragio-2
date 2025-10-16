import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

// ---------- Types ----------
export interface UserData {
    id: string;
    username: string;
    email: string;
    age: string;
    gender: string;
    occupation: string;
    aadharnumber: string;
    phone_number: string;
    user_role: string;
    wallet: string;
    status: string;
    created_at: string;
    city: string;
    instagram_username?: string;
    upi?: string;
    pan_number?: string;
}

interface LoginResponse {
    status: string;
    message: string;
    data: UserData;
}

export interface Step1Data {
    email: string;
    password: string;
    referral_code: string;
    user_role: string;
}

export interface Step2Data extends Step1Data {
    user_id: string;
    username: string;
    aadharnumber: string;
    phone_number: string;
    age: string;
    gender: string;
    occupation: string;
    city: string;
}

export interface Step3Data extends Step2Data {
    instagram_username: string;
    upi: string;
    pan_number: string;
    commission_percent?: string;
}

interface Step1Response {
    status: string;
    message: string;
    data?: { user_id: string };
}

interface Step2Response {
    status: string;
    message: string;
    data?: { user_id: string };
}

interface Step3Response {
    status: string;
    message: string;
    data?: { user_id: string; referral_code?: string };
}

export interface UserContextType {
    user: UserData | null;
    isLoggedIn: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;

    // 3-Step Registration State
    step1Data: Step1Data | null;
    step2Data: Step2Data | null;
    currentUserId: string | null;

    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;

    // 3-Step Registration Methods
    registerStep1: (data: Step1Data) => Promise<{ success: boolean; message: string; userId?: string }>;
    registerStep2: (data: Step2Data) => Promise<{ success: boolean; message: string }>;
    registerStep3: (data: Step3Data) => Promise<{ success: boolean; message: string; userId?: string }>;

    verifyEmailOtp: (userId: string, otp: string) => Promise<{ success: boolean; message: string }>;

    refreshUserData: (userId?: string) => Promise<void>;
    updateUserData: (userData: Partial<UserData>) => void;

    clearRegistrationData: () => void;
    getRegistrationProgress: () => 'step1' | 'step2' | 'step3' | 'none';

    getUserId: () => string | null;
    getUserEmail: () => string | null;
    getUserName: () => string | null;
    getUserWallet: () => string | null;

    storeFcmToken: (userId: string) => Promise<{ success: boolean; message: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ---------- Constants ----------
const STORAGE_KEYS = {
    USER_DATA: '@user_data',
    USER_ID: '@user_id',
    IS_LOGGED_IN: '@is_logged_in',
    STEP1_DATA: '@step1_data',
    STEP2_DATA: '@step2_data',
    CURRENT_USER_ID: '@current_user_id',
    FCM_TOKEN: '@fcm_token',
};

const API_BASE_URL = 'https://miragiofintech.org/api/api.php';

const normalizeUserData = (data: any): UserData => ({
    id: String(data.id || ''),
    username: String(data.username || ''),
    email: String(data.email || ''),
    age: String(data.age || ''),
    gender: String(data.gender || ''),
    occupation: String(data.occupation || ''),
    aadharnumber: String(data.aadharnumber || ''),
    phone_number: String(data.phone_number || ''),
    user_role: String(data.user_role || ''),
    wallet: String(data.wallet || '0'),
    status: String(data.status || ''),
    created_at: String(data.created_at || ''),
    city: String(data.city || ''),
    instagram_username: data.instagram_username || '',
    upi: data.upi || '',
    pan_number: data.pan_number || '',
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
    const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        initializeUser();
        initializeFCMToken();
    }, []);

    const initializeFCMToken = async () => {
        try {
            const token = await messaging().getToken();
            if (token) {
                await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
                console.log('📱 FCM Token initialized:', token.substring(0, 20) + '...');
            }
        } catch (error) {
            console.error('❌ Error initializing FCM token:', error);
        }
    };

    const initializeUser = async () => {
        try {
            setIsLoading(true);
            const [storedUserData, storedLoginStatus, storedStep1, storedStep2, storedUserId] =
                await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
                    AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
                    AsyncStorage.getItem(STORAGE_KEYS.STEP1_DATA),
                    AsyncStorage.getItem(STORAGE_KEYS.STEP2_DATA),
                    AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID),
                ]);

            console.log('🔄 initializeUser - Loading stored data:', {
                hasStep1: !!storedStep1,
                hasStep2: !!storedStep2,
                hasUserId: !!storedUserId,
            });

            // Always load registration data first
            if (storedStep1) {
                const parsedStep1 = JSON.parse(storedStep1);
                setStep1Data(parsedStep1);
                console.log('✅ Loaded step1Data from AsyncStorage');
            }

            if (storedStep2) {
                const parsedStep2 = JSON.parse(storedStep2);
                setStep2Data(parsedStep2);
                console.log('✅ Loaded step2Data from AsyncStorage');
            }

            if (storedUserId) {
                setCurrentUserId(storedUserId);
                console.log('✅ Loaded currentUserId from AsyncStorage:', storedUserId);
            }

            // Then load user data if logged in
            if (storedUserData && storedLoginStatus === 'true') {
                const normalizedUserData = normalizeUserData(JSON.parse(storedUserData));
                setUser(normalizedUserData);
                setIsLoggedIn(true);
                await refreshUserData(normalizedUserData.id);
            }
        } catch (err) {
            console.error('❌ Error initializing user:', err);
            await clearUserData();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'user_login', email: email.trim(), password: password.trim() }),
            });
            const data: LoginResponse = await res.json();

            if (data.status === 'success' && data.data) {
                const normalizedUserData = normalizeUserData(data.data);
                await storeUserData(normalizedUserData);
                setUser(normalizedUserData);
                setIsLoggedIn(true);
                await clearRegistrationData();

                const fcmResult = await storeFcmToken(normalizedUserData.id);
                console.log('📱 FCM token stored on login:', fcmResult.success);

                return { success: true, message: data.message || 'Login successful!' };
            }
            return { success: false, message: data.message || 'Login failed. Please try again.' };
        } catch (err) {
            console.error('❌ Login error:', err);
            return { success: false, message: 'Network error. Please check your internet connection.' };
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- Step 1: Email & Password ----------
    const registerStep1 = async (data: Step1Data): Promise<{ success: boolean; message: string; userId?: string }> => {
        try {
            console.log('🔄 Step 1: Creating incomplete user...');

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register_step1',
                    email: data.email.trim(),
                    password: data.password.trim(),
                    referral_code: data.referral_code.trim() || '',
                    user_role: data.user_role,
                }),
            });

            const responseText = await res.text();
            console.log('📊 Step 1 Raw Response:', responseText);

            let responseData: Step1Response;
            try {
                responseData = JSON.parse(responseText);
            } catch (parseErr) {
                console.error('❌ Invalid JSON response:', responseText, parseErr);
                return { success: false, message: 'Server error: Invalid response format' };
            }

            console.log('📊 Step 1 Parsed Response:', responseData);

            // Check if status is success
            if (responseData.status !== 'success') {
                console.warn('⚠️ Step 1 API returned non-success status:', responseData.status);
                return { success: false, message: responseData.message || 'Registration failed. Please try again.' };
            }

            // Check if data exists
            if (!responseData.data) {
                console.error('❌ Step 1 response has no data:', responseData);
                return { success: false, message: responseData.message || 'No user ID returned from server' };
            }

            // Check if user_id exists
            const userId = responseData.data.user_id;
            if (!userId) {
                console.error('❌ Step 1 response has no user_id:', responseData.data);
                return { success: false, message: 'No user ID returned from server' };
            }

            // All checks passed - store data (WITHOUT setting loading)
            setStep1Data(data);
            setCurrentUserId(userId);

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.STEP1_DATA, JSON.stringify(data)),
                AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, String(userId)),
            ]);

            console.log('✅ Step 1 completed. User ID:', userId);
            return {
                success: true,
                message: responseData.message || 'Step 1 completed',
                userId: String(userId),
            };

        } catch (err) {
            console.error('❌ Step 1 error:', err);
            return { success: false, message: 'Network error during Step 1. Please check your internet connection.' };
        }
    };

    // ---------- Step 2: KYC Details ----------
    const registerStep2 = async (data: Step2Data): Promise<{ success: boolean; message: string }> => {
        try {
            console.log('🔄 Step 2: Filling KYC details for user:', data.user_id);

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register_step2',
                    user_id: data.user_id,
                    username: data.username.trim(),
                    aadharnumber: data.aadharnumber.trim(),
                    phone_number: data.phone_number.trim(),
                    age: data.age.trim(),
                    gender: data.gender.trim(),
                    occupation: data.occupation.trim(),
                    city: data.city.trim(),
                }),
            });

            const responseText = await res.text();
            console.log('📊 Step 2 Raw Response:', responseText);

            let responseData: Step2Response;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                console.error('❌ Invalid JSON response:', responseText);
                return { success: false, message: 'Server error: Invalid response format' };
            }

            console.log('📊 Step 2 Parsed Response:', responseData);

            if (responseData.status === 'success') {
                console.log('✅ Step 2 API returned success, storing data...');

                setStep2Data(data);
                console.log('✅ step2Data state set to:', data);

                await AsyncStorage.setItem(STORAGE_KEYS.STEP2_DATA, JSON.stringify(data));
                console.log('✅ step2Data saved to AsyncStorage');

                console.log('✅ Step 2 completed');
                return { success: true, message: responseData.message || 'Step 2 completed' };
            }

            console.warn('⚠️ Step 2 API returned non-success status:', responseData.status);
            return { success: false, message: responseData.message || 'Step 2 failed' };
        } catch (err) {
            console.error('❌ Step 2 error:', err);
            return { success: false, message: 'Network error during Step 2' };
        }
    };

    // ---------- Step 3: Additional Details ----------
    const registerStep3 = async (data: Step3Data): Promise<{ success: boolean; message: string; userId?: string }> => {
        try {
            console.log('🔄 Step 3: Finalizing registration for user:', data.user_id);

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register_step3',
                    user_id: data.user_id,
                    instagram_username: data.instagram_username.trim() || '',
                    upi: data.upi.trim() || '',
                    pan_number: data.pan_number.trim() || '',
                    commission_percent: data.commission_percent || '0',
                    city: data.city.trim(),
                }),
            });

            const responseText = await res.text();
            let responseData: Step3Response;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                console.error('❌ Invalid JSON response:', responseText);
                return { success: false, message: 'Server error: Invalid response format' };
            }

            if (responseData.status === 'success') {
                const userId = data.user_id;

                // Store credentials for auto-login after OTP
                await AsyncStorage.setItem('@new_account_credentials',
                    JSON.stringify({
                        email: data.email,
                        password: data.password,
                    })
                );

                console.log('✅ Step 3 completed. Ready for OTP verification');
                return {
                    success: true,
                    message: responseData.message || 'Step 3 completed. Please verify OTP.',
                    userId: String(userId),
                };
            }

            console.warn('⚠️ Step 3 API returned error:', responseData.message);
            return { success: false, message: responseData.message || 'Step 3 failed' };
        } catch (err) {
            console.error('❌ Step 3 error:', err);
            return { success: false, message: 'Network error during Step 3' };
        }
    };

    const verifyEmailOtp = async (userId: string, otp: string): Promise<{ success: boolean; message: string }> => {
        try {
            console.log('🔄 Verifying OTP for user:', userId);

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify_email_otp',
                    user_id: userId,
                    otp: otp.trim(),
                }),
            });

            const responseText = await res.text();
            let responseData: Step3Response;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                console.error('❌ Invalid JSON response:', responseText);
                return { success: false, message: 'Server error: Invalid response format' };
            }

            if (responseData.status === 'success') {
                console.log('✅ OTP verified successfully');
                console.log('✅ Registration data kept in context');
                return { success: true, message: responseData.message || 'OTP verified successfully' };
            }

            console.warn('⚠️ OTP verification failed:', responseData.message);
            return { success: false, message: responseData.message || 'OTP verification failed' };
        } catch (err) {
            console.error('❌ OTP verification error:', err);
            return { success: false, message: 'Network error during OTP verification' };
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Logging out user...');

            const userId = getUserId();
            if (userId) {
                try {
                    const res = await fetch(API_BASE_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'user_logout',
                            user_id: userId,
                        }),
                    });

                    const data = await res.json();
                    if (data.status === 'success') {
                        console.log('✅ Backend logout success');
                    } else {
                        console.warn('⚠️ Backend logout failed:', data.message);
                    }
                } catch (apiErr) {
                    console.error('❌ API logout error:', apiErr);
                }
            }

            // Clear everything on logout
            await clearUserData();
            await clearRegistrationData();
            await AsyncStorage.removeItem('@new_account_credentials');
            await AsyncStorage.removeItem('@pending_user_id');

            setUser(null);
            setIsLoggedIn(false);

            console.log('✅ User logged out completely, all data cleared');
        } catch (err) {
            console.error('❌ Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const refreshUserData = async (userId?: string) => {
        try {
            const id = userId || user?.id;
            if (!id) return;

            console.log('🔄 Refreshing user data for:', id);
            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_userdetails', id }),
            });
            const data = await res.json();

            if (data.status === 'success' && data.data) {
                const normalizedUserData = normalizeUserData(data.data);
                await storeUserData(normalizedUserData);
                setUser(normalizedUserData);
                console.log('✅ User data refreshed successfully');
            }
        } catch (err) {
            console.error('❌ Error refreshing user data:', err);
        }
    };

    const updateUserData = (userData: Partial<UserData>) => {
        if (!user) return;
        const updatedUser = normalizeUserData({ ...user, ...userData });
        setUser(updatedUser);
        storeUserData(updatedUser);
        console.log('✅ User data updated locally');
    };

    const storeUserData = async (userData: UserData) => {
        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
            AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userData.id),
            AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true'),
        ]);
    };

    const clearUserData = async () => {
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
            AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
            AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
        ]);
    };

    const clearRegistrationData = async () => {
        setStep1Data(null);
        setStep2Data(null);
        setCurrentUserId(null);
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.STEP1_DATA),
            AsyncStorage.removeItem(STORAGE_KEYS.STEP2_DATA),
            AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID),
            AsyncStorage.removeItem('@new_account_credentials'),
        ]);
        console.log('🗑️ Registration data cleared');
    };

    const getRegistrationProgress = (): 'step1' | 'step2' | 'step3' | 'none' => {
        if (step2Data) return 'step3';
        if (step1Data) return 'step2';
        if (currentUserId) return 'step1';
        return 'none';
    };

    const storeFcmToken = async (userId: string): Promise<{ success: boolean; message: string }> => {
        try {
            if (!userId) {
                console.warn('❌ No user ID provided');
                return { success: false, message: 'No user ID provided.' };
            }

            console.log('🔄 Getting FCM token for user ID:', userId);

            let token = await messaging().getToken();

            if (!token) {
                const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
                token = storedToken || '';
            }

            if (!token) {
                console.warn('❌ No FCM token available');
                return { success: false, message: 'No FCM token available.' };
            }

            console.log('📱 FCM token found:', token.substring(0, 20) + '...');

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_fcmtoken',
                    user_id: userId,
                    token: token,
                }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                console.log('✅ FCM token stored successfully');
                await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
                return { success: true, message: data.message || 'FCM token stored successfully!' };
            }

            console.warn('⚠️ Failed to store FCM token:', data.message);
            return { success: false, message: data.message || 'Failed to store FCM token.' };
        } catch (err) {
            console.error('❌ Error storing FCM token:', err);
            return { success: false, message: 'Error storing FCM token.' };
        }
    };

    const getUserId = () => user?.id || null;
    const getUserEmail = () => user?.email || null;
    const getUserName = () => user?.username || null;
    const getUserWallet = () => user?.wallet || null;

    const value: UserContextType = {
        user,
        isLoggedIn,
        isAuthenticated: isLoggedIn,
        isLoading,
        step1Data,
        step2Data,
        currentUserId,
        login,
        logout,
        registerStep1,
        registerStep2,
        registerStep3,
        verifyEmailOtp,
        refreshUserData,
        updateUserData,
        clearRegistrationData,
        getRegistrationProgress,
        getUserId,
        getUserEmail,
        getUserName,
        getUserWallet,
        storeFcmToken,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within a UserProvider');
    return ctx;
};