import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import otpimage from "../../assets/images/otpimage.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStackParamList } from '../../Navigation/types';

// FIXED: Proper TypeScript props
type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const Otp = ({ navigation }: Props) => {
    console.log('🔥 OTP COMPONENT: Starting to render');

    const [otp, setOtp] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [newAccountCredentials, setNewAccountCredentials] = useState<{ email: string, password: string } | null>(null);

    console.log('🔥 OTP COMPONENT: State initialized');

    // Load new account credentials on component mount
    useEffect(() => {
        console.log('🔥 OTP COMPONENT: useEffect triggered');
        loadNewAccountCredentials();
        debugAsyncStorage();
    }, []);

    const loadNewAccountCredentials = async (): Promise<void> => {
        try {
            const storedCredentials = await AsyncStorage.getItem('@new_account_credentials');
            if (storedCredentials) {
                const credentials = JSON.parse(storedCredentials);
                setNewAccountCredentials(credentials);
                console.log('OTP - Loaded new account credentials for auto-login:', credentials);
            } else {
                console.log('OTP - No stored credentials found in AsyncStorage');
            }
        } catch (error) {
            console.error('OTP - Error loading new account credentials:', error);
        }
    };

    // Debug function to check AsyncStorage
    const debugAsyncStorage = async (): Promise<void> => {
        try {
            const keys = ['@new_account_credentials', '@signup_data', '@registration_data'];
            for (const key of keys) {
                const value = await AsyncStorage.getItem(key);
                console.log(`OTP - Debug ${key}:`, value ? JSON.parse(value) : 'null');
            }
        } catch (error) {
            console.error('OTP - Debug error:', error);
        }
    };

    // FIXED: Handle numeric input only for OTP
    const handleOtpChange = (text: string): void => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 5 digits
        const limitedText = numericText.slice(0, 5);

        setOtp(limitedText);
        if (errorMessage) setErrorMessage("");
    };

    const handleVerifyOTP = async (): Promise<void> => {
        if (isLoading) return;

        // For demo purposes, we'll accept any 5-digit OTP
        // In production, you would verify this with your backend
        if (!otp.trim() || otp.length !== 5) {
            setErrorMessage("Please enter a valid 5-digit OTP");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            // Simulate OTP verification (replace with actual API call)
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            console.log('OTP - OTP verification successful');

            // Check if we have credentials for auto-login (just for logging)
            if (newAccountCredentials) {
                console.log('OTP - Credentials found, will auto-login on KYC Success page');
            } else {
                console.log('OTP - No credentials found for auto-login');
            }

            setErrorMessage("OTP verified successfully!");

            // FIXED: Navigate to KYC Success page
            setTimeout(() => {
                navigation.navigate('KycSuccess');
            }, 1000);

        } catch (error) {
            console.error('OTP - Verification error:', error);
            setErrorMessage("OTP verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async (): Promise<void> => {
        if (isLoading) return;

        console.log('Resending OTP...');
        setErrorMessage("OTP resent successfully");

        setTimeout(() => {
            setErrorMessage("");
        }, 3000);
    };

    // FIXED: Back button handler
    const handleBackPress = (): void => {
        if (!isLoading) {
            navigation.goBack();
        }
    };

    console.log('🔥 OTP COMPONENT: About to return JSX');

    return (
        <View className="flex items-center">
            {/* Add this debug element at the very top */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'red',
                padding: 10,
                zIndex: 9999
            }}>
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                    🔥 OTP SCREEN IS RENDERED 🔥
                </Text>
            </View>

            {/* =================== BACKGROUND IMAGE =================== */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
            />

            {/* =================== HEADER SECTION WITH LOGO =================== */}
            <View className="absolute flex items-center w-full">
                {/* FIXED: Back button */}
                <TouchableOpacity
                    className="absolute flex left-[10px] top-[105px]"
                    onPress={handleBackPress}
                    disabled={isLoading}
                >
                    {icons && (
                        <Image
                            source={icons.back}
                            className="w-[25px] h-[30px] mx-4"
                            style={{ opacity: isLoading ? 0.5 : 1 }}
                        />
                    )}
                </TouchableOpacity>

                {/* Miragio logo */}
                <Image
                    source={logo}
                    className="top-[80px] w-[100px] h-[85px]"
                />
            </View>

            {/* =================== SUCCESS MESSAGE SECTION =================== */}
            <View className="absolute top-[200px] flex items-center justify-center">
                <Text style={{ color: Colors.light.whiteFfffff }} className="font-medium text-3xl">
                    OTP Sent Successfully
                </Text>
                <Text style={{ color: Colors.light.secondaryText }} className="font-medium pt-2">
                    Check your inbox
                </Text>
            </View>

            {/* =================== ILLUSTRATION SECTION =================== */}
            <View className="absolute top-[310px]">
                <Image
                    source={otpimage}
                    className="h-[250px] w-[400px]"
                />
            </View>

            {/* =================== VERIFICATION INSTRUCTIONS SECTION =================== */}
            <View className="absolute top-[570px] flex flex-col justify-center items-center">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">
                    Confirm Your Number
                </Text>
                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="mt-2">
                    We've sent 5 digit verification code to
                </Text>
            </View>

            {/* =================== OTP INPUT SECTION =================== */}
            <View className="absolute top-[700px]">
                <View style={{ borderColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] border rounded-[15px] mb-5">
                    {/* OTP icon */}
                    {icons && (
                        <Image source={icons.otp} className="w-[16px] h-[14px] mx-4" />
                    )}
                    {/* FIXED: OTP input field with numeric validation */}
                    <TextInput
                        style={{ color: Colors.light.whiteFfffff }}
                        className="text-l ml-5 w-[180px] h-[56px]"
                        placeholder="Enter OTP"
                        placeholderTextColor={Colors.light.whiteFfffff}
                        secureTextEntry={false} // Changed to false for better UX
                        value={otp}
                        onChangeText={handleOtpChange}
                        keyboardType="numeric"
                        maxLength={5}
                        editable={!isLoading}
                    />
                    {/* Character count indicator */}
                    <Text style={{ color: Colors.light.whiteFfffff, fontSize: 12 }}>
                        {otp.length}/5
                    </Text>
                    {/* Resend OTP button */}
                    <TouchableOpacity
                        onPress={handleResendOTP}
                        disabled={isLoading}
                        style={{ marginLeft: 10 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                opacity: isLoading ? 0.5 : 1
                            }}
                        >
                            Resend
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Error message display */}
                {errorMessage && (
                    <View className="w-[370px] mt-1 px-4">
                        <Text
                            style={{
                                color: errorMessage.includes('successfully') ? '#10B981' : '#EF4444'
                            }}
                            className="text-center text-sm font-medium"
                        >
                            {errorMessage}
                        </Text>
                    </View>
                )}
            </View>

            {/* =================== VERIFY BUTTON SECTION =================== */}
            <View className="absolute top-[800px]">
                <CustomGradientButton
                    text={isLoading ? "Verifying..." : "Verify OTP"}
                    width={370}
                    height={56}
                    borderRadius={15}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleVerifyOTP}
                    disabled={isLoading || !otp.trim() || otp.length !== 5}
                    style={{
                        opacity: (isLoading || !otp.trim() || otp.length !== 5) ? 0.6 : 1,
                    }}
                />
            </View>

            {/* =================== FOOTER BRAND NAME =================== */}
            <View className="absolute bottom-8">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">
                    MIRAGIO
                </Text>
            </View>

        </View>
    );
};

export default Otp;
