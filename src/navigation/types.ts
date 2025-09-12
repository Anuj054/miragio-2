// In your Navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

// App-level navigator (highest level)
export type AppStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<TabParamList>;
};

// Tab Navigator Types  
export type TabParamList = {
    TaskTab: NavigatorScreenParams<TaskStackParamList>;
    ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
    WalletTab: NavigatorScreenParams<WalletStackParamList>;
    MoreTab: undefined;
};

// Auth Stack Types (remove root reference)
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
    Main: NavigatorScreenParams<TabParamList>; // Add this for navigation
};

// Rest of your types remain the same...
export type TaskStackParamList = {
    TaskPage: undefined;
    TaskDetails: undefined;
    TaskSuccessful: undefined;
    Instructions: undefined;
};

export type ProfileStackParamList = {
    UserProfile: undefined;
    EditProfile: undefined;
};

export type WalletStackParamList = {
    WalletPage: undefined;
    Transactions: undefined;
    Withdraw: undefined;
};
