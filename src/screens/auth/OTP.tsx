import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import otpimage from '../../assets/images/otpimage.png';
import { icons } from '../../constants/index';
import CustomGradientButton from '../../components/CustomGradientButton';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';
import type { AuthStackParamList } from '../../navigation/types';

// ✅ Translation
import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const { width, height } = Dimensions.get('window');

const Otp = ({ navigation, route }: Props) => {
    // Get FCM token function and other utilities from UserContext
    const {
        login,
        storeFcmToken,
        isLoading: contextLoading,
        pendingUserId,
        clearPendingSignupData
    } = useUser();

    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState<string | null>(route.params?.userId || pendingUserId || null);

    useEffect(() => {
        const initializeUserId = async () => {
            if (!userId) {
                // Try to get from AsyncStorage as fallback
                const storedUserId = await AsyncStorage.getItem('@pending_user_id');

                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    setErrorMessage(
                        isHi
                            ? 'सत्र समाप्त हो गया। कृपया पंजीकरण फिर से शुरू करें।'
                            : 'Session expired. Please start registration again.'
                    );
                    setTimeout(() => navigation.navigate('SignUp'), 3000);
                }
            }
        };

        initializeUserId();
    }, [userId, pendingUserId, isHi, navigation]);

    const handleOtpChange = (text: string) => {
        const numeric = text.replace(/[^0-9]/g, '').slice(0, 5);
        setOtp(numeric);
        if (errorMessage) setErrorMessage('');
    };

    const handleVerifyOTP = async () => {
        if (isLoading || contextLoading) return;

        if (!otp.trim() || otp.length !== 5) {
            setErrorMessage(isHi ? 'कृपया 5 अंकों का सही ओटीपी दर्ज करें' : 'Please enter a valid 5-digit OTP');
            return;
        }

        if (!userId) {
            setErrorMessage(isHi ? 'सत्र समाप्त हो गया।' : 'Session expired.');
            setTimeout(() => navigation.navigate('SignUp'), 2000);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            console.log('🔄 Processing OTP verification (static)...');

            // Simulate API delay for better UX
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));

            // Static OTP verification - accept any 5-digit OTP
            console.log('✅ OTP accepted (static verification)');
            setErrorMessage(isHi ? 'ओटीपी सफलतापूर्वक सत्यापित!' : 'OTP verified successfully!');

            // Auto-login user if credentials are stored
            await autoLoginUser();

            // 🔑 CRITICAL: Store FCM token in database after OTP verification
            console.log('🔄 Storing FCM token for user:', userId);
            const fcmResult = await storeFcmToken(userId);

            if (fcmResult.success) {
                console.log('✅ FCM token stored successfully:', fcmResult.message);
            } else {
                console.warn('⚠️ FCM token storage failed:', fcmResult.message);
                // Don't block the user flow if FCM token fails
            }

            // Clean up and navigate to main app
            await clearPendingSignupData();
            await AsyncStorage.removeItem('@new_account_credentials');
            await AsyncStorage.removeItem('@pending_user_id');

            // Navigate to main screen after short delay
            setTimeout(() => {
                // Option 1: Navigate to a specific screen in your stack
                // navigation.navigate('YourMainScreen' as any);

                // Option 2: Go back to previous screens and let app handle logged-in state
                navigation.goBack();

                // Option 3: If you have a main tab navigator or specific screen, use:
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'YourActualMainScreenName' }],
                // });
            }, 2000);

        } catch (error) {
            console.error('❌ Error during OTP verification process:', error);
            setErrorMessage(isHi ? 'सत्यापन विफल। कृपया पुनः प्रयास करें।' : 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const autoLoginUser = async () => {
        try {
            const creds = await AsyncStorage.getItem('@new_account_credentials');
            if (creds) {
                const credentials = JSON.parse(creds);
                console.log('🔄 Auto-logging in user...');
                const result = await login(credentials.email, credentials.password);
                if (result.success) {
                    console.log('✅ User logged in successfully');
                } else {
                    console.warn('⚠️ Auto-login failed:', result.message);
                }
            }
        } catch (err) {
            console.error('❌ Error during auto-login:', err);
        }
    };

    const handleResendOTP = async () => {
        if (isLoading || contextLoading) return;

        if (!userId) {
            setErrorMessage(isHi ? 'सत्र समाप्त हो गया।' : 'Session expired.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            // Simulate resend delay
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));

            console.log('✅ OTP resend simulated');
            setErrorMessage(isHi ? 'ओटीपी पुनः भेजा गया!' : 'OTP sent successfully!');
        } catch (error) {
            console.error('❌ Resend OTP error:', error);
            setErrorMessage(isHi ? 'ओटीपी पुनः नहीं भेजा जा सका।' : 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
            // Clear success message after 3 seconds
            setTimeout(() => {
                setErrorMessage(prev => {
                    if (prev.includes('success') || prev.includes('सफल') || prev.includes('भेजा गया')) {
                        return '';
                    }
                    return prev;
                });
            }, 3000);
        }
    };

    const handleBackPress = () => {
        if (!isLoading && !contextLoading) {
            navigation.goBack();
        }
    };

    const isButtonDisabled = isLoading || contextLoading || otp.length !== 5;

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ minHeight: height }}>
            <View className="flex-1 items-center">
                {/* Background */}
                <Image
                    source={bg}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                    style={{ width, height }}
                />

                {/* Back Button */}
                <TouchableOpacity
                    className="absolute flex items-center justify-center"
                    style={{
                        left: width * 0.04,
                        top: height * 0.097,
                        width: width * 0.12,
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

                {/* Logo */}
                <Image
                    source={logo}
                    style={{
                        position: 'absolute',
                        top: height * 0.08,
                        width: width * 0.25,
                        height: width * 0.22
                    }}
                />

                {/* Title */}
                <TranslatedText
                    className="font-medium text-center"
                    style={{
                        position: 'absolute',
                        top: height * 0.22,
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.077,
                        lineHeight: width * 0.09
                    }}
                >
                    {isHi ? 'ओटीपी सफलतापूर्वक भेजा गया' : 'OTP Sent Successfully'}
                </TranslatedText>

                <Text
                    style={{
                        color: Colors.light.secondaryText,
                        fontSize: width * 0.035,
                        marginTop: height * 0.26,
                        position: 'absolute',
                        textAlign: 'center'
                    }}
                >
                    {isHi ? 'अपना इनबॉक्स जांचें' : 'Check your inbox'}
                </Text>

                {/* Illustration */}
                <View
                    className="absolute items-center"
                    style={{ top: height * 0.33 }}
                >
                    <Image
                        source={otpimage}
                        style={{
                            height: height * 0.28,
                            width: width * 1,
                            resizeMode: 'contain'
                        }}
                    />
                </View>

                {/* Instructions */}
                <View
                    className="absolute items-center"
                    style={{ top: height * 0.62, width: width * 0.85 }}
                >
                    <TranslatedText
                        className="font-bold text-center"
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.07,
                            lineHeight: width * 0.09
                        }}
                    >
                        {isHi ? 'अपना नंबर पुष्टि करें' : 'Confirm Your Number'}
                    </TranslatedText>
                    <Text
                        style={{
                            color: Colors.light.placeholderColorOp70,
                            fontSize: width * 0.035,
                            marginTop: height * 0.01,
                            textAlign: 'center'
                        }}
                    >
                        {isHi ? 'हमने 5 अंकों का कोड भेजा है' : "We've sent a 5-digit verification code"}
                    </Text>
                </View>

                {/* OTP Input */}
                <View
                    className="absolute items-center"
                    style={{ top: height * 0.74, width: '100%', paddingHorizontal: width * 0.02 }}
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
                            placeholder={isHi ? 'ओटीपी दर्ज करें' : 'Enter OTP'}
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
                            style={{ paddingHorizontal: width * 0.03, paddingVertical: height * 0.01 }}
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    opacity: (isLoading || contextLoading) ? 0.5 : 1,
                                    fontSize: width * 0.03
                                }}
                            >
                                {isHi ? 'पुनः भेजें' : 'Resend'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {errorMessage ? (
                        <Text
                            style={{
                                color: errorMessage.includes('success') ||
                                    errorMessage.includes('सफल') ||
                                    errorMessage.includes('सत्यापित') ||
                                    errorMessage.includes('भेजा गया')
                                    ? '#10B981'
                                    : '#EF4444',
                                fontSize: width * 0.035,
                                textAlign: 'center',
                                fontWeight: '500',
                                marginHorizontal: width * 0.05
                            }}
                        >
                            {errorMessage}
                        </Text>
                    ) : null}
                </View>

                {/* Verify Button */}
                <View
                    className="absolute items-center"
                    style={{ top: height * 0.85, width: '100%', paddingHorizontal: width * 0.02 }}
                >
                    <CustomGradientButton
                        text={
                            isLoading || contextLoading
                                ? (isHi ? 'सत्यापित कर रहे हैं...' : 'Verifying...')
                                : (isHi ? 'ओटीपी सत्यापित करें' : 'Verify OTP')
                        }
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

                {/* Footer */}
                <View
                    className="absolute items-center"
                    style={{ bottom: height * 0.034 }}
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

export default Otp;