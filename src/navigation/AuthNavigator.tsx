// Navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';

// Import all auth screens
import WelcomeScreen from '../screens/auth/Welcome';
import SignInScreen from '../screens/auth/SignIn';
import SignUpScreen from '../screens/auth/SignUp';
import KycScreen from '../screens/auth/KYC';
import UserDetailsScreen from '../screens/auth/UserDetails';
import OtpScreen from '../screens/auth/OTP';
import KycSuccessScreen from '../screens/auth/KYCSuccess';
import ResetPasswordScreen from '../screens/auth/ResetPassword';
import VerifyCodeScreen from '../screens/auth/VerifyCode';
import ResetSuccessScreen from '../screens/auth/ResetSuccess';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'none' // REMOVED: slide_from_right animation
            }}
        >
            {/* Landing & Main Auth */}
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />

            {/* Registration/KYC Flow */}
            <Stack.Screen name="KYC" component={KycScreen} />
            <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen
                name="KycSuccess"
                component={KycSuccessScreen}
                options={{ gestureEnabled: false }}
            />

            {/* Password Reset Flow */}
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />

            <Stack.Screen name="ResetSuccess" component={ResetSuccessScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
