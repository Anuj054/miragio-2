// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for user data
interface UserData {
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

// ADDED: Signup/Registration related interfaces
interface SignupData {
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
    data?: {
        user_id: string;
        otp_token?: string;
    };
}

interface OTPVerificationResponse {
    status: string;
    message: string;
    data?: UserData;
}

interface UserContextType {
    // User state
    user: UserData | null;
    isLoggedIn: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;

    // ADDED: Signup state
    pendingSignupData: SignupData | null;
    pendingUserId: string | null;

    // Authentication methods
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;

    // ADDED: Signup methods
    registerUser: (signupData: SignupData) => Promise<{ success: boolean; message: string; userId?: string }>;
    verifyOTP: (otp: string, userId: string) => Promise<{ success: boolean; message: string }>;
    resendOTP: (userId: string) => Promise<{ success: boolean; message: string }>;

    // User data methods
    refreshUserData: () => Promise<void>;
    updateUserData: (userData: Partial<UserData>) => void;

    // ADDED: Signup data management
    storePendingSignupData: (signupData: SignupData, userId: string) => void;
    clearPendingSignupData: () => void;

    // Utility methods
    getUserId: () => string | null;
    getUserEmail: () => string | null;
    getUserName: () => string | null;
    getUserWallet: () => string | null;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
    USER_DATA: '@user_data',
    USER_ID: '@user_id',
    IS_LOGGED_IN: '@is_logged_in',
    PENDING_SIGNUP_DATA: '@pending_signup_data', // ADDED
    PENDING_USER_ID: '@pending_user_id' // ADDED
};

// API configuration
const API_BASE_URL = 'https://netinnovatus.tech/miragio_task/api/api.php';

// Helper function to normalize user data and ensure all values are strings
const normalizeUserData = (userData: any): UserData => {
    return {
        id: String(userData.id || ''),
        username: String(userData.username || ''),
        email: String(userData.email || ''),
        age: String(userData.age || ''),
        gender: String(userData.gender || ''),
        occupation: String(userData.occupation || ''),
        aadharnumber: String(userData.aadharnumber || ''),
        phone_number: String(userData.phone_number || ''),
        user_role: String(userData.user_role || ''),
        wallet: String(userData.wallet || '0'),
        status: String(userData.status || ''),
        created_at: String(userData.created_at || ''),
        instagram_username: userData.instagram_username || '',
        upi: userData.upi || '',
        pan_number: userData.pan_number || ''
    };
};

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // ADDED: Signup state
    const [pendingSignupData, setPendingSignupData] = useState<SignupData | null>(null);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    // Initialize user data on app start
    useEffect(() => {
        initializeUser();
    }, []);

    // Initialize user from storage
    const initializeUser = async () => {
        try {
            setIsLoading(true);

            const [storedUserData, storedLoginStatus, storedSignupData, storedPendingUserId] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
                AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
                AsyncStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP_DATA), // ADDED
                AsyncStorage.getItem(STORAGE_KEYS.PENDING_USER_ID) // ADDED
            ]);

            // Restore pending signup data if exists
            if (storedSignupData && storedPendingUserId) {
                setPendingSignupData(JSON.parse(storedSignupData));
                setPendingUserId(storedPendingUserId);
            }

            if (storedUserData && storedLoginStatus === 'true') {
                const userData = JSON.parse(storedUserData);
                const normalizedUserData = normalizeUserData(userData);
                setUser(normalizedUserData);
                setIsLoggedIn(true);

                // Refresh user data to ensure it's current
                await refreshUserData(normalizedUserData.id);
            }
        } catch (error) {
            console.error('Error initializing user:', error);
            // Clear potentially corrupted data
            await clearUserData();
        } finally {
            setIsLoading(false);
        }
    };

    // Login function
    const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsLoading(true);

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "user_login",
                    email: email.trim(),
                    password: password.trim()
                })
            });

            const data: LoginResponse = await response.json();

            if (data.status === 'success' && data.data) {
                // Normalize user data to ensure all values are strings
                const normalizedUserData = normalizeUserData(data.data);

                // Store user data
                await storeUserData(normalizedUserData);
                setUser(normalizedUserData);
                setIsLoggedIn(true);

                // Clear any pending signup data after successful login
                await clearPendingSignupData();

                return { success: true, message: data.message || 'Login successful!' };
            } else {
                return { success: false, message: data.message || 'Login failed. Please try again.' };
            }

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please check your internet connection.' };
        } finally {
            setIsLoading(false);
        }
    };

    // ADDED: Register user function
    const registerUser = async (signupData: SignupData): Promise<{ success: boolean; message: string; userId?: string }> => {
        try {
            setIsLoading(true);

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "user_register", // Adjust action name as per your API
                    ...signupData
                })
            });

            const data: SignupResponse = await response.json();

            if (data.status === 'success' && data.data?.user_id) {
                // Store pending signup data for later use during OTP verification
                await storePendingSignupData(signupData, data.data.user_id);

                return {
                    success: true,
                    message: data.message || 'Registration successful! Please verify OTP.',
                    userId: data.data.user_id
                };
            } else {
                return { success: false, message: data.message || 'Registration failed. Please try again.' };
            }

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please check your internet connection.' };
        } finally {
            setIsLoading(false);
        }
    };

    // ADDED: Verify OTP and automatically login user
    const verifyOTP = async (otp: string, userId: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsLoading(true);

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "verify_otp", // Adjust action name as per your API
                    otp: otp.trim(),
                    user_id: userId
                })
            });

            const data: OTPVerificationResponse = await response.json();

            if (data.status === 'success') {
                // OTP verified successfully - automatically login the user
                if (data.data) {
                    // User data returned from API
                    const normalizedUserData = normalizeUserData(data.data);
                    await storeUserData(normalizedUserData);
                    setUser(normalizedUserData);
                    setIsLoggedIn(true);
                } else {
                    // No user data returned, fetch it using the user ID
                    await refreshUserData(userId);
                    setIsLoggedIn(true);
                }

                // Clear pending signup data after successful verification
                await clearPendingSignupData();

                return {
                    success: true,
                    message: data.message || 'OTP verified successfully! Welcome to Miragio!'
                };
            } else {
                return { success: false, message: data.message || 'Invalid OTP. Please try again.' };
            }

        } catch (error) {
            console.error('OTP verification error:', error);
            return { success: false, message: 'Network error. Please check your internet connection.' };
        } finally {
            setIsLoading(false);
        }
    };

    // ADDED: Resend OTP function
    const resendOTP = async (userId: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsLoading(true);

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "resend_otp", // Adjust action name as per your API
                    user_id: userId
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                return { success: true, message: data.message || 'OTP sent successfully!' };
            } else {
                return { success: false, message: data.message || 'Failed to resend OTP. Please try again.' };
            }

        } catch (error) {
            console.error('Resend OTP error:', error);
            return { success: false, message: 'Network error. Please check your internet connection.' };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await clearUserData();
            await clearPendingSignupData(); // Also clear pending data on logout
            setUser(null);
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh user data by ID
    const refreshUserData = async (userId?: string): Promise<void> => {
        try {
            const userIdToUse = userId || user?.id;
            if (!userIdToUse) {
                throw new Error('No user ID available');
            }

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "get_userdetails",
                    id: userIdToUse
                })
            });

            const data = await response.json();

            if (data.status === 'success' && data.data) {
                const normalizedUserData = normalizeUserData(data.data);
                await storeUserData(normalizedUserData);
                setUser(normalizedUserData);
            } else {
                console.error('Failed to refresh user data:', data.message);
            }

        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    // Update user data locally
    const updateUserData = (userData: Partial<UserData>): void => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            const normalizedUpdatedUser = normalizeUserData(updatedUser);
            setUser(normalizedUpdatedUser);
            storeUserData(normalizedUpdatedUser);
        }
    };

    // Store user data in AsyncStorage
    const storeUserData = async (userData: UserData): Promise<void> => {
        try {
            const normalizedUserData = normalizeUserData(userData);

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUserData)),
                AsyncStorage.setItem(STORAGE_KEYS.USER_ID, normalizedUserData.id),
                AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true')
            ]);
        } catch (error) {
            console.error('Error storing user data:', error);
            throw error;
        }
    };

    // Clear user data from AsyncStorage
    const clearUserData = async (): Promise<void> => {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
                AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
            ]);
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    };

    // ADDED: Store pending signup data
    const storePendingSignupData = async (signupData: SignupData, userId: string): Promise<void> => {
        try {
            setPendingSignupData(signupData);
            setPendingUserId(userId);

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.PENDING_SIGNUP_DATA, JSON.stringify(signupData)),
                AsyncStorage.setItem(STORAGE_KEYS.PENDING_USER_ID, userId)
            ]);
        } catch (error) {
            console.error('Error storing pending signup data:', error);
        }
    };

    // ADDED: Clear pending signup data
    const clearPendingSignupData = async (): Promise<void> => {
        try {
            setPendingSignupData(null);
            setPendingUserId(null);

            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP_DATA),
                AsyncStorage.removeItem(STORAGE_KEYS.PENDING_USER_ID)
            ]);
        } catch (error) {
            console.error('Error clearing pending signup data:', error);
        }
    };

    // Utility functions
    const getUserId = (): string | null => {
        return user?.id || null;
    };

    const getUserEmail = (): string | null => {
        return user?.email || null;
    };

    const getUserName = (): string | null => {
        return user?.username || null;
    };

    const getUserWallet = (): string | null => {
        return user?.wallet || null;
    };

    // Context value
    const value: UserContextType = {
        // State
        user,
        isLoggedIn,
        isAuthenticated: isLoggedIn,
        isLoading,

        // ADDED: Signup state
        pendingSignupData,
        pendingUserId,

        // Methods
        login,
        logout,

        // ADDED: Signup methods
        registerUser,
        verifyOTP,
        resendOTP,

        // User data methods
        refreshUserData,
        updateUserData,

        // ADDED: Signup data management
        storePendingSignupData,
        clearPendingSignupData,

        // Utilities
        getUserId,
        getUserEmail,
        getUserName,
        getUserWallet
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Export types for use in other components
export type { UserData, UserContextType, SignupData };
