// Navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Navigator - Top level
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack - All authentication screens
export type AuthStackParamList = {
    Welcome: undefined;
    SignIn: undefined;
    SignUp: undefined;
    KYC: undefined;
    UserDetails: undefined;
    Otp: undefined;
    KycSuccess: undefined;
    ResetPassword: undefined;
    VerifyCode: { email?: string };
    NewPassword: { token?: string };
    ResetSuccess: undefined;
};

// Main Stack - After authentication
export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList>;
    UserProfile: { from?: string };
    EditProfile: { from?: string };
};

// Tab Navigator
export type TabParamList = {
    TaskTab: NavigatorScreenParams<TaskStackParamList>;
    WalletTab: NavigatorScreenParams<WalletStackParamList>;
    MoreTab: undefined;
};

// Task Stack
export type TaskStackParamList = {
    TaskPage: undefined;
    TaskDetails: { taskId?: string };
    TaskSuccessful: {};
    Instructions: { taskId?: string };
};

// Wallet Stack
export type WalletStackParamList = {
    WalletPage: undefined;
    Transactions: undefined;
    Withdraw: undefined;
};
