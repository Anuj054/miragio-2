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
// Translation imports
import { TranslatedText } from '../../components/TranslatedText';
import { useTranslation } from '../../context/TranslationContext';
import { usePlaceholder } from '../../hooks/useTranslatedText';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const { width, height } = Dimensions.get('window');

const SignIn = ({ navigation }: Props) => {
    const { login } = useUser();
    const { currentLanguage } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Translated placeholders
    const emailPlaceholder = usePlaceholder('Enter Email or Phone Number', 'ईमेल या फोन नंबर दर्ज करें');
    const passwordPlaceholder = usePlaceholder('Enter Password', 'पासवर्ड दर्ज करें');

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
            setErrorMessage(currentLanguage === 'hi' ? "कृपया अपना ईमेल दर्ज करें" : "Please enter your email");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage(currentLanguage === 'hi' ? "कृपया वैध ईमेल पता दर्ज करें" : "Please enter a valid email address");
            return false;
        }

        if (!password.trim()) {
            setErrorMessage(currentLanguage === 'hi' ? "कृपया अपना पासवर्ड दर्ज करें" : "Please enter your password");
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
                setErrorMessage(currentLanguage === 'hi' ? 'लॉगिन सफल! रीडायरेक्ट कर रहे हैं...' : 'Login successful! Redirecting...');

                // UserContext login() will set isAuthenticated = true
                // RootNavigator will automatically switch from Auth to Main stack
                console.log('Login successful, UserContext will handle navigation automatically');

            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(currentLanguage === 'hi' ? 'एक त्रुटि आई है। कृपया फिर से कोशिश करें।' : 'An error occurred. Please try again.');
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
                    top: height * 0.20,  // 15% from top
                    width: width * 0.25,
                    height: width * 0.22
                }}
            />

            {/* Title - responsive text with translation */}
            <TranslatedText
                style={{
                    color: Colors.light.whiteFfffff,
                    position: 'absolute',
                    top: height * 0.34,  // 25% from top
                    fontSize: width * 0.07,
                    lineHeight: width * 0.1,
                    width: width * 1
                }}
                className="font-extrabold text-center"
            >
                Sign in to your Account
            </TranslatedText>

            {/* Sign up navigation link - responsive with translation */}
            <View
                className="flex flex-row absolute items-center"
                style={{
                    top: height * 0.40,  // 32% from top
                    paddingHorizontal: width * 0.04
                }}
            >
                <TranslatedText
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.04
                    }}
                    className="font-medium"
                >
                    Don't have an account ?
                </TranslatedText>
                <TouchableOpacity
                    onPress={handleSignUpPress}
                    disabled={isLoading}
                    className="ml-1"
                >
                    <TranslatedText
                        style={{
                            color: Colors.light.blueTheme,
                            opacity: isLoading ? 0.5 : 1,
                            fontSize: width * 0.045
                        }}
                        className="font-semibold"
                    >
                        SignUp
                    </TranslatedText>
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
                        maxWidth: width * 0.9,
                        height: Math.max(48, height * 0.06),
                        borderRadius: 15,
                        marginBottom: height * 0.02
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
                            fontSize: Math.min(16, width * 0.035),
                            paddingRight: width * 0.04,
                            paddingVertical: 0
                        }}
                        placeholder={emailPlaceholder}
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
                        maxWidth: width * 0.90,
                        height: Math.max(48, height * 0.06),
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
                            fontSize: Math.min(16, width * 0.035),
                            paddingVertical: 0,
                            paddingRight: width * 0.13
                        }}
                        placeholder={passwordPlaceholder}
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

            {/* Forgot Password - responsive positioning with translation */}
            <View
                className="absolute"
                style={{
                    top: height * 0.65
                }}
            >
                <TouchableOpacity
                    onPress={handleResetPasswordPress}
                    disabled={isLoading}
                    className="py-2 px-4"
                >
                    <TranslatedText
                        style={{
                            color: Colors.light.secondaryText,
                            opacity: isLoading ? 0.5 : 1,
                            fontSize: width * 0.035
                        }}
                        className="underline"
                    >
                        Forgot Your Password ?
                    </TranslatedText>
                </TouchableOpacity>
            </View>

            {/* Login Button - responsive with translation */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.72,
                    width: '100%',
                    paddingHorizontal: width * 0.01
                }}
            >
                <CustomGradientButton
                    text={isLoading ? (currentLanguage === 'hi' ? "साइन इन कर रहे हैं..." : "Signing In...") : (currentLanguage === 'hi' ? "लॉगिन" : "Login")}
                    width={Math.min(width * 0.9, 500)}
                    height={Math.max(48, height * 0.06)}
                    fontWeight={600}
                    borderRadius={100}
                    fontSize={Math.min(18, width * 0.045)}
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
                    bottom: height * 0.034
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