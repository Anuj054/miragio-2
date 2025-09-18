import React, { useState, useEffect, useCallback } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    BackHandler
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { icons } from '../../constants/index';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import CustomGradientButton from '../../components/CustomGradientButton';
import { useUser } from '../../context/UserContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const { width, height } = Dimensions.get('window');

const SignIn = ({ navigation }: Props) => {
    const { login } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        clearOldSignupCredentials();
    }, []);

    // ADDED: Handle back button properly
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (!isLoading) {
                    // Go back to Welcome instead of staying in auth loop
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                    });
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription?.remove();
        }, [navigation, isLoading])
    );

    const clearOldSignupCredentials = async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem('@signup_data'),
                AsyncStorage.removeItem('@registration_data'),
                AsyncStorage.removeItem('@new_account_credentials')
            ]);
            console.log('SignIn - Cleared old signup credentials');
        } catch (error) {
            console.error('SignIn - Error clearing old credentials:', error);
        }
    };

    const togglePasswordVisibility = () => {
        if (!isLoading) {
            setIsPasswordVisible(!isPasswordVisible);
        }
    };

    const validateForm = () => {
        if (!email.trim()) {
            setErrorMessage("Please enter your email");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage("Please enter a valid email address");
            return false;
        }

        if (!password.trim()) {
            setErrorMessage("Please enter your password");
            return false;
        }

        return true;
    };

    // FIXED: Navigation handlers
    const handleSignUpPress = () => {
        if (!isLoading) {
            navigation.replace('SignUp');
        }
    };

    const handleResetPasswordPress = () => {
        if (!isLoading) {
            navigation.navigate('ResetPassword');
        }
    };

    const handleBackPress = () => {
        if (!isLoading) {
            // Go back to Welcome to break the loop
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        }
    };

    // Login handler - Let UserContext handle navigation automatically
    const handleLogin = async () => {
        if (isLoading) return;

        setErrorMessage('');
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await login(email.trim(), password.trim());

            if (result.success) {
                setErrorMessage('Login successful! Redirecting...');

                // UserContext login() will set isAuthenticated = true
                // RootNavigator will automatically switch from Auth to Main stack
                console.log('Login successful, UserContext will handle navigation automatically');

            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 items-center justify-center">
            {/* Background Image */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
                style={{ width, height }}
            />

            {/* Back Button - responsive positioning */}
            <TouchableOpacity
                className="absolute flex items-center justify-center"
                style={{
                    left: width * 0.04,  // 4% from left
                    top: height * 0.06,  // 6% from top
                    width: width * 0.12, // Touch area
                    height: height * 0.06
                }}
                onPress={handleBackPress}
                disabled={isLoading}
            >
                {icons && (
                    <Image
                        source={icons.back}
                        style={{
                            width: width * 0.06,
                            height: width * 0.07
                        }}
                    />
                )}
            </TouchableOpacity>

            {/* Logo - responsive positioning */}
            <Image
                source={logo}
                style={{
                    position: 'absolute',
                    top: height * 0.21,  // 15% from top
                    width: width * 0.25,
                    height: width * 0.22
                }}
            />

            {/* Title - responsive text */}
            <Text
                style={{
                    color: Colors.light.whiteFfffff,
                    position: 'absolute',
                    top: height * 0.34,  // 25% from top
                    fontSize: width * 0.07,
                    lineHeight: width * 0.08
                }}
                className="font-extrabold text-center"
            >
                Sign in to your Account
            </Text>

            {/* Sign up navigation link - responsive */}
            <View
                className="flex flex-row absolute items-center"
                style={{
                    top: height * 0.40,  // 32% from top
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.04
                    }}
                    className="font-medium"
                >
                    Don't have an account ?
                </Text>
                <TouchableOpacity
                    onPress={handleSignUpPress}
                    disabled={isLoading}
                    className="ml-1"
                >
                    <Text
                        style={{
                            color: Colors.light.blueTheme,
                            opacity: isLoading ? 0.5 : 1,
                            fontSize: width * 0.045
                        }}
                        className="font-semibold"
                    >
                        SignUp
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Input Fields Container - responsive and compact */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.48,  // 42% from top (moved down slightly)
                    width: '100%',
                    paddingHorizontal: width * 0.02  // More horizontal padding
                }}
            >
                {/* Email Input - compact responsive */}
                <View
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        width: '100%',
                        maxWidth: width * 0.9,  // Slightly smaller max width
                        height: Math.max(48, height * 0.06),  // Min 48px, max 6% of height
                        borderRadius: 15,
                        marginBottom: height * 0.02  // 2% margin
                    }}
                    className="flex flex-row items-center"
                >
                    {icons && (
                        <Image
                            source={icons.mail}
                            style={{
                                width: width * 0.04,
                                height: width * 0.035,
                                marginLeft: width * 0.04,
                                marginRight: width * 0.03
                            }}
                        />
                    )}
                    <TextInput
                        style={{
                            backgroundColor: 'transparent',
                            color: Colors.light.blackPrimary,
                            flex: 1,
                            fontSize: Math.min(16, width * 0.035),  // Max 16px font
                            paddingRight: width * 0.04,
                            paddingVertical: 0  // Remove vertical padding
                        }}
                        placeholder="Enter Email or Phone Number"
                        placeholderTextColor={Colors.light.blackPrimary}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errorMessage) setErrorMessage("");
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                {/* Password Input - compact responsive */}
                <View
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        width: '100%',
                        maxWidth: width * 0.90,  // Slightly smaller max width
                        height: Math.max(48, height * 0.06),  // Min 48px, max 6% of height
                        borderRadius: 15
                    }}
                    className="flex flex-row items-center"
                >
                    {icons && (
                        <Image
                            source={icons.lock}
                            style={{
                                width: width * 0.04,
                                height: width * 0.048,
                                marginLeft: width * 0.04,
                                marginRight: width * 0.03
                            }}
                        />
                    )}
                    <TextInput
                        style={{
                            backgroundColor: 'transparent',
                            color: Colors.light.blackPrimary,
                            flex: 1,
                            fontSize: Math.min(16, width * 0.035),  // Max 16px font
                            paddingVertical: 0,  // Remove vertical padding
                            paddingRight: width * 0.13  // Space for eye icon
                        }}
                        placeholder="Enter Password"
                        placeholderTextColor={Colors.light.blackPrimary}
                        secureTextEntry={!isPasswordVisible}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errorMessage) setErrorMessage("");
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        className="absolute right-0 flex items-center justify-center"
                        style={{
                            width: width * 0.12,
                            height: '100%'
                        }}
                        onPress={togglePasswordVisibility}
                        disabled={isLoading}
                    >
                        {icons && (
                            <Image
                                source={isPasswordVisible ? icons.eyeopen : icons.eye}
                                style={{
                                    width: width * 0.04,
                                    height: width * 0.03,
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Error Message - responsive */}
                {errorMessage ? (
                    <View
                        style={{
                            marginTop: height * 0.015,
                            width: '100%',
                            maxWidth: width * 0.85
                        }}
                    >
                        <Text
                            style={{
                                color: errorMessage.includes('successful') ? '#10B981' : '#EF4444',
                                fontSize: width * 0.035
                            }}
                            className="text-center font-medium"
                        >
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Forgot Password - responsive positioning */}
            <View
                className="absolute"
                style={{
                    top: height * 0.65  // 58% from top (adjusted for compact inputs)
                }}
            >
                <TouchableOpacity
                    onPress={handleResetPasswordPress}
                    disabled={isLoading}
                    className="py-2 px-4"
                >
                    <Text
                        style={{
                            color: Colors.light.secondaryText,
                            opacity: isLoading ? 0.5 : 1,
                            fontSize: width * 0.035
                        }}
                        className="underline"
                    >
                        Forgot Your Password ?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Login Button - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.72,  // 64% from top (adjusted for compact inputs)
                    width: '100%',
                    paddingHorizontal: width * 0.08
                }}
            >
                <CustomGradientButton
                    text={isLoading ? "Signing In..." : "Login"}
                    width={Math.min(width * 0.85, 350)}  // Responsive width with max limit
                    height={Math.max(48, height * 0.06)}  // Min 48px, max 6% of height
                    fontWeight={600}
                    borderRadius={100}
                    fontSize={Math.min(18, width * 0.045)}  // Max 18px font
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleLogin}
                    disabled={isLoading}
                    style={{
                        opacity: isLoading ? 0.6 : 1,
                    }}
                />
            </View>

            {/* Footer - responsive positioning */}
            <View
                className="absolute items-center"
                style={{
                    bottom: height * 0.034  // 4% from bottom
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.07
                    }}
                    className="font-bold"
                >
                    MIRAGIO
                </Text>
            </View>
        </View>
    );
};

export default SignIn;