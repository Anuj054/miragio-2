import {
    Image, Text, TextInput, TouchableOpacity, View, Dimensions, KeyboardAvoidingView,   // ✅ NEW
    Platform,              // ✅ NEW
    ScrollView
} from "react-native";
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
// Translation imports - USING OUR CUSTOM COMPONENTS
import { TranslatedText } from '../../components/TranslatedText';
import { useTranslation } from '../../context/TranslationContext';
import { usePlaceholder } from '../../hooks/useTranslatedText';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const { width, height } = Dimensions.get('window');

const ResetPassword = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();

    const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Using our custom placeholder hook
    const emailPlaceholder = usePlaceholder('Email', 'ईमेल');

    // Email validation function
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Send reset code function
    const sendResetCode = async (userEmail: string) => {
        try {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
            console.log('Sending reset code to:', userEmail);
            return { success: true, message: 'Verification code sent successfully' };
        } catch (error) {
            console.error('Reset password API error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Handle request button press
    const handleRequestLoginLink = async () => {
        setErrorMessage("");

        // Validate email input - using conditional for error messages
        if (!email.trim()) {
            setErrorMessage(currentLanguage === 'hi' ? 'कृपया अपना ईमेल पता दर्ज करें' : 'Please enter your email address');
            return;
        }

        if (!isValidEmail(email.trim())) {
            setErrorMessage(currentLanguage === 'hi' ? 'कृपया वैध ईमेल पता दर्ज करें' : 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const result = await sendResetCode(email.trim());

            if (result.success) {
                setShowEmailModal(true);
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setErrorMessage(currentLanguage === 'hi' ? 'कुछ गलत हुआ। कृपया फिर से कोशिश करें।' : 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowEmailModal(false);
        setTimeout(() => {
            navigation.navigate('VerifyCode', { email: email.trim() });
        }, 100);
    };

    const handleBackPress = (): void => {
        if (!isLoading) {
            navigation.navigate('SignIn');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // ✅ moves UI when keyboard opens
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"                   // ✅ dismiss keyboard on outside tap
            >
                <View className="flex-1 items-center">
                    {/* Background Image */}
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#000', // Fallback color
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

                    {/* Illustration */}
                    <View
                        className="absolute items-center"
                        style={{
                            top: height * 0.30
                        }}
                    >
                        <Image
                            source={resetpassimg}
                            style={{
                                height: height * 0.2,
                                width: width * 0.36,
                                resizeMode: 'contain'
                            }}
                        />
                    </View>

                    {/* Reset Password Instructions - USING TranslatedText */}
                    <View
                        className="absolute flex flex-col justify-center items-center"
                        style={{
                            top: height * 0.54,
                            width: width * 0.8,
                            paddingHorizontal: width * 0.04
                        }}
                    >
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.07,
                                lineHeight: width * 0.09,
                                width: width * 0.9
                            }}
                            className="font-bold text-center"
                        >
                            Reset Password
                        </TranslatedText>
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045,
                                lineHeight: width * 0.07,
                                marginTop: height * 0.02
                            }}
                            className="text-center"
                        >
                            We'll send a verification code to your email address.
                        </TranslatedText>
                    </View>

                    {/* Email Input Section - using our placeholder hook */}
                    <View
                        className="absolute items-center"
                        style={{
                            top: height * 0.69,
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
                                placeholder={emailPlaceholder}
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

                    {/* Submit Button - USING conditional for button text only */}
                    <View
                        className="absolute items-center"
                        style={{
                            top: height * 0.8,
                            width: '100%',
                            paddingHorizontal: width * 0.02
                        }}
                    >
                        <CustomGradientButton
                            text={isLoading ? (currentLanguage === 'hi' ? "भेज रहे हैं..." : "Sending...") : (currentLanguage === 'hi' ? "सत्यापन कोड भेजें" : "Send Verification Code")}
                            width={Math.min(width * 0.9, 500)}
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

                    {/* Email Sent Modal */}
                    <EmailSentModal
                        visible={showEmailModal}
                        onClose={handleModalClose}
                        email={email || "k*******9@gmail.com"}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ResetPassword;