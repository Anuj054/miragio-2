import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import resetpassimg from "../../assets/images/resetpassimg.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import EmailSentModal from "../../components/EmailSentModal";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../Navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

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

            {/* =================== ILLUSTRATION SECTION =================== */}
            <View className="absolute top-[280px]">
                <Image source={resetpassimg}
                    className="h-[170px] w-[142px]" />
            </View>

            {/* =================== RESET PASSWORD INSTRUCTIONS SECTION =================== */}
            <View className="absolute top-[490px] flex flex-col justify-center items-center w-[300px]">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">Reset Password</Text>
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-xl mt-5 text-center ">We'll send a verification code to your email address.</Text>
            </View>

            {/* =================== EMAIL INPUT SECTION =================== */}
            <View className="absolute top-[610px]"> {/* FIXED: Changed from top-[60px] to top-[610px] */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] ">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[320px] h-[56px] ml-6"
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

                {/* Error message display */}
                {errorMessage && (
                    <Text
                        style={{
                            color: '#FF4444',
                            fontSize: 14,
                            textAlign: 'center',
                            marginTop: 8,
                            fontWeight: '500',
                        }}
                    >
                        {errorMessage}
                    </Text>
                )}
            </View>

            {/* =================== SUBMIT BUTTON SECTION =================== */}
            <View className="absolute top-[720px]" >
                <CustomGradientButton
                    text={isLoading ? "Sending..." : "Send Verification Code"}
                    width={370}
                    height={56}
                    borderRadius={15}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleRequestLoginLink}
                    disabled={isLoading || !email.trim()}
                    style={{
                        opacity: (isLoading || !email.trim()) ? 0.6 : 1,
                    }}
                />
            </View>

            {/* =================== FOOTER BRAND NAME =================== */}
            <View className="absolute bottom-8">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">MIRAGIO</Text>
            </View>

            {/* =================== EMAIL SENT MODAL =================== */}
            <EmailSentModal
                visible={showEmailModal}
                onClose={handleModalClose}
                email={email || "k*******9@gmail.com"}
            />

        </View >
    )
}

export default ResetPassword;
