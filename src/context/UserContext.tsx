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
    wallet: string; // Added wallet balance to user data
    status: string;
    created_at: string;
    // NEW FIELDS TO MATCH API:
    instagram_username?: string;
    upi?: string;
    pan_number?: string;
}

interface LoginResponse {
    status: string;
    message: string;
    data: UserData;
}

interface UserContextType {
    // User state
    user: UserData | null;
    isLoggedIn: boolean;
    isLoading: boolean;

    // Authentication methods
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;

    // User data methods
    refreshUserData: () => Promise<void>;
    updateUserData: (userData: Partial<UserData>) => void;

    // Utility methods
    getUserId: () => string | null;
    getUserEmail: () => string | null;
    getUserName: () => string | null;
    getUserWallet: () => string | null; // Added wallet getter
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
    USER_DATA: '@user_data',
    USER_ID: '@user_id',
    IS_LOGGED_IN: '@is_logged_in'
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
        // NEW FIELDS:
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

    // Initialize user data on app start
    useEffect(() => {
        initializeUser();
    }, []);

    // Initialize user from storage
    const initializeUser = async () => {
        try {
            setIsLoading(true);

            const [storedUserData, storedLoginStatus] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
                AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN)
            ]);

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

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await clearUserData();
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
            // Ensure userData is normalized before storing
            const normalizedUserData = normalizeUserData(userData);

            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUserData)),
                AsyncStorage.setItem(STORAGE_KEYS.USER_ID, normalizedUserData.id), // Now guaranteed to be a string
                AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true')
            ]);
        } catch (error) {
            console.error('Error storing user data:', error);
            throw error; // Re-throw to handle in calling functions if needed
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

    // Added wallet balance getter
    const getUserWallet = (): string | null => {
        return user?.wallet || null;
    };

    // Context value
    const value: UserContextType = {
        // State
        user,
        isLoggedIn,
        isLoading,

        // Methods
        login,
        logout,
        refreshUserData,
        updateUserData,

        // Utilities
        getUserId,
        getUserEmail,
        getUserName,
        getUserWallet // Added wallet getter
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
export type { UserData, UserContextType };