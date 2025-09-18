import { Image, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import { useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import resetpassimg from "../../assets/images/resetpassimg.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import EmailSentModal from "../../components/EmailSentModal";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const { width, height } = Dimensions.get('window');

const ResetPassword = ({ navigation }: Props) => {

    const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Email validation function
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // FIXED: Send reset code function - using the parameter to avoid warning
    const sendResetCode = async (userEmail: string) => {
        try {
            // Simulate API call delay
            await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

            // TODO: Replace with actual API call when ready
            console.log('Sending reset code to:', userEmail); // Using userEmail parameter
            return { success: true, message: 'Verification code sent successfully' };

            /* 
            // UNCOMMENT WHEN YOU HAVE REAL API:
            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    action: "reset_password_request",
                    email: userEmail  // This uses the parameter when API is active
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                return { success: true, message: 'Verification code sent successfully' };
            } else {
                return { success: false, message: result.message || 'Failed to send verification code' };
            }
            */

        } catch (error) {
            console.error('Reset password API error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Handle request button press
    const handleRequestLoginLink = async () => {
        // Clear previous error
        setErrorMessage("");

        // Validate email input
        if (!email.trim()) {
            setErrorMessage('Please enter your email address');
            return;
        }

        if (!isValidEmail(email.trim())) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            // Call the API function
            const result = await sendResetCode(email.trim());

            if (result.success) {
                // Show success modal
                setShowEmailModal(true);
            } else {
                // Show error message
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle modal close and navigation
    const handleModalClose = () => {
        setShowEmailModal(false);

        // Navigate to verify code screen
        setTimeout(() => {
            navigation.navigate('VerifyCode', { email: email.trim() });
        }, 100);
    };

    // Back button handler
    const handleBackPress = (): void => {
        if (!isLoading) {
            navigation.navigate('SignIn');
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

            {/* Illustration - responsive positioning */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.30  // 24% from top
                }}
            >
                <Image
                    source={resetpassimg}
                    style={{
                        height: height * 0.2,   // 20% of screen height
                        width: width * 0.36,    // 36% of screen width
                        resizeMode: 'contain'
                    }}
                />
            </View>

            {/* Reset Password Instructions - responsive */}
            <View
                className="absolute flex flex-col justify-center items-center"
                style={{
                    top: height * 0.54,  // 46% from top
                    width: width * 0.8,  // 80% of screen width
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.07,
                        lineHeight: width * 0.08
                    }}
                    className="font-bold text-center"
                >
                    Reset Password
                </Text>
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.045,
                        lineHeight: width * 0.055,
                        marginTop: height * 0.02
                    }}
                    className="text-center"
                >
                    We'll send a verification code to your email address.
                </Text>
            </View>

            {/* Email Input Section - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.67,  // 62% from top
                    width: '100%',
                    paddingHorizontal: width * 0.05
                }}
            >
                <View
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        width: '100%',
                        maxWidth: width * 0.9,
                        height: Math.max(48, height * 0.06),
                        borderRadius: 15
                    }}
                    className="flex flex-row items-center"
                >
                    <TextInput
                        style={{
                            backgroundColor: 'transparent',
                            color: Colors.light.blackPrimary,
                            flex: 1,
                            fontSize: Math.min(16, width * 0.035),
                            paddingHorizontal: width * 0.04,
                            paddingVertical: 0
                        }}
                        placeholder="Email"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errorMessage) setErrorMessage("");
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                </View>

                {/* Error message display - responsive */}
                {errorMessage && (
                    <Text
                        style={{
                            color: '#FF4444',
                            fontSize: width * 0.03,
                            textAlign: 'center',
                            marginTop: height * 0.01,
                            fontWeight: '500',
                            width: '100%',
                            maxWidth: width * 0.85
                        }}
                    >
                        {errorMessage}
                    </Text>
                )}
            </View>

            {/* Submit Button - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.78,  // 72% from top
                    width: '100%',
                    paddingHorizontal: width * 0.02
                }}
            >
                <CustomGradientButton
                    text={isLoading ? "Sending..." : "Send Verification Code"}
                    width={Math.min(width * 0.9, 370)}
                    height={Math.max(48, height * 0.06)}
                    borderRadius={15}
                    fontSize={Math.min(18, width * 0.045)}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleRequestLoginLink}
                    disabled={isLoading || !email.trim()}
                    style={{
                        opacity: (isLoading || !email.trim()) ? 0.6 : 1,
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

            {/* Email Sent Modal */}
            <EmailSentModal
                visible={showEmailModal}
                onClose={handleModalClose}
                email={email || "k*******9@gmail.com"}
            />

        </View >
    )
}

export default ResetPassword;