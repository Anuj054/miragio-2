import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import { icons } from '../../constants/index';
import otpimage from '../../assets/images/otpimage.png';
import CustomGradientButton from '../../components/CustomGradientButton';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import type { AuthStackParamList } from '../../navigation/types';


type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const Otp = ({ navigation, route }: Props) => {
    // Context methods for login and FCM storage
    const { login, isLoading: contextLoading } = useUser();

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // UserId passed from previous screen or from storage
    const [userId, setUserId] = useState<string | null>(route.params?.userId || null);

    useEffect(() => {
        const loadUserId = async () => {
            if (!userId) {
                const storedUserId = await AsyncStorage.getItem('@pending_user_id');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    setErrorMessage('Session expired. Please start registration again.');
                    setTimeout(() => navigation.navigate('SignUp'), 3000);
                }
            }
        };
        loadUserId();
    }, []);

    // Accept only digits and limit to 5 characters
    const handleOtpChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '').slice(0, 5);
        setOtp(numericText);
        if (errorMessage) setErrorMessage('');
    };

    const handleVerifyOTP = async () => {
        if (isLoading || contextLoading) return;

        if (!otp.trim() || otp.length !== 5) {
            setErrorMessage('Please enter a valid 5-digit OTP');
            return;
        }
        if (!userId) {
            setErrorMessage('Session expired. Please start registration again.');
            setTimeout(() => navigation.navigate('SignUp'), 2000);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            // 🔑 Replace this with real API verification call in production
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));

            setErrorMessage('✅ OTP verified successfully! Welcome to Miragio!');

            // Auto-login the user
            await autoLoginUser();

            // ✅ FCM token is automatically handled by UserContext.verifyOTP()
            // No need for duplicate calls!

            // Navigate to success page
            setTimeout(() => navigation.navigate('KycSuccess'), 1500);
        } catch (error) {
            setErrorMessage('Verification failed. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const autoLoginUser = async () => {
        try {
            const credentialsData = await AsyncStorage.getItem('@new_account_credentials');
            if (credentialsData) {
                const credentials = JSON.parse(credentialsData);
                const loginResult = await login(credentials.email, credentials.password);

                if (loginResult.success) {
                    await AsyncStorage.removeItem('@new_account_credentials');
                    await AsyncStorage.removeItem('@pending_user_id');
                }
            }
        } catch {
            // Ignore auto-login errors; OTP verification already succeeded
        }
    };

    const handleResendOTP = async () => {
        if (isLoading || contextLoading) return;
        if (!userId) {
            setErrorMessage('Session expired. Please start registration again.');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));
            setErrorMessage('✅ OTP sent successfully!');
        } catch {
            setErrorMessage('Failed to resend OTP. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }

        setTimeout(() => setErrorMessage(''), 3000);
    };

    const handleBackPress = () => {
        if (!isLoading && !contextLoading) navigation.goBack();
    };

    const isButtonDisabled = isLoading || contextLoading || otp.length !== 5;

    return (
        <View className="flex items-center">
            {/* Background */}
            <Image source={bg} resizeMode="cover" className="w-full h-full" />

            {/* Header */}
            <View className="absolute flex items-center w-full">
                <TouchableOpacity
                    className="absolute flex left-[10px] top-[105px]"
                    onPress={handleBackPress}
                    disabled={isLoading || contextLoading}
                >
                    <Image
                        source={icons.back}
                        className="w-[25px] h-[30px] mx-4"
                        style={{ opacity: (isLoading || contextLoading) ? 0.5 : 1 }}
                    />
                </TouchableOpacity>
                <Image source={logo} className="top-[80px] w-[100px] h-[85px]" />
            </View>

            {/* Titles */}
            <View className="absolute top-[200px] items-center">
                <Text style={{ color: Colors.light.whiteFfffff }} className="font-medium text-3xl">
                    OTP Sent Successfully
                </Text>
                <Text style={{ color: Colors.light.secondaryText }} className="font-medium pt-2">
                    Check your inbox
                </Text>
            </View>

            {/* Illustration */}
            <View className="absolute top-[310px]">
                <Image source={otpimage} className="h-[250px] w-[400px]" />
            </View>

            {/* Instructions */}
            <View className="absolute top-[570px] items-center">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">
                    Confirm Your Number
                </Text>
                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="mt-2">
                    We've sent a 5-digit verification code
                </Text>
            </View>

            {/* OTP Input */}
            <View className="absolute top-[700px]">
                <View
                    style={{ borderColor: Colors.light.whiteFfffff }}
                    className="flex flex-row items-center w-[370px] h-[56px] border rounded-[15px] mb-5"
                >
                    <Image source={icons.otp} className="w-[16px] h-[14px] mx-4" />
                    <TextInput
                        style={{ color: Colors.light.whiteFfffff }}
                        className="ml-5 w-[180px] h-[56px]"
                        placeholder="Enter OTP"
                        placeholderTextColor={Colors.light.whiteFfffff}
                        keyboardType="numeric"
                        maxLength={5}
                        value={otp}
                        onChangeText={handleOtpChange}
                        editable={!isLoading && !contextLoading}
                    />
                    <Text style={{ color: Colors.light.whiteFfffff, fontSize: 12, marginRight: 5 }}>
                        {otp.length}/5
                    </Text>
                    <TouchableOpacity onPress={handleResendOTP} disabled={isLoading || contextLoading}>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                opacity: (isLoading || contextLoading) ? 0.5 : 1,
                                fontSize: 12,
                            }}
                        >
                            Resend
                        </Text>
                    </TouchableOpacity>
                </View>

                {errorMessage !== '' && (
                    <View className="w-[370px] mt-1 px-4">
                        <Text
                            style={{ color: errorMessage.includes('✅') ? '#10B981' : '#EF4444' }}
                            className="text-center text-sm font-medium"
                        >
                            {errorMessage}
                        </Text>
                    </View>
                )}
            </View>

            {/* Verify Button */}
            <View className="absolute top-[800px]">
                <CustomGradientButton
                    text={(isLoading || contextLoading) ? 'Verifying...' : 'Verify OTP'}
                    width={370}
                    height={56}
                    borderRadius={15}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleVerifyOTP}
                    disabled={isButtonDisabled}
                    style={{ opacity: isButtonDisabled ? 0.6 : 1 }}
                />
            </View>

            {/* Footer */}
            <View className="absolute bottom-8">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">
                    MIRAGIO
                </Text>
            </View>
        </View>
    );
};

export default Otp;
