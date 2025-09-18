import { Image, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import { useState, useRef, useEffect } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

const { width, height } = Dimensions.get('window');

const VerifyCode = ({ navigation, route }: Props) => {
    // Type guard for email parameter
    const email = route.params?.email;

    if (!email) {
        // Handle case where email is not provided
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
                setTimer(timer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Handle code input change
    const handleCodeChange = (text: string, index: number) => {
        // Only allow numeric input
        const numericText = text.replace(/[^0-9]/g, '');

        const newCode = [...code];
        newCode[index] = numericText;
        setCode(newCode);

        // Clear error message when user starts typing
        if (errorMessage) setErrorMessage("");

        // Auto focus next input
        if (numericText && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // FIXED: Function to verify reset code with proper parameter usage
    const verifyResetCode = async (userEmail: string, verificationCode: string): Promise<{ success: boolean, resetToken?: string, message?: string }> => {
        try {
            // Simulate API call delay
            await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

            // Log parameters to show they're being used (remove in production)
            console.log('Verifying code for:', userEmail, 'Code:', verificationCode);

            // TODO: Replace with actual API call when ready
            return { success: true, resetToken: 'dummy_token' };

            /* 
            // UNCOMMENT WHEN YOU HAVE REAL API:
            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    action: "verify_reset_code",
                    email: userEmail,  // Using userEmail parameter
                    code: verificationCode,  // Using verificationCode parameter
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                return { success: true, resetToken: data.resetToken || 'dummy_token' };
            } else {
                return { success: false, message: data.message || 'Invalid verification code' };
            }
            */
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Function to resend reset code
    const resendResetCode = async (): Promise<void> => { // FIXED: Added explicit return type
        if (resendLoading || timer > 0) return;

        setResendLoading(true);
        setErrorMessage("");

        try {
            // Simulate API call delay
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

            // TODO: Replace with actual API call when ready
            setTimer(60);
            setErrorMessage("New verification code sent to your email");
            setCode(['', '', '', '', '', '']); // Clear current code
            inputRefs.current[0]?.focus();

            // Clear success message after 3 seconds
            setTimeout(() => setErrorMessage(""), 3000);

            /* 
            // UNCOMMENT WHEN YOU HAVE REAL API:
            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    action: "resend_reset_code",
                    email: email,
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                setTimer(60);
                setErrorMessage("New verification code sent to your email");
                setCode(['', '', '', '', '', '']); // Clear current code
                inputRefs.current[0]?.focus();
                
                // Clear success message after 3 seconds
                setTimeout(() => setErrorMessage(""), 3000);
            } else {
                setErrorMessage("Failed to resend code. Please try again.");
            }
            */
        } catch (error) {
            setErrorMessage("Network error. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    // Handle verify button press
    const handleVerifyCode = async () => {
        const enteredCode = code.join('');
        setErrorMessage("");

        if (enteredCode.length !== 6) {
            setErrorMessage("Please enter the complete 6-digit code");
            return;
        }

        setIsLoading(true);

        try {
            const result = await verifyResetCode(email, enteredCode);

            if (result.success) {
                // Navigate directly to ResetSuccess
                navigation.navigate('ResetSuccess');
            } else {
                setErrorMessage(result.message || 'Verification failed');
                // Clear code inputs on error
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Back button handler
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

            {/* Back Button - responsive positioning */}
            <TouchableOpacity
                className="absolute flex items-center justify-center"
                style={{
                    left: width * 0.04,  // 4% from left
                    top: height * 0.09,  // 6% from top
                    width: width * 0.12, // Touch area
                    height: height * 0.06,
                    zIndex: 10
                }}
                onPress={handleBackPress}
                disabled={isLoading}
            >
                {icons && (
                    <Image
                        source={icons.back}
                        style={{
                            width: width * 0.06,
                            height: width * 0.07,
                            opacity: isLoading ? 0.5 : 1
                        }}
                    />
                )}
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

            {/* Verification Instructions - responsive */}
            <View
                className="absolute flex flex-col justify-center items-center"
                style={{
                    top: height * 0.31,  // 25% from top
                    width: width * 0.80,
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.074,
                        lineHeight: width * 0.08
                    }}
                    className="font-bold text-center"
                >
                    Verify Code
                </Text>
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.049,
                        lineHeight: width * 0.055,
                        marginTop: height * 0.027
                    }}
                    className="text-center"
                >
                    We've sent a 6-digit verification code to
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

            {/* Code Input Section - responsive */}
            <View
                className="absolute flex flex-row justify-between"
                style={{
                    top: height * 0.52,  // 42% from top
                    width: width * 0.85,
                    paddingHorizontal: width * 0.02
                }}
            >
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => {
                            inputRefs.current[index] = ref;
                        }}
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            color: Colors.light.blackPrimary,
                            textAlign: 'center',
                            fontSize: Math.min(24, width * 0.06),
                            fontWeight: 'bold',
                            borderWidth: 2,
                            borderColor: digit ? Colors.light.blueTheme : '#E5E7EB',
                            width: width * 0.12,  // 12% of screen width
                            height: Math.max(48, height * 0.06),  // Min 48px, responsive height
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

            {/* Error Message Section - responsive */}
            {errorMessage && (
                <View
                    className="absolute"
                    style={{
                        top: height * 0.52,  // 52% from top
                        width: width * 0.85,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    <Text
                        style={{
                            color: errorMessage.includes('sent') ? '#10B981' : '#FF4444',
                            fontSize: width * 0.035,
                            textAlign: 'center',
                            fontWeight: '500',
                        }}
                    >
                        {errorMessage}
                    </Text>
                </View>
            )}

            {/* Resend Code Section - responsive */}
            <View
                className="absolute flex flex-row items-center justify-center"
                style={{
                    top: height * 0.62,  // 58% from top
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
                    Didn't receive the code?
                </Text>
                <TouchableOpacity
                    onPress={resendResetCode}
                    disabled={timer > 0 || resendLoading || isLoading}
                    className="ml-1"
                >
                    <Text
                        style={{
                            color: (timer > 0 || resendLoading || isLoading) ? Colors.light.placeholderColor : Colors.light.blueTheme,
                            textDecorationLine: (timer > 0 || resendLoading || isLoading) ? 'none' : 'underline',
                            fontSize: width * 0.038
                        }}
                        className="font-semibold"
                    >
                        {resendLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Verify Button - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.69,  // 66% from top
                    width: '100%',
                    paddingHorizontal: width * 0.08
                }}
            >
                <CustomGradientButton
                    text={isLoading ? "Verifying..." : "Verify Code"}
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

            {/* Footer Brand Name - responsive */}
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
        </View >
    )
}

export default VerifyCode;