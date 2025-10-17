import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    PermissionsAndroid
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
import {

    request,
    requestNotifications,   // ✅ proper helper for iOS notifications
    PERMISSIONS,
} from "react-native-permissions";
// ✅ Translation
import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const { width, height } = Dimensions.get('window');

const Otp = ({ navigation, route }: Props) => {
    const { login, storeFcmToken, verifyEmailOtp, isLoading: contextLoading, currentUserId, } = useUser();
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState<string | null>(route.params?.userId || currentUserId || null);

    useEffect(() => {
        const initializeUserId = async () => {
            if (!userId) {
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
    }, [userId, currentUserId, isHi, navigation]);

    const handleOtpChange = (text: string) => {
        const numeric = text.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(numeric);
        if (errorMessage) setErrorMessage('');
    };
    async function requestAppPermissions() {
        try {
            // ✅ Ask Notification permission
            if (Platform.OS === "ios") {
                const { status } = await requestNotifications(["alert", "sound", "badge"]);
                console.log("🔔 iOS notification permission:", status);
            } else {
                const notifStatus = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                console.log("🔔 Android notification permission:", notifStatus);
            }

            // ✅ Ask Camera permission
            const cameraStatus = await request(
                Platform.OS === "ios"
                    ? PERMISSIONS.IOS.CAMERA
                    : PERMISSIONS.ANDROID.CAMERA
            );
            console.log("📷 Camera permission:", cameraStatus);

            // ✅ Ask Storage / Photo access
            const storageStatus = await request(
                Platform.OS === "ios"
                    ? PERMISSIONS.IOS.PHOTO_LIBRARY
                    : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
            );
            console.log("💾 Storage permission:", storageStatus);
        } catch (err) {
            console.warn("⚠️ Permission request error:", err);
        }
    }
    const handleVerifyOTP = async () => {
        if (isLoading || contextLoading) return;

        if (!otp.trim() || otp.length < 5) {
            setErrorMessage(isHi ? 'कृपया सही ओटीपी दर्ज करें' : 'Please enter a valid OTP');
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
            console.log('🔄 Verifying OTP for user:', userId);

            // Call the actual API to verify OTP
            const otpResult = await verifyEmailOtp(userId, otp);

            if (!otpResult.success) {
                console.error('❌ OTP verification failed:', otpResult.message);
                setErrorMessage(otpResult.message || (isHi ? 'ओटीपी सत्यापन विफल।' : 'OTP verification failed.'));
                setIsLoading(false);
                return;
            }

            console.log('✅ OTP verified successfully');
            setErrorMessage(isHi ? 'ओटीपी सफलतापूर्वक सत्यापित!' : 'OTP verified successfully!');

            // Small delay to show success message
            await new Promise<void>(resolve => setTimeout(resolve, 800));

            // Store FCM token
            console.log('🔄 Storing FCM token for user:', userId);
            const fcmResult = await storeFcmToken(userId);

            if (fcmResult.success) {
                console.log('✅ FCM token stored successfully');
            } else {
                console.warn('⚠️ FCM token storage failed:', fcmResult.message);
            }

            // Get credentials for auto-login
            const creds = await AsyncStorage.getItem('@new_account_credentials');
            if (!creds) {
                console.warn('⚠️ No credentials found for auto-login');
                setIsLoading(false);
                return;
            }

            const credentials = JSON.parse(creds);
            console.log('🔄 Auto-logging in user with email:', credentials.email);

            // Perform auto-login
            const loginResult = await login(credentials.email, credentials.password);

            if (loginResult.success) {
                console.log('✅ User auto-logged in successfully');
                await requestAppPermissions();
                // Clean up temporary storage
                await AsyncStorage.removeItem('@new_account_credentials');
                await AsyncStorage.removeItem('@pending_user_id');

                // Navigate to home/main app
                setTimeout(() => {
                    console.log('✅ Navigating to main app (auto-logged in)');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'TaskPage' as any }], // Change to your main app screen
                    });
                    setIsLoading(false);
                }, 1000);
            } else {
                console.warn('⚠️ Auto-login failed:', loginResult.message);
                setErrorMessage(
                    isHi
                        ? 'खाता सत्यापित हो गया। कृपया लॉगिन करें।'
                        : 'Account verified. Please login.'
                );
                setIsLoading(false);
            }

        } catch (error) {
            console.error('❌ Error during OTP verification:', error);
            setErrorMessage(isHi ? 'सत्यापन विफल। कृपया पुनः प्रयास करें।' : 'Verification failed. Please try again.');
            setIsLoading(false);
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
            // Call your resend OTP API here
            // For now, just simulating
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));

            console.log('✅ OTP resend requested');
            setErrorMessage(isHi ? 'ओटीपी पुनः भेजा गया!' : 'OTP sent successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        } catch (error) {
            console.error('❌ Resend OTP error:', error);
            setErrorMessage(isHi ? 'ओटीपी पुनः नहीं भेजा जा सका।' : 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackPress = () => {
        if (!isLoading && !contextLoading) {
            navigation.goBack();
        }
    };

    const isButtonDisabled = isLoading || contextLoading || otp.length < 5;

    return (
        <View style={{ flex: 1 }}>
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
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={{ minHeight: height, paddingHorizontal: width * 0.05, paddingBottom: height * 0.12 }}>
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                left: width * 0.04,
                                top: height * 0.097,
                                width: width * 0.12,
                                height: height * 0.06,
                                zIndex: 10,
                                alignItems: 'center',
                                justifyContent: 'center'
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

                        <View style={{
                            alignItems: 'center',
                            marginTop: height * 0.04,
                            zIndex: 5
                        }}>
                            <TranslatedText
                                className="font-medium text-center"
                                style={{
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
                                    textAlign: 'center',
                                    marginTop: height * 0.01
                                }}
                            >
                                {isHi ? 'अपना इनबॉक्स जांचें' : 'Check your inbox'}
                            </Text>
                        </View>

                        <View style={{
                            alignItems: 'center',
                            marginTop: height * 0.02,
                            zIndex: 5
                        }}>
                            <Image
                                source={otpimage}
                                style={{
                                    height: height * 0.28,
                                    width: width * 1,
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>

                        <View style={{ alignItems: 'center', zIndex: 5, marginTop: height * 0.02 }}>
                            <View style={{
                                alignItems: 'center',
                                width: width * 0.85,
                                marginBottom: height * 0.03
                            }}>
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
                                    {isHi ? 'हमने सत्यापन कोड भेजा है' : "We've sent a verification code"}
                                </Text>
                            </View>

                            <View
                                style={{
                                    borderColor: Colors.light.whiteFfffff,
                                    borderWidth: 1,
                                    borderRadius: 15,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    marginBottom: height * 0.02,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
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
                                        paddingVertical: 0,
                                        backgroundColor: 'transparent'
                                    }}
                                    placeholder={isHi ? 'ओटीपी दर्ज करें' : 'Enter OTP'}
                                    placeholderTextColor={Colors.light.whiteFfffff}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={handleOtpChange}
                                    editable={!isLoading && !contextLoading}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.03,
                                        marginRight: width * 0.02
                                    }}
                                >
                                    {otp.length}/6
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
                                <View style={{ marginBottom: height * 0.02, width: '100%' }}>
                                    <Text
                                        style={{
                                            color: errorMessage.includes('success') ||
                                                errorMessage.includes('सफल') ||
                                                errorMessage.includes('सत्यापित') ||
                                                errorMessage.includes('भेजा गया') ||
                                                errorMessage.includes('बनाया गया')
                                                ? '#10B981'
                                                : '#EF4444',
                                            fontSize: width * 0.035,
                                            textAlign: 'center',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {errorMessage}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={{ alignItems: 'center', marginBottom: height * 0.05 }}>
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
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Otp;