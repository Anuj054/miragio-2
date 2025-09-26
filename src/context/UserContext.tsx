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
    instagram_username?: string;
    upi?: string;
    pan_number?: string;
}

interface LoginResponse {
    status: string;
    message: string;
    data: UserData;
}

export interface SignupData {
    username: string;
    email: string;
    password: string;
    phone_number: string;
    age: string;
    gender: string;
    occupation: string;
    aadharnumber: string;
    instagram_username?: string;
    upi?: string;
    pan_number?: string;
}

interface SignupResponse {
    status: string;
    message: string;
    data?: { user_id: string; otp_token?: string };
}

export interface UserContextType {
    user: UserData | null;
    isLoggedIn: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;

    pendingSignupData: SignupData | null;
    pendingUserId: string | null;

    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    registerUser: (signupData: SignupData) => Promise<{ success: boolean; message: string; userId?: string }>;

    refreshUserData: (userId?: string) => Promise<void>;
    updateUserData: (userData: Partial<UserData>) => void;

    storePendingSignupData: (signupData: SignupData, userId: string) => void;
    clearPendingSignupData: () => void;

    getUserId: () => string | null;
    getUserEmail: () => string | null;
    getUserName: () => string | null;
    getUserWallet: () => string | null;

    // ➕ FCM token functionality
    storeFcmToken: (userId: string) => Promise<{ success: boolean; message: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ---------- Constants ----------
const STORAGE_KEYS = {
    USER_DATA: '@user_data',
    USER_ID: '@user_id',
    IS_LOGGED_IN: '@is_logged_in',
    PENDING_SIGNUP_DATA: '@pending_signup_data',
    PENDING_USER_ID: '@pending_user_id',
    FCM_TOKEN: '@fcm_token',
};

const API_BASE_URL = 'https://miragiofintech.org/api/api.php';

// Normalize user data so all values are strings
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
    instagram_username: data.instagram_username || '',
    upi: data.upi || '',
    pan_number: data.pan_number || '',
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [pendingSignupData, setPendingSignupData] = useState<SignupData | null>(null);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    useEffect(() => {
        initializeUser();
        initializeFCMToken();
    }, []);

    // Initialize FCM token on app start
    const initializeFCMToken = async () => {
        try {
            const token = await messaging().getToken();
            if (token) {
                await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
                console.log('📱 FCM Token initialized:', token);
            }
        } catch (error) {
            console.error('❌ Error initializing FCM token:', error);
        }
    };

    const initializeUser = async () => {
        try {
            setIsLoading(true);
            const [storedUserData, storedLoginStatus, storedSignupData, storedPendingUserId] =
                await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
                    AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
                    AsyncStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP_DATA),
                    AsyncStorage.getItem(STORAGE_KEYS.PENDING_USER_ID),
                ]);

            if (storedSignupData && storedPendingUserId) {
                setPendingSignupData(JSON.parse(storedSignupData));
                setPendingUserId(storedPendingUserId);
            }

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

    // ---------- Auth Methods ----------
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
                await clearPendingSignupData();

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

    const registerUser = async (signupData: SignupData) => {
        try {
            setIsLoading(true);
            console.log('🔄 Registering user...');

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'user_register', ...signupData }),
            });
            const data: SignupResponse = await res.json();

            if (data.status === 'success' && data.data?.user_id) {
                console.log('✅ User registered successfully, User ID:', data.data.user_id);
                await storePendingSignupData(signupData, data.data.user_id);
                return {
                    success: true,
                    message: data.message || 'Registration successful! Please verify OTP.',
                    userId: data.data.user_id,
                };
            }
            return { success: false, message: data.message || 'Registration failed. Please try again.' };
        } catch (err) {
            console.error('❌ Registration error:', err);
            return { success: false, message: 'Network error. Please check your internet connection.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Logging out user...');
            await clearUserData();
            await clearPendingSignupData();
            setUser(null);
            setIsLoggedIn(false);
            console.log('✅ User logged out successfully');
        } catch (err) {
            console.error('❌ Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- User Data ----------
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

    const storePendingSignupData = async (signupData: SignupData, userId: string) => {
        setPendingSignupData(signupData);
        setPendingUserId(userId);
        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.PENDING_SIGNUP_DATA, JSON.stringify(signupData)),
            AsyncStorage.setItem(STORAGE_KEYS.PENDING_USER_ID, userId),
        ]);
        console.log('📝 Pending signup data stored for user:', userId);
    };

    const clearPendingSignupData = async () => {
        setPendingSignupData(null);
        setPendingUserId(null);
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP_DATA),
            AsyncStorage.removeItem(STORAGE_KEYS.PENDING_USER_ID),
        ]);
        console.log('🗑️ Pending signup data cleared');
    };

    // ---------- FCM Token Management ----------
    const storeFcmToken = async (userId: string): Promise<{ success: boolean; message: string }> => {
        try {
            if (!userId) {
                console.warn('❌ No user ID provided. Cannot store FCM token.');
                return { success: false, message: 'No user ID provided.' };
            }

            console.log(`🔄 Getting FCM token for user ID: ${userId}`);

            // Try to get fresh token first
            let token = await messaging().getToken();

            // Fallback to stored token if fresh token fails
            if (!token) {
                console.log('🔄 Fresh token not available, trying stored token...');
                const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
                token = storedToken || '';
            }

            if (!token) {
                console.warn('❌ No FCM token available.');
                return { success: false, message: 'No FCM token available.' };
            }

            console.log(`📱 FCM token found: ${token.substring(0, 20)}...`);
            console.log(`🔄 Storing FCM token in database for user: ${userId}`);

            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_fcmtoken',
                    user_id: userId,
                    token: token
                }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                console.log('✅ FCM token stored successfully in database:', data.message);
                if (data.data) {
                    console.log('📊 Token data:', {
                        id: data.data.id,
                        user_id: data.data.user_id,
                        created_at: data.data.created_at
                    });
                }
                // Store token locally for future reference
                await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
                return { success: true, message: data.message || 'FCM token stored successfully!' };
            } else {
                console.warn('⚠️ Failed to store FCM token in database:', data.message);
                return { success: false, message: data.message || 'Failed to store FCM token.' };
            }
        } catch (err) {
            console.error('❌ Error storing FCM token:', err);
            return { success: false, message: 'Error storing FCM token.' };
        }
    };

    // ---------- Utilities ----------
    const getUserId = () => user?.id || null;
    const getUserEmail = () => user?.email || null;
    const getUserName = () => user?.username || null;
    const getUserWallet = () => user?.wallet || null;

    const value: UserContextType = {
        user,
        isLoggedIn,
        isAuthenticated: isLoggedIn,
        isLoading,
        pendingSignupData,
        pendingUserId,
        login,
        logout,
        registerUser,
        refreshUserData,
        updateUserData,
        storePendingSignupData,
        clearPendingSignupData,
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