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
    const { login } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        clearOldSignupCredentials();
    }, []);

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
        setIsPasswordVisible(!isPasswordVisible);
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

    const handleSignUpPress = () => {
        navigation.replace('SignUp');
    };

    const handleResetPasswordPress = () => {
        navigation.navigate('ResetPassword');
    };

    // Fixed navigation function based on your structure
    const handleTaskPageNavigation = () => {
        try {
            // Navigate to Main navigator, then to TaskTab, then to TaskPage
            navigation.navigate('Main', {
                screen: 'TaskTab',
                params: { screen: 'TaskPage' }
            });

        } catch (error) {
            console.error('Navigation error:', error);
            setErrorMessage('Navigation failed. Please try again.');
        }
    };



    const handleLogin = async () => {
        if (isLoading) return;

        setErrorMessage('');
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await login(email.trim(), password.trim());

            if (result.success) {
                setErrorMessage('');
                setTimeout(() => {
                    handleTaskPageNavigation();
                }, 100);
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

            {/* Logo */}
            <Image
                source={logo}
                className="absolute top-[210px] w-[100px] h-[85px]"
            />

            {/* Title */}
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
            {/* Input Fields */}
            <View className="absolute top-[440px]">
                {/* Email Input */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center justify-start w-[370px] h-[56px] rounded-[15px] mb-7"
                >
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
                        editable={!isLoading}
                    />
                </View>

                {/* Password Input */}
                <View
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px]"
                >
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
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        className="absolute right-3 h-[56px] flex items-center justify-center"
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

                {/* Error Message - FIXED POSITIONING */}
                {errorMessage ? (
                    <View className="mt-5 w-[370px]">
                        <Text
                            style={{ color: '#EF4444' }}
                            className="text-center text-sm font-medium"
                        >
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Forgot Password - INCREASED TOP MARGIN */}
            <View className="absolute top-[630px]">
                <TouchableOpacity onPress={handleResetPasswordPress} disabled={isLoading}>
                    <Text
                        style={{ color: Colors.light.secondaryText }}
                        className="underline"
                    >
                        Forgot Your Password ?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Login Button - INCREASED TOP MARGIN */}
            <View className="absolute top-[670px]">
                <CustomGradientButton
                    text={isLoading ? "Signing In..." : "Login"}
                    width={370}
                    height={56}
                    fontWeight={600}
                    borderRadius={100}
                    fontSize={18}
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleLogin}
                    disabled={isLoading}
                    style={{
                        opacity: isLoading ? 0.6 : 1,
                    }}
                />
            </View>


            {/* Footer */}
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
