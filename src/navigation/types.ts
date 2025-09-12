// In your Navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

// App-level navigator (highest level) - ADD UserProfile here
export type AppStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<TabParamList>;
    UserProfile: { from?: string };
    EditProfile: { from?: string };
};

// Tab Navigator Types  
export type TabParamList = {
    TaskTab: NavigatorScreenParams<TaskStackParamList>;
    WalletTab: NavigatorScreenParams<WalletStackParamList>;
    MoreTab: undefined;
};

// Auth Stack Types
export type AuthStackParamList = {
    Welcome: undefined;
    SignIn: undefined;
    SignUp: undefined;
    Kyc: undefined;
    Otp: undefined;
    NewPassword: undefined;
    ResetPassword: undefined;
    ResetSuccess: undefined;
    VerifyCode: undefined;
    KycSuccess: undefined;
    Main: NavigatorScreenParams<TabParamList>;
};

// Task Stack Types
export type TaskStackParamList = {
    TaskPage: undefined;
    TaskDetails: undefined;
    TaskSuccessful: undefined;
    Instructions: undefined;
};

// Wallet Stack Types (REMOVE UserProfile from here)
export type WalletStackParamList = {
    WalletPage: undefined;
    Transactions: undefined;
    Withdraw: undefined;
};
