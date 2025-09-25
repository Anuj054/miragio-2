// Navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Navigator - Top level
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack - All authentication screens
// In Navigation/types.ts - Update AuthStackParamList
// Alternative approach - more explicit
export type AuthStackParamList = {
    Welcome: undefined;
    SignIn: undefined;
    SignUp: undefined;
    KYC: undefined;
    UserDetails: undefined;
    Otp: { userId?: string | any }; // UPDATED: Explicitly allow undefined
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
    // ADDED: All More/Settings screens to Main Stack
    MorePagesScreen: undefined;
    // Updates folder screens
    PlayMusicSettings: undefined;
    AccountSecurity: undefined;
    NewUpdates: undefined;
    // Help folder screens
    ReferFriends: undefined;
    HowToPlay: undefined;
    ResponsibleGaming: undefined;
    FairPlay: undefined;
    HelpDesk: undefined;
    SystemStatus: undefined;
    // System folder screens
    PrivacyPolicy: undefined;
    RNGCertification: undefined;
    Careers: undefined;
    AboutUs: undefined;
    TermsOfUse: undefined;
    Legality: undefined;

};

// Tab Navigator
export type TabParamList = {
    TaskTab: NavigatorScreenParams<TaskStackParamList>;
    WalletTab: NavigatorScreenParams<WalletStackParamList>;
    MoreTab: NavigatorScreenParams<MoreStackParamList>;
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
    FAQ: undefined;
    TdsSummary: undefined;
};

// ADDED: More Stack for settings pages
export type MoreStackParamList = {
    MorePage: undefined;
};
