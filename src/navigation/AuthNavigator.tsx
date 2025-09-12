import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/welcome';
import SignInScreen from '../screens/auth/signIn';
import SignUpScreen from '../screens/auth/signUp';
import KycScreen from '../screens/auth/kyc';
import OtpScreen from '../screens/auth/Otp';
import NewPasswordScreen from '../screens/auth/newpassword';
import ResetPasswordScreen from '../screens/auth/resetpassword';
import ResetSuccessScreen from '../screens/auth/resetsuccess';
import VerifyCodeScreen from '../screens/auth/verifycode';
import KycSuccessScreen from '../screens/auth/kycsuccess';


const Stack = createNativeStackNavigator();

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
