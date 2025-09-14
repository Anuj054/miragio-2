import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState, useRef, useEffect } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../Navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

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
        <View className="flex items-center ">
            {/* =================== BACKGROUND IMAGE =================== */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
            />

            {/* =================== HEADER SECTION WITH LOGO =================== */}
            <View className="absolute  flex  items-center w-full" >
                {/* Back button */}
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
                    className=" top-[80px] w-[100px] h-[85px]" />
            </View >

            {/* =================== VERIFICATION INSTRUCTIONS SECTION =================== */}
            <View className="absolute top-[280px] flex flex-col justify-center items-center w-[320px]">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">Verify Code</Text>
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-xl mt-5 text-center ">
                    We've sent a 6-digit verification code to
                </Text>
                <Text style={{ color: Colors.light.blueTheme }} className="text-lg font-semibold text-center mt-2">
                    {email}
                </Text>
            </View>

            {/* =================== CODE INPUT SECTION =================== */}
            <View className="absolute top-[450px] flex flex-row justify-between w-[350px] px-4">
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
                            fontSize: 24,
                            fontWeight: 'bold',
                            borderWidth: 2,
                            borderColor: digit ? Colors.light.blueTheme : '#E5E7EB',
                        }}
                        className="w-[45px] h-[56px] rounded-[15px]"
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

            {/* Error Message Section */}
            {errorMessage && (
                <View className="absolute top-[530px] w-[350px]">
                    <Text
                        style={{
                            color: errorMessage.includes('sent') ? '#10B981' : '#FF4444',
                            fontSize: 14,
                            textAlign: 'center',
                            fontWeight: '500',
                        }}
                    >
                        {errorMessage}
                    </Text>
                </View>
            )}

            {/* =================== RESEND CODE SECTION =================== */}
            <View className="absolute top-[570px] flex flex-row items-center justify-center w-full">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-base">
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
                            textDecorationLine: (timer > 0 || resendLoading || isLoading) ? 'none' : 'underline'
                        }}
                        className="text-base font-semibold"
                    >
                        {resendLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* =================== VERIFY BUTTON SECTION =================== */}
            <View className="absolute top-[640px]" >
                <CustomGradientButton
                    text={isLoading ? "Verifying..." : "Verify Code"}
                    width={370}
                    height={56}
                    borderRadius={15}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleVerifyCode}
                    disabled={isLoading || code.join('').length !== 6}
                    style={{
                        opacity: (isLoading || code.join('').length !== 6) ? 0.6 : 1,
                    }}
                />
            </View>

            {/* =================== FOOTER BRAND NAME =================== */}
            <View className="absolute bottom-8">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">MIRAGIO</Text>
            </View>
        </View >
    )
}

export default VerifyCode;
