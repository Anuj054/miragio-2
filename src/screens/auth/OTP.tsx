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
import { useUser } from '../../context/UserContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const Otp = ({ navigation, route }: Props) => {
    // Use UserContext methods for login after verification
    const { login, isLoading: contextLoading } = useUser();

    const [otp, setOtp] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Get userId from route params or AsyncStorage
    const [userId, setUserId] = useState<string | null>(route.params?.userId || null);

    useEffect(() => {
        const loadUserId = async () => {
            if (!userId) {
                const storedUserId = await AsyncStorage.getItem('@pending_user_id');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    setErrorMessage("Session expired. Please start registration again.");
                    setTimeout(() => {
                        navigation.navigate('SignUp');
                    }, 3000);
                }
            }
        };
        loadUserId();
    }, []);

    // Handle numeric input only for OTP
    const handleOtpChange = (text: string): void => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');
        // Limit to 5 digits
        const limitedText = numericText.slice(0, 5);
        setOtp(limitedText);
        if (errorMessage) setErrorMessage("");
    };

    // Direct API call for OTP verification
    const handleVerifyOTP = async (): Promise<void> => {
        if (isLoading || contextLoading) return;

        if (!otp.trim() || otp.length !== 5) {
            setErrorMessage("Please enter a valid 5-digit OTP");
            return;
        }

        if (!userId) {
            setErrorMessage("Session expired. Please start registration again.");
            setTimeout(() => {
                navigation.navigate('SignUp');
            }, 2000);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            // FIXED: For demo purposes - accept any 5-digit OTP
            // In production, replace with actual API call
            await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 1500);
            });

            // Simulate successful OTP verification
            setErrorMessage("✅ OTP verified successfully! Welcome to Miragio!");

            // Try to auto-login the user
            await autoLoginUser();

            // Navigate to KYC Success page
            setTimeout(() => {
                navigation.navigate('KycSuccess');
            }, 1500);

        } catch (error) {
            setErrorMessage("Verification failed. Please check your internet connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-login user after OTP verification
    const autoLoginUser = async () => {
        try {
            // Get stored credentials from registration
            const credentialsData = await AsyncStorage.getItem('@new_account_credentials');
            if (credentialsData) {
                const credentials = JSON.parse(credentialsData);

                // Attempt to login automatically
                const loginResult = await login(credentials.email, credentials.password);

                if (loginResult.success) {
                    // Clean up stored credentials
                    await AsyncStorage.removeItem('@new_account_credentials');
                    await AsyncStorage.removeItem('@pending_user_id');
                } else {
                    // Login failed, but OTP was successful, so proceed anyway
                }
            }
        } catch (error) {
            // Auto-login failed, but OTP was successful, so proceed anyway
        }
    };

    // Resend OTP - mock implementation
    const handleResendOTP = async (): Promise<void> => {
        if (isLoading || contextLoading) return;

        if (!userId) {
            setErrorMessage("Session expired. Please start registration again.");
            return;
        }

        setIsLoading(true);

        try {
            // FIXED: Simulate resend OTP
            await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 1000);
            });
            setErrorMessage("✅ OTP sent successfully!");
        } catch (error) {
            setErrorMessage("Failed to resend OTP. Please check your internet connection.");
        } finally {
            setIsLoading(false);
        }

        setTimeout(() => {
            setErrorMessage("");
        }, 3000);
    };

    // Back button handler
    const handleBackPress = (): void => {
        if (!isLoading && !contextLoading) {
            navigation.goBack();
        }
    };

    const isButtonDisabled = isLoading || contextLoading || !otp.trim() || otp.length !== 5;

    return (
        <View className="flex items-center">
            {/* =================== BACKGROUND IMAGE =================== */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
            />

            {/* =================== HEADER SECTION WITH LOGO =================== */}
            <View className="absolute flex items-center w-full">
                {/* Back button */}
                <TouchableOpacity
                    className="absolute flex left-[10px] top-[105px]"
                    onPress={handleBackPress}
                    disabled={isLoading || contextLoading}
                >
                    {icons && (
                        <Image
                            source={icons.back}
                            className="w-[25px] h-[30px] mx-4"
                            style={{ opacity: (isLoading || contextLoading) ? 0.5 : 1 }}
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
                    {/* OTP input field with numeric validation */}
                    <TextInput
                        style={{ color: Colors.light.whiteFfffff }}
                        className="text-l ml-5 w-[180px] h-[56px]"
                        placeholder="Enter OTP"
                        placeholderTextColor={Colors.light.whiteFfffff}
                        secureTextEntry={false}
                        value={otp}
                        onChangeText={handleOtpChange}
                        keyboardType="numeric"
                        maxLength={5}
                        editable={!isLoading && !contextLoading}
                    />

                    {/* Character count indicator */}
                    <Text style={{ color: Colors.light.whiteFfffff, fontSize: 12, marginRight: 5 }}>
                        {otp.length}/5
                    </Text>

                    {/* Resend OTP button */}
                    <TouchableOpacity
                        onPress={handleResendOTP}
                        disabled={isLoading || contextLoading}
                        style={{ marginLeft: 5 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                opacity: (isLoading || contextLoading) ? 0.5 : 1,
                                fontSize: 12
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
                                color: errorMessage.includes('✅') ? '#10B981' : '#EF4444'
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
                    text={(isLoading || contextLoading) ? "Verifying..." : "Verify OTP"}
                    width={370}
                    height={56}
                    borderRadius={15}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleVerifyOTP}
                    disabled={isButtonDisabled}
                    style={{
                        opacity: isButtonDisabled ? 0.6 : 1,
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
