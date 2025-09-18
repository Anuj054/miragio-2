import { Image, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
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

const { width, height } = Dimensions.get('window');

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
            // Replace this with real API verification call in production
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));

            setErrorMessage('OTP verified successfully! Welcome to Miragio!');

            // Auto-login the user
            await autoLoginUser();

            // FCM token is automatically handled by UserContext.verifyOTP()
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
            setErrorMessage('OTP sent successfully!');
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
        <View className="flex-1 items-center">
            {/* Background */}
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
                    top: height * 0.097,  // 6% from top
                    width: width * 0.12, // Touch area
                    height: height * 0.06,
                    zIndex: 10
                }}
                onPress={handleBackPress}
                disabled={isLoading || contextLoading}
            >
                <Image
                    source={icons.back}
                    style={{
                        width: width * 0.06,
                        height: width * 0.07,
                        opacity: (isLoading || contextLoading) ? 0.5 : 1
                    }}
                />
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

            {/* Title Section - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.22,  // 18% from top
                    width: width * 0.9,
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.077,
                        lineHeight: width * 0.075
                    }}
                    className="font-medium text-center"
                >
                    OTP Sent Successfully
                </Text>
                <Text
                    style={{
                        color: Colors.light.secondaryText,
                        fontSize: width * 0.035,
                        marginTop: height * 0.01
                    }}
                    className="font-medium text-center"
                >
                    Check your inbox
                </Text>
            </View>

            {/* Illustration - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.33  // 28% from top
                }}
            >
                <Image
                    source={otpimage}
                    style={{
                        height: height * 0.28,   // 25% of screen height
                        width: width * 1,     // 85% of screen width
                        resizeMode: 'contain'
                    }}
                />
            </View>

            {/* Instructions - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.62,  // 54% from top
                    width: width * 0.85,
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.07,
                        lineHeight: width * 0.075
                    }}
                    className="font-bold text-center"
                >
                    Confirm Your Number
                </Text>
                <Text
                    style={{
                        color: Colors.light.placeholderColorOp70,
                        fontSize: width * 0.035,
                        marginTop: height * 0.01
                    }}
                    className="text-center"
                >
                    We've sent a 5-digit verification code
                </Text>
            </View>

            {/* OTP Input - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.74,  // 66% from top
                    width: '100%',
                    paddingHorizontal: width * 0.02
                }}
            >
                <View
                    style={{
                        borderColor: Colors.light.whiteFfffff,
                        borderWidth: 1,
                        borderRadius: 15,
                        width: '100%',
                        maxWidth: width * 0.9,
                        height: Math.max(48, height * 0.06),
                        marginBottom: height * 0.02
                    }}
                    className="flex flex-row items-center"
                >
                    <Image
                        source={icons.otp}
                        style={{
                            width: width * 0.04,
                            height: width * 0.035,
                            marginLeft: width * 0.04,
                            marginRight: width * 0.03
                        }}
                    />
                    <TextInput
                        style={{
                            color: Colors.light.whiteFfffff,
                            flex: 1,
                            fontSize: Math.min(16, width * 0.04),
                            paddingVertical: 0
                        }}
                        placeholder="Enter OTP"
                        placeholderTextColor={Colors.light.whiteFfffff}
                        keyboardType="numeric"
                        maxLength={5}
                        value={otp}
                        onChangeText={handleOtpChange}
                        editable={!isLoading && !contextLoading}
                    />
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.03,
                            marginRight: width * 0.02
                        }}
                    >
                        {otp.length}/5
                    </Text>
                    <TouchableOpacity
                        onPress={handleResendOTP}
                        disabled={isLoading || contextLoading}
                        style={{
                            paddingHorizontal: width * 0.03,
                            paddingVertical: height * 0.01
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                opacity: (isLoading || contextLoading) ? 0.5 : 1,
                                fontSize: width * 0.03,
                            }}
                        >
                            Resend
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Error Message - responsive */}
                {errorMessage !== '' && (
                    <View
                        style={{
                            width: '100%',
                            maxWidth: width * 0.85,
                            paddingHorizontal: width * 0.02
                        }}
                    >
                        <Text
                            style={{
                                color: errorMessage.includes('successfully') ? '#10B981' : '#EF4444',
                                fontSize: width * 0.035,
                                textAlign: 'center',
                                fontWeight: '500'
                            }}
                        >
                            {errorMessage}
                        </Text>
                    </View>
                )}
            </View>

            {/* Verify Button - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.85,  // 76% from top
                    width: '100%',
                    paddingHorizontal: width * 0.02
                }}
            >
                <CustomGradientButton
                    text={(isLoading || contextLoading) ? 'Verifying...' : 'Verify OTP'}
                    width={Math.min(width * 0.9, 500)}
                    height={Math.max(48, height * 0.06)}
                    borderRadius={15}
                    fontSize={Math.min(18, width * 0.045)}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleVerifyOTP}
                    disabled={isButtonDisabled}
                    style={{ opacity: isButtonDisabled ? 0.6 : 1 }}
                />
            </View>

            {/* Footer - responsive */}
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
    );
};

export default Otp;