// Navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';

// Import all auth screens
import WelcomeScreen from '../Screens/auth/Welcome';
import SignInScreen from '../Screens/auth/SignIn';
import SignUpScreen from '../Screens/auth/SignUp';
import KycScreen from '../Screens/auth/KYC';
import UserDetailsScreen from '../Screens/auth/UserDetails';
import OtpScreen from '../Screens/auth/OTP';
import KycSuccessScreen from '../Screens/auth/KYCSuccess';
import ResetPasswordScreen from '../Screens/auth/ResetPassword';
import VerifyCodeScreen from '../Screens/auth/VerifyCode';

import ResetSuccessScreen from '../Screens/auth/ResetSuccess';

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
