import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../Screens/auth/Welcome';
import SignInScreen from '../Screens/auth/SignIn';
import SignUpScreen from '../Screens/auth/SignUp';
import KycScreen from '../Screens/auth/KYC';
import OtpScreen from '../Screens/auth/OTP';
import NewPasswordScreen from '../Screens/auth/NewPassword';
import ResetPasswordScreen from '../Screens/auth/ResetPassword';
import ResetSuccessScreen from '../Screens/auth/ResetSuccess';
import VerifyCodeScreen from '../Screens/auth/VerifyCode';
import KycSuccessScreen from '../Screens/auth/KYCSuccess';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Kyc" component={KycScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="ResetSuccess" component={ResetSuccessScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="KycSuccess" component={KycSuccessScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
