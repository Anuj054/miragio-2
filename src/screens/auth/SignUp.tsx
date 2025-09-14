import React, { useState, useEffect } from 'react';
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
import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Colors } from '../../constants/Colors';
import { icons } from '../../constants/index';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import CustomGradientButton from '../../components/CustomGradientButton';
import type { AuthStackParamList } from '../../Navigation/types';

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
        <View className="flex-1 items-center">
            {/* Background Image */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
                style={{ width, height }}
            />

            {/* Header Section with Logo */}
            <View className="absolute flex items-center w-full">
                {/* FIXED: Back button */}
                <TouchableOpacity
                    className="absolute flex left-[10px] top-[105px]"
                    onPress={handleBackPress}
                    disabled={isLoading}
                >
                    {icons && (
                        <Image source={icons.back} className="w-[25px] h-[30px] mx-4" />
                    )}
                </TouchableOpacity>

                {/* Miragio logo */}
                <Image
                    source={logo}
                    className="top-[80px] w-[100px] h-[85px]"
                />
            </View>

            {/* Page Title */}
            <Text
                style={{ color: Colors.light.whiteFfffff }}
                className="absolute top-[210px] font-extrabold text-3xl"
            >
                Create An Account
            </Text>

            {/* Input Fields Section */}
            <View className="absolute top-[290px]">
                {/* Email input field */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center justify-start w-[370px] h-[56px] rounded-[15px] mb-5"
                >
                    <TextInput
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary
                        }}
                        className="ml-5 w-[300px] h-[56px]"
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

                {/* Password input field with visibility toggle */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5"
                >
                    <TextInput
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary
                        }}
                        className="w-[300px] ml-5 h-[56px]"
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
                        className="absolute right-3 h-[56px] flex justify-center items-center"
                        onPress={togglePasswordVisibility}
                        disabled={isLoading}
                    >
                        {icons && (
                            <Image
                                source={isPasswordVisible ? icons.eyeopen : icons.eye}
                                className="w-[16px] h-[12px] mx-4"
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Confirm password input field with visibility toggle */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5"
                >
                    <TextInput
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary
                        }}
                        className="w-[300px] h-[56px] ml-5"
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
                        className="absolute right-3 h-[56px] flex items-center justify-center"
                        onPress={toggleConfirmPasswordVisibility}
                        disabled={isLoading}
                    >
                        {icons && (
                            <Image
                                source={isConfirmPasswordVisible ? icons.eyeopen : icons.eye}
                                className="w-[16px] h-[12px] mx-4"
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Referral code input field */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center justify-start w-[370px] h-[56px] rounded-[15px]"
                >
                    <TextInput
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary
                        }}
                        className="ml-5 w-[300px] h-[56px]"
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

                {/* Error message display */}
                {errorMessage ? (
                    <View className="w-[370px] mt-1 px-4">
                        <Text
                            style={{ color: '#EF4444' }}
                            className="text-center text-sm font-medium"
                        >
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Next Button Section */}
            <View className="absolute top-[600px]">
                <CustomGradientButton
                    text={isLoading ? "Saving..." : "Next"}
                    width={370}
                    height={56}
                    borderRadius={28}
                    fontSize={18}
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
            <View className="absolute top-[680px] flex flex-row items-start justify-start w-full">
                <CheckBox
                    value={isChecked}
                    onValueChange={(value) => {
                        setChecked(value);
                        if (errorMessage) setErrorMessage("");
                    }}
                    style={{
                        marginTop: 3,
                        marginRight: 5,
                        height: 25,
                        width: 25,
                        marginLeft: 30
                    }}
                    tintColors={{ true: Colors.light.blueTheme, false: Colors.light.whiteFfffff }}
                    disabled={isLoading}
                />

                <View className="flex flex-col">
                    <View className='flex flex-row ml-3'>
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="flex font-semibold text-lg"
                        >
                            I agree to
                            <Text className="font-bold"> MIRAGIO</Text>
                        </Text>
                        <TouchableOpacity>
                            <Text
                                style={{ color: Colors.light.blueTheme }}
                                className="text-xl font-bold"
                            >
                                {' '}terms &
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text
                        style={{ color: Colors.light.blueTheme }}
                        className="text-xl font-bold pl-2"> conditions</Text>
                </View>
            </View>

            {/* FIXED: Sign In Navigation Link */}
            <View className="absolute top-[780px] flex flex-row">
                <Text
                    style={{ color: Colors.light.whiteFfffff }}
                    className="px-1 text-xl font-semibold"
                >
                    Already have an account ?
                </Text>
                <TouchableOpacity
                    onPress={handleSignInPress}
                    disabled={isLoading}
                >
                    <Text
                        style={{ color: Colors.light.blueTheme }}
                        className="px-1 text-xl font-bold"
                    >
                        Login
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer Brand Name */}
            <View className="absolute bottom-8">
                <Text
                    style={{ color: Colors.light.whiteFfffff }}
                    className="text-3xl font-bold"
                >
                    MIRAGIO
                </Text>
            </View>
        </View>
    );
};

export default SignUp;
