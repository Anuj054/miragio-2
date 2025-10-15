import React, { useState, useEffect, useRef } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    BackHandler,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Colors } from '../../constants/Colors';
import { icons } from '../../constants/index';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import CustomGradientButton from '../../components/CustomGradientButton';
import type { AuthStackParamList } from '../../navigation/types';
// Translation imports - USING OUR CUSTOM COMPONENTS
import { TranslatedText } from '../../components/TranslatedText';
import { useTranslation } from '../../context/TranslationContext';
import { usePlaceholder } from '../../hooks/useTranslatedText';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const { width, height } = Dimensions.get('window');

const SignUp = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);

    // State for password visibility toggles
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    // State for terms and conditions checkbox
    const [isChecked, setChecked] = useState(false);

    // State for form inputs - START EMPTY
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");

    // State for error message and loading
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Using our custom placeholder hooks
    const emailPlaceholder = usePlaceholder('Enter Email', 'ईमेल दर्ज करें');

    useEffect(() => {
        clearAllSignupData();
    }, []);

    // Handle back button properly
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

    const clearAllSignupData = async () => {
        try {
            // Clear all signup-related storage when starting fresh
            await Promise.all([
                AsyncStorage.removeItem('@signup_data'),
                AsyncStorage.removeItem('@registration_data'),
                AsyncStorage.removeItem('@new_account_credentials')
            ]);
            console.log('SignUp - Started with clean slate');
        } catch (error) {
            console.error('SignUp - Error clearing old data:', error);
        }
    };

    // Toggle password visibility for main password field
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    // Toggle password visibility for confirm password field
    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    // Validate form inputs with translation
    const validateForm = () => {
        if (!email.trim()) {
            setErrorMessage(currentLanguage === 'hi' ? "कृपया अपना ईमेल दर्ज करें" : "Please enter your email");
            return false;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage(currentLanguage === 'hi' ? "कृपया वैध ईमेल पता दर्ज करें" : "Please enter a valid email address");
            return false;
        }

        if (!password.trim()) {
            setErrorMessage(currentLanguage === 'hi' ? "कृपया पासवर्ड दर्ज करें" : "Please enter a password");
            return false;
        }

        if (password.length < 6) {
            setErrorMessage(currentLanguage === 'hi' ? "पासवर्ड कम से कम 6 अक्षर का होना चाहिए" : "Password must be at least 6 characters long");
            return false;
        }

        if (password !== confirmPassword) {
            setErrorMessage(currentLanguage === 'hi' ? "पासवर्ड मैच नहीं करते" : "Passwords do not match");
            return false;
        }

        if (!isChecked) {
            setErrorMessage(currentLanguage === 'hi' ? "कृपया नियम और शर्तों को स्वीकार करें" : "Please accept terms and conditions");
            return false;
        }

        return true;
    };

    // Navigation handlers
    const handleBackPress = () => {
        // Go back to Welcome to break the loop
        if (!isLoading) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        }
    };

    const handleSignInPress = () => {
        // Use replace instead of navigate to prevent stack accumulation
        if (!isLoading) {
            navigation.replace('SignIn');
        }
    };

    // Handle next button press - store data and navigate to KYC
    const handleNextPress = async () => {
        if (isLoading) return;

        // Clear previous error
        setErrorMessage("");

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Store signup data in AsyncStorage
            // UPDATED: Ensure referral code is properly handled as optional
            const signupData = {
                email: email.trim(),
                password: password,
                referral_code: referralCode.trim() || "", // Empty string if no referral code
                user_role: "user",
                status: "1",
            };

            await AsyncStorage.setItem('@signup_data', JSON.stringify(signupData));
            console.log('SignUp - Stored data:', signupData);

            // Navigate to KYC page directly
            navigation.navigate('KYC');

        } catch (error) {
            console.error('Error storing signup data:', error);
            setErrorMessage(currentLanguage === 'hi' ? "कुछ गलत हुआ। कृपया फिर से कोशिश करें।" : "Something went wrong. Please try again.");
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
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={{ minHeight: height, paddingHorizontal: width * 0.05, paddingBottom: height * 0.15 }}>
                        {/* Back Button - responsive positioning */}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                left: width * 0.04,
                                top: height * 0.09,
                                width: width * 0.12,
                                height: height * 0.06,
                                zIndex: 10,
                                alignItems: 'center',
                                justifyContent: 'center'
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
                            alignItems: 'center',
                            marginTop: height * 0.08,
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

                        {/* Title - USING TranslatedText */}
                        <View style={{
                            alignItems: 'center',
                            marginTop: height * 0.04,
                            marginBottom: height * 0.04,
                            zIndex: 5
                        }}>
                            <TranslatedText
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.07,
                                    lineHeight: width * 0.09,
                                    textAlign: 'center'
                                }}
                                className="font-extrabold"
                            >
                                Create An Account
                            </TranslatedText>
                        </View>

                        {/* Form Container */}
                        <View style={{ alignItems: 'center', zIndex: 5 }}>
                            {/* Email Input - responsive with translation */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                    marginBottom: height * 0.022,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <TextInput
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: Colors.light.blackPrimary,
                                        flex: 1,
                                        fontSize: Math.min(16, width * 0.035),
                                        paddingHorizontal: width * 0.04,
                                        paddingVertical: 0
                                    }}
                                    placeholder={emailPlaceholder}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Password Input - responsive with translation */}
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
                                <TextInput
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: Colors.light.blackPrimary,
                                        flex: 1,
                                        fontSize: Math.min(16, width * 0.035),
                                        paddingLeft: width * 0.04,
                                        paddingRight: width * 0.13,
                                        paddingVertical: 0
                                    }}
                                    placeholder={currentLanguage === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter Password'}
                                    secureTextEntry={!isPasswordVisible}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    autoCapitalize="none"
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
                                                height: width * 0.03
                                            }}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password Input - responsive with translation */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                    marginBottom: height * 0.022,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <TextInput
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: Colors.light.blackPrimary,
                                        flex: 1,
                                        fontSize: Math.min(16, width * 0.035),
                                        paddingLeft: width * 0.04,
                                        paddingRight: width * 0.13,
                                        paddingVertical: 0
                                    }}
                                    placeholder={currentLanguage === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    autoCapitalize="none"
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
                                    onPress={toggleConfirmPasswordVisibility}
                                    disabled={isLoading}
                                >
                                    {icons && (
                                        <Image
                                            source={isConfirmPasswordVisible ? icons.eyeopen : icons.eye}
                                            style={{
                                                width: width * 0.04,
                                                height: width * 0.03
                                            }}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Referral Code Input - with translation */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                    marginBottom: height * 0.03,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <TextInput
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: Colors.light.blackPrimary,
                                        flex: 1,
                                        fontSize: Math.min(16, width * 0.035),
                                        paddingHorizontal: width * 0.04,
                                        paddingVertical: 0
                                    }}
                                    placeholder={currentLanguage === 'hi' ? 'रेफरल कोड (वैकल्पिक)' : 'Referral Code (Optional)'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={referralCode}
                                    onChangeText={(text) => {
                                        setReferralCode(text);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    autoCapitalize="characters"
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Error Message - responsive */}
                            {errorMessage ? (
                                <View
                                    style={{
                                        marginBottom: height * 0.02,
                                        width: '100%',
                                        maxWidth: width * 0.85
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#EF4444',
                                            fontSize: width * 0.030,
                                            textAlign: 'center'
                                        }}
                                        className="font-medium"
                                    >
                                        {errorMessage}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Next Button */}
                            <View style={{ alignItems: 'center', marginBottom: height * 0.03 }}>
                                <CustomGradientButton
                                    text={isLoading ? (currentLanguage === 'hi' ? "सेव कर रहे हैं..." : "Saving...") : (currentLanguage === 'hi' ? "अगला" : "Next")}
                                    width={Math.min(width * 0.9, 500)}
                                    height={Math.max(48, height * 0.06)}
                                    borderRadius={28}
                                    fontSize={Math.min(18, width * 0.045)}
                                    fontWeight="600"
                                    onPress={handleNextPress}
                                    disabled={!isChecked || isLoading}
                                    textColor={isChecked ? Colors.light.whiteFfffff : Colors.light.secondaryText}
                                    style={{
                                        opacity: isChecked && !isLoading ? 1 : 0.6,
                                    }}
                                />
                            </View>

                            {/* Terms and Conditions Section */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    paddingHorizontal: width * 0.02,
                                    marginBottom: height * 0.03,
                                    width: '100%',
                                    maxWidth: width * 0.9
                                }}
                            >
                                <CheckBox
                                    value={isChecked}
                                    onValueChange={(value) => {
                                        setChecked(value);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    style={{
                                        marginTop: 3,
                                        marginRight: width * 0.02,
                                        height: Math.max(20, width * 0.06),
                                        width: Math.max(20, width * 0.06)
                                    }}
                                    tintColors={{ true: Colors.light.blueTheme, false: Colors.light.whiteFfffff }}
                                    disabled={isLoading}
                                />

                                <View style={{ flex: 1, flexDirection: 'column' }}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.047
                                            }}
                                            className="font-semibold"
                                        >
                                            {currentLanguage === 'hi' ? 'मैं सहमत हूं' : 'I agree to'}
                                            <Text className="font-bold"> MIRAGIO</Text>
                                        </Text>
                                        <TouchableOpacity>
                                            <Text
                                                style={{
                                                    color: Colors.light.blueTheme,
                                                    fontSize: width * 0.047
                                                }}
                                                className="font-bold"
                                            >
                                                {currentLanguage === 'hi' ? ' नियम और' : ' terms &'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text
                                        style={{
                                            color: Colors.light.blueTheme,
                                            fontSize: width * 0.047
                                        }}
                                        className="font-bold"
                                    >
                                        {currentLanguage === 'hi' ? 'शर्तें से' : 'conditions'}
                                    </Text>
                                </View>
                            </View>

                            {/* Sign In Navigation Link */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingHorizontal: width * 0.02,
                                    marginBottom: height * 0.05,
                                    width: '100%'
                                }}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.05
                                    }}
                                    className="font-semibold"
                                >
                                    {currentLanguage === 'hi' ? 'क्या आपके पास पहले से खाता है?' : 'Already have an account ?'}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleSignInPress}
                                    disabled={isLoading}
                                    style={{ marginLeft: 4 }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.blueTheme,
                                            fontSize: width * 0.045
                                        }}
                                        className="font-bold"
                                    >
                                        {currentLanguage === 'hi' ? 'लॉगिन' : 'Login'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignUp;
