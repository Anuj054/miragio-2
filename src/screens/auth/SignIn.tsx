import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { icons } from '../../constants/index';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import CustomGradientButton from '../../components/CustomGradientButton';
import { useUser } from '../../context/UserContext';
import type { AuthStackParamList } from '../../Navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const { width, height } = Dimensions.get('window');

const SignIn = ({ navigation }: Props) => {
    // Get login function from context
    const { login } = useUser();

    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for password visibility toggle
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // State for error message
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Clear old signup credentials when SignIn component mounts
    useEffect(() => {
        clearOldSignupCredentials();
    }, []);

    const clearOldSignupCredentials = async () => {
        try {
            // Clear any leftover signup credentials when user manually goes to login
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

    // Toggle password visibility function
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
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
            setErrorMessage("Please enter your password");
            return false;
        }

        return true;
    };

    // Handle navigation functions
    const handleSignUpPress = () => {
        navigation.replace('SignUp');
    };

    const handleResetPasswordPress = () => {
        navigation.replace('ResetPassword');
    };

    const handleTaskPageNavigation = () => {
        // Navigate to main app - adjust based on your actual navigation structure
        // Option 1: If you have a separate main stack
        // navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });

        // Option 2: If TaskPage is directly in auth stack
        navigation.navigate('TaskPage'); // Adjust to your actual route name

        // Option 3: If you need to go to a nested navigator
        // navigation.navigate('MainTabs', { screen: 'TaskPage' });
    };

    // Handle login using context
    const handleLogin = async () => {
        // Clear previous error
        if (isLoading) return;
        setErrorMessage('');

        if (!validateForm()) return;
        setIsLoading(true);

        try {
            // Call login function from context
            const result = await login(email.trim(), password.trim());

            if (result.success) {
                setErrorMessage('');
                // Add a small delay to prevent navigation conflicts
                setTimeout(() => {
                    handleTaskPageNavigation();
                }, 100);
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    return (
        <View className="flex-1 items-center justify-center">
            {/* =================== BACKGROUND IMAGE =================== */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
                style={{ width, height }}
            />

            {/* =================== LOGO SECTION =================== */}
            <Image
                source={logo}
                className="absolute top-[210px] w-[100px] h-[85px]"
            />

            {/* =================== SIGN IN TITLE AND NAVIGATION =================== */}
            <Text
                style={{ color: Colors.light.whiteFfffff }}
                className="absolute top-[330px] font-extrabold text-3xl"
            >
                Sign in to your Account
            </Text>

            {/* Sign up navigation link */}
            <View className="flex flex-row absolute top-[380px] mb-5">
                <Text
                    style={{ color: Colors.light.whiteFfffff }}
                    className="px-1 text-lg font-medium"
                >
                    Don't have an account ?
                </Text>
                <TouchableOpacity onPress={handleSignUpPress}>
                    <Text
                        style={{ color: Colors.light.blueTheme }}
                        className="px-1 text-xl font-semibold"
                    >
                        SignUp
                    </Text>
                </TouchableOpacity>
            </View>

            {/* =================== INPUT FIELDS SECTION =================== */}
            <View className="absolute top-[440px]">
                {/* Email/Phone input field */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center justify-start w-[370px] h-[56px] rounded-[15px] mb-7"
                >
                    {/* Mail icon */}
                    {icons && (
                        <Image
                            source={icons.mail}
                            className="w-[16px] h-[14px] mx-4"
                        />
                    )}
                    <TextInput
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary
                        }}
                        className="h-[56px] w-[300px]"
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
                    />
                </View>

                {/* Password input field with visibility toggle */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px]"
                >
                    {/* Lock icon */}
                    {icons && (
                        <Image
                            source={icons.lock}
                            className="w-[16px] h-[19px] mx-4"
                        />
                    )}
                    <TextInput
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary
                        }}
                        className="h-[56px] w-[250px]"
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
                    />
                    {/* Password visibility toggle button */}
                    <TouchableOpacity
                        className="absolute right-3 h-[56px] flex items-center justify-center"
                        onPress={togglePasswordVisibility}
                    >
                        {icons && (
                            <Image
                                source={isPasswordVisible ? icons.eyeopen : icons.eye}
                                className="w-[16px] h-[12px] mx-4"
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Error message display */}
                {errorMessage ? (
                    <View className="mt-3 w-[370px]">
                        <Text
                            style={{ color: '#EF4444' }}
                            className="text-center text-sm font-medium"
                        >
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* =================== FORGOT PASSWORD LINK =================== */}
            <View className="absolute top-[610px]">
                <TouchableOpacity onPress={handleResetPasswordPress}>
                    <Text
                        style={{ color: Colors.light.secondaryText }}
                        className="underline"
                    >
                        Forgot Your Password ?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* =================== LOGIN BUTTON SECTION =================== */}
            <View className="absolute top-[650px]">
                <CustomGradientButton
                    text="Login"
                    width={370}
                    height={56}
                    fontWeight={600}
                    borderRadius={100}
                    fontSize={18}
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleLogin}
                    style={{
                        opacity: isLoading ? 0.6 : 1,
                    }}
                />
            </View>

            {/* =================== FOOTER BRAND NAME =================== */}
            <View className="absolute bottom-8">
                <Text
                    style={{ color: Colors.light.whiteFfffff }}
                    className="text-2xl font-bold"
                >
                    MIRAGIO
                </Text>
            </View>
        </View>
    );
};

export default SignIn;
