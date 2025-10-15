import React, { useState, useEffect, useCallback } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    BackHandler,
    KeyboardAvoidingView,
    ScrollView,
    Platform
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

    // CORRECTED: Login handler with proper error handling
    const handleLogin = async () => {
        if (isLoading) return;

        setErrorMessage('');
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            console.log('🔄 Attempting login with:', email.trim());
            const result = await login(email.trim(), password.trim());

            console.log('📥 Login result:', result);

            if (result.success) {
                setErrorMessage(currentLanguage === 'hi' ? 'लॉगिन सफल! रीडायरेक्ट कर रहे हैं...' : 'Login successful! Redirecting...');
                console.log('✅ Login successful, UserContext will handle navigation automatically');

                // DO NOT NAVIGATE HERE - Let the authentication state change handle navigation
                // The RootNavigator will automatically switch to MainNavigator when isAuthenticated becomes true

            } else {
                // Login failed - show error and stay on SignIn screen
                const errorMsg = result.message || (currentLanguage === 'hi' ? 'अमान्य ईमेल या पासवर्ड' : 'Invalid email or password');
                setErrorMessage(errorMsg);
                console.log('❌ Login failed, showing error:', errorMsg);

                // CRITICAL: Do NOT call any navigation functions here
                // Stay on SignIn screen to show the error message
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            setErrorMessage(currentLanguage === 'hi' ? 'एक त्रुटि आई है। कृपया फिर से कोशिश करें।' : 'An error occurred. Please try again.');

            // CRITICAL: Do NOT call any navigation functions here either
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Background Image - Fixed */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000',
            }}>
                <Image
                    source={bg}
                    style={{
                        width: '100%',
                        height: '100%',
                        minWidth: width,
                        minHeight: height,
                    }}
                    resizeMode="cover"
                />
            </View>

            {/* Fixed Footer - Outside KeyboardAvoidingView */}
            <View
                style={{
                    position: 'absolute',
                    bottom: height * 0.034,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 1,
                    pointerEvents: 'none'
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

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ minHeight: height, paddingBottom: height * 0.12 }}>
                        {/* Back Button - responsive positioning */}
                        <TouchableOpacity
                            className="absolute flex items-center justify-center"
                            style={{
                                left: width * 0.04,
                                top: height * 0.06,
                                width: width * 0.12,
                                height: height * 0.06,
                                zIndex: 10
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
                        <View style={{
                            position: 'absolute',
                            top: height * 0.20,
                            left: '50%',
                            transform: [{ translateX: -(width * 0.25) / 2 }],
                            zIndex: 5
                        }}>
                            <Image
                                source={logo}
                                style={{
                                    width: width * 0.25,
                                    height: width * 0.22
                                }}
                            />
                        </View>

                        {/* Title - responsive text with translation */}
                        <View style={{
                            position: 'absolute',
                            top: height * 0.34,
                            width: '100%',
                            zIndex: 5
                        }}>
                            <TranslatedText
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.07,
                                    lineHeight: width * 0.1,
                                    textAlign: 'center'
                                }}
                                className="font-extrabold"
                            >
                                Sign in to your Account
                            </TranslatedText>
                        </View>

                        {/* Sign up navigation link - responsive with translation */}
                        <View
                            className="flex flex-row absolute items-center justify-center"
                            style={{
                                top: height * 0.40,
                                width: '100%',
                                paddingHorizontal: width * 0.04,
                                zIndex: 5
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
                            style={{
                                position: 'absolute',
                                top: height * 0.48,
                                width: '100%',
                                paddingHorizontal: width * 0.05,
                                zIndex: 5,
                                alignItems: 'center'
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
                                    marginBottom: height * 0.02,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
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
                                    borderRadius: 15,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
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
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        width: width * 0.12,
                                        height: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center'
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
                                            fontSize: width * 0.035,
                                            textAlign: 'center'
                                        }}
                                        className="font-medium"
                                    >
                                        {errorMessage}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Forgot Password - responsive positioning with translation */}
                        <View
                            style={{
                                position: 'absolute',
                                top: height * 0.65,
                                width: '100%',
                                alignItems: 'center',
                                zIndex: 5
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
                                        fontSize: width * 0.035,
                                        textDecorationLine: 'underline'
                                    }}
                                >
                                    Forgot Your Password ?
                                </TranslatedText>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button - responsive with translation */}
                        <View
                            style={{
                                position: 'absolute',
                                top: height * 0.72,
                                width: '100%',
                                paddingHorizontal: width * 0.05,
                                alignItems: 'center',
                                zIndex: 5
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignIn;
