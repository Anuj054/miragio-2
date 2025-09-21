import { Image, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import { useState, useRef, useEffect } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../navigation/types';

// ✅ Translation
import { useTranslation } from '../../context/TranslationContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

const { width, height } = Dimensions.get('window');

const VerifyCode = ({ navigation, route }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    // Type guard for email parameter
    const email = route.params?.email;

    if (!email) {
        navigation.goBack();
        return null;
    }

    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(60);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Timer for resend button
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(t => t - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleCodeChange = (text: string, index: number) => {
        const numericText = text.replace(/[^0-9]/g, '');
        const newCode = [...code];
        newCode[index] = numericText;
        setCode(newCode);
        if (errorMessage) setErrorMessage("");
        if (numericText && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyResetCode = async (userEmail: string, verificationCode: string): Promise<{ success: boolean, resetToken?: string, message?: string }> => {
        try {
            await new Promise<void>(resolve => setTimeout(resolve, 2000));
            return { success: true, resetToken: 'dummy_token' };
        } catch {
            return { success: false, message: isHi ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' : 'Network error. Please try again.' };
        }
    };

    const resendResetCode = async (): Promise<void> => {
        if (resendLoading || timer > 0) return;

        setResendLoading(true);
        setErrorMessage("");
        try {
            await new Promise<void>(resolve => setTimeout(resolve, 1000));
            setTimer(60);
            setErrorMessage(isHi ? 'नया सत्यापन कोड आपके ईमेल पर भेज दिया गया है' : 'New verification code sent to your email');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setTimeout(() => setErrorMessage(""), 3000);
        } catch {
            setErrorMessage(isHi ? 'कोड पुनः भेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const enteredCode = code.join('');
        setErrorMessage("");
        if (enteredCode.length !== 6) {
            setErrorMessage(isHi ? 'कृपया पूरा 6 अंकों का कोड दर्ज करें' : 'Please enter the complete 6-digit code');
            return;
        }
        setIsLoading(true);
        try {
            const result = await verifyResetCode(email, enteredCode);
            if (result.success) {
                navigation.navigate('ResetSuccess');
            } else {
                setErrorMessage(result.message || (isHi ? 'सत्यापन विफल रहा' : 'Verification failed'));
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch {
            setErrorMessage(isHi ? 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।' : 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackPress = (): void => {
        if (!isLoading) {
            navigation.goBack();
        }
    };

    return (
        <View className="flex-1 items-center">
            {/* Background Image */}
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
                    top: height * 0.09,
                    width: width * 0.12,
                    height: height * 0.06,
                    zIndex: 10
                }}
                onPress={handleBackPress}
                disabled={isLoading}
            >
                <Image
                    source={icons.back}
                    style={{
                        width: width * 0.06,
                        height: width * 0.07,
                        opacity: isLoading ? 0.5 : 1
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

            {/* Verification Instructions */}
            <View
                className="absolute flex flex-col justify-center items-center"
                style={{
                    top: height * 0.31,
                    width: width * 0.80,
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.074,
                        lineHeight: width * 0.096,
                        width: width * 0.6
                    }}
                    className="font-bold text-center"
                >
                    {isHi ? 'कोड सत्यापित करें' : 'Verify Code'}
                </Text>
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.049,
                        lineHeight: width * 0.07,
                        marginTop: height * 0.027
                    }}
                    className="text-center"
                >
                    {isHi
                        ? 'हमने आपके ईमेल पर 6 अंकों का सत्यापन कोड भेजा है'
                        : "We've sent a 6-digit verification code to"}
                </Text>
                <Text
                    style={{
                        color: Colors.light.blueTheme,
                        fontSize: width * 0.04,
                        lineHeight: width * 0.05,
                        marginTop: height * 0.01
                    }}
                    className="font-semibold text-center"
                >
                    {email}
                </Text>
            </View>

            {/* Code Input Section */}
            <View
                className="absolute flex flex-row justify-between"
                style={{
                    top: height * 0.52,
                    width: width * 0.85,
                    paddingHorizontal: width * 0.02
                }}
            >
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputRefs.current[index] = ref; }}
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary,
                            textAlign: 'center',
                            fontSize: Math.min(24, width * 0.06),
                            fontWeight: 'bold',
                            borderWidth: 2,
                            borderColor: digit ? Colors.light.blueTheme : '#E5E7EB',
                            width: width * 0.12,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15
                        }}
                        value={digit}
                        onChangeText={(text) => handleCodeChange(text, index)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                        keyboardType="numeric"
                        maxLength={1}
                        selectTextOnFocus
                        editable={!isLoading}
                    />
                ))}
            </View>

            {/* Error Message */}
            {errorMessage && (
                <View
                    className="absolute"
                    style={{
                        top: height * 0.52,
                        width: width * 0.85,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    <Text
                        style={{
                            color: errorMessage.includes('भेजा') || errorMessage.includes('sent') ? '#10B981' : '#FF4444',
                            fontSize: width * 0.035,
                            textAlign: 'center',
                            fontWeight: '500',
                        }}
                    >
                        {errorMessage}
                    </Text>
                </View>
            )}

            {/* Resend Code */}
            <View
                className="absolute flex flex-row items-center justify-center"
                style={{
                    top: height * 0.62,
                    width: width * 0.85,
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.038
                    }}
                >
                    {isHi ? 'कोड प्राप्त नहीं हुआ?' : "Didn't receive the code?"}
                </Text>
                <TouchableOpacity
                    onPress={resendResetCode}
                    disabled={timer > 0 || resendLoading || isLoading}
                    className="ml-1"
                >
                    <Text
                        style={{
                            color: (timer > 0 || resendLoading || isLoading)
                                ? Colors.light.placeholderColor
                                : Colors.light.blueTheme,
                            textDecorationLine:
                                timer > 0 || resendLoading || isLoading ? 'none' : 'underline',
                            fontSize: width * 0.038
                        }}
                        className="font-semibold"
                    >
                        {resendLoading
                            ? (isHi ? 'भेजा जा रहा है...' : 'Sending...')
                            : timer > 0
                                ? (isHi ? `पुनः भेजें ${timer} सेकंड में` : `Resend in ${timer}s`)
                                : (isHi ? 'पुनः भेजें' : 'Resend')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.69,
                    width: '100%',
                    paddingHorizontal: width * 0.08
                }}
            >
                <CustomGradientButton
                    text={
                        isLoading
                            ? (isHi ? 'सत्यापित कर रहे हैं...' : 'Verifying...')
                            : (isHi ? 'कोड सत्यापित करें' : 'Verify Code')
                    }
                    width={Math.min(width * 0.9, 500)}
                    height={Math.max(48, height * 0.06)}
                    borderRadius={15}
                    fontSize={Math.min(18, width * 0.045)}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleVerifyCode}
                    disabled={isLoading || code.join('').length !== 6}
                    style={{
                        opacity: (isLoading || code.join('').length !== 6) ? 0.6 : 1,
                    }}
                />
            </View>

            {/* Footer */}
            <View
                className="absolute items-center"
                style={{
                    bottom: height * 0.034
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
        </View >
    )
}

export default VerifyCode;
