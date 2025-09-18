import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    BackHandler,
    ScrollView
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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const { width, height } = Dimensions.get('window');

const SignUp = ({ navigation }: Props) => {
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

    // Clear all signup-related data when component mounts (fresh start)
    useEffect(() => {
        clearAllSignupData();
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

    // Validate form inputs
    const validateForm = () => {
        if (!email.trim()) {
            setErrorMessage("Please enter your email");
            return false;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage("Please enter a valid email address");
            return false;
        }

        if (!password.trim()) {
            setErrorMessage("Please enter a password");
            return false;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long");
            return false;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return false;
        }

        if (!isChecked) {
            setErrorMessage("Please accept terms and conditions");
            return false;
        }

        return true;
    };

    // FIXED: Navigation handlers
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
            const signupData = {
                email: email.trim(),
                password: password,
                referral_code: referralCode.trim() || "",
                user_role: "user",
                status: "1",
            };

            await AsyncStorage.setItem('@signup_data', JSON.stringify(signupData));
            console.log('SignUp - Stored data:', signupData);

            // Navigate to KYC page directly
            navigation.navigate('KYC');

        } catch (error) {
            console.error('Error storing signup data:', error);
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ minHeight: height }}
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-1 items-center">
                {/* Background Image */}
                <Image
                    source={bg}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                    style={{ width, height }}
                />

                {/* Back Button - responsive positioning */}
                <TouchableOpacity
                    className="absolute flex items-center justify-center"
                    style={{
                        left: width * 0.04,  // 4% from left
                        top: height * 0.09,  // 6% from top
                        width: width * 0.12, // Touch area
                        height: height * 0.06,
                        zIndex: 10
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
                        top: height * 0.08,  // 8% from top
                        width: width * 0.25,
                        height: width * 0.22
                    }}
                />

                {/* Title - responsive text */}
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        position: 'absolute',
                        top: height * 0.23,  // 18% from top
                        fontSize: width * 0.07,
                        lineHeight: width * 0.08
                    }}
                    className="font-extrabold text-center"
                >
                    Create An Account
                </Text>

                {/* Input Fields Container - responsive */}
                <View
                    className="absolute items-center"
                    style={{
                        top: height * 0.32,  // 26% from top
                        width: '100%',
                        paddingHorizontal: width * 0.05
                    }}
                >
                    {/* Email Input - responsive */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022
                        }}
                        className="flex flex-row items-center"
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
                            placeholder="Enter Email"
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

                    {/* Password Input - responsive */}
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
                            placeholder="Enter Password"
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
                                        height: width * 0.03
                                    }}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input - responsive */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022
                        }}
                        className="flex flex-row items-center"
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
                            placeholder="Confirm Password"
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
                            className="absolute right-0 flex items-center justify-center"
                            style={{
                                width: width * 0.12,
                                height: '100%'
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

                    {/* Referral Code Input - responsive */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15
                        }}
                        className="flex flex-row items-center"
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
                            placeholder="Enter Referral Code (Optional)"
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
                                marginTop: height * 0.015,
                                width: '100%',
                                maxWidth: width * 0.85
                            }}
                        >
                            <Text
                                style={{
                                    color: '#EF4444',
                                    fontSize: width * 0.030
                                }}
                                className="text-center font-medium"
                            >
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Terms and Conditions Section - responsive */}
                <View
                    className="absolute flex flex-row items-start w-full"
                    style={{
                        top: height * 0.756,  // 58% from top
                        paddingHorizontal: width * 0.08
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

                    <View className="flex flex-col flex-1">
                        <View className='flex flex-row flex-wrap'>
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.047
                                }}
                                className="font-semibold"
                            >
                                I agree to
                                <Text className="font-bold"> MIRAGIO</Text>
                            </Text>
                            <TouchableOpacity>
                                <Text
                                    style={{
                                        color: Colors.light.blueTheme,
                                        fontSize: width * 0.04
                                    }}
                                    className="font-bold"
                                >
                                    {' '}terms &
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
                            conditions
                        </Text>
                    </View>
                </View>

                {/* Next Button - responsive */}
                <View
                    className="absolute items-center"
                    style={{
                        top: height * 0.67,  // 68% from top
                        width: '100%',
                        paddingHorizontal: width * 0.02
                    }}
                >
                    <CustomGradientButton
                        text={isLoading ? "Saving..." : "Next"}
                        width={Math.min(width * 0.9, 370)}
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

                {/* Sign In Navigation Link - responsive */}
                <View
                    className="absolute flex flex-row items-center"
                    style={{
                        top: height * 0.85,  // 78% from top
                        paddingHorizontal: width * 0.04
                    }}
                >
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.05
                        }}
                        className="font-semibold"
                    >
                        Already have an account ?
                    </Text>
                    <TouchableOpacity
                        onPress={handleSignInPress}
                        disabled={isLoading}
                        className="ml-1"
                    >
                        <Text
                            style={{
                                color: Colors.light.blueTheme,
                                fontSize: width * 0.045
                            }}
                            className="font-bold"
                        >
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Brand Name - responsive */}
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
        </ScrollView>
    );
};

export default SignUp;