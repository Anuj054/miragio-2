import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import { icons } from '../../constants/index';
import CustomGradientButton from '../../components/CustomGradientButton';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';

// Translation
import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'UserDetails'>;

const { width, height } = Dimensions.get('window');

const UserDetails = ({ navigation }: Props) => {
    // Get all required data from context
    const { step1Data, step2Data, currentUserId, registerStep3, isLoading: contextLoading } = useUser();
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    // Form fields
    const [instagramId, setInstagramId] = useState('');
    const [upiId, setUpiId] = useState('');
    const [panNumber, setPanNumber] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Validate form on mount and whenever dependencies change
    useEffect(() => {
        console.log('===== USERDETAILS SCREEN LOADED =====');
        console.log('Context check:', {
            step1Data: !!step1Data,
            step2Data: !!step2Data,
            currentUserId,
            step1Email: step1Data?.email,
            step2Username: step2Data?.username,
        });

        if (!step1Data) {
            console.error('❌ Missing step1Data');
        }
        if (!step2Data) {
            console.error('❌ Missing step2Data');
        }
        if (!currentUserId) {
            console.error('❌ Missing currentUserId');
        }

        if (!step1Data || !step2Data || !currentUserId) {
            console.error('❌ Missing required context data, redirecting to SignUp');
            setErrorMessage(
                isHi
                    ? 'पंजीकरण डेटा नहीं मिला। कृपया साइनअप से शुरू करें।'
                    : 'Registration data not found. Please start from signup page.'
            );

            const timer = setTimeout(() => {
                navigation.navigate('SignUp');
            }, 2000);

            return () => clearTimeout(timer);
        }

        console.log('✅ UserDetails: All context data available');
        console.log('Step1Data email:', step1Data?.email);
        console.log('Step2Data username:', step2Data?.username);
        console.log('User ID:', currentUserId);
    }, [step1Data, step2Data, currentUserId, navigation, isHi]);

    const validateForm = () => {
        const err = (en: string, hi: string) => (isHi ? hi : en);

        if (!panNumber.trim()) {
            return err('PAN number is required', 'पैन नंबर आवश्यक है');
        }

        if (panNumber.trim().length !== 10) {
            return err('PAN must be 10 characters', 'पैन 10 अक्षरों का होना चाहिए');
        }

        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
            return err('Invalid PAN format (ABCDE1234F)', 'अमान्य पैन प्रारूप (ABCDE1234F)');
        }

        if (upiId.trim() && !/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
            return err('Invalid UPI ID (name@bank)', 'अमान्य UPI आईडी (name@bank)');
        }

        return '';
    };

    const handleRegisterUser = async () => {
        if (isLoading || contextLoading) return;

        // Validate form first
        const validationError = validateForm();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        // Check context data again before submitting
        if (!step1Data || !step2Data || !currentUserId) {
            setErrorMessage(isHi ? 'सत्र समाप्त हो गया।' : 'Session expired.');
            setTimeout(() => navigation.navigate('SignUp'), 2000);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            console.log('🔄 Submitting Step 3 for user:', currentUserId);

            const step3Payload = {
                ...step1Data,
                ...step2Data,
                user_id: currentUserId,
                instagram_username: instagramId.trim() || '',
                upi: upiId.trim() || '',
                pan_number: panNumber.toUpperCase().trim(),
                commission_percent: '0',
            };

            console.log('Step 3 Payload keys:', Object.keys(step3Payload));

            const result = await registerStep3(step3Payload);

            console.log('Step 3 Result:', result);

            if (!result.success) {
                setErrorMessage(result.message || (isHi ? 'पंजीकरण विफल।' : 'Registration failed.'));
                setIsLoading(false);
                return;
            }

            if (!result.userId) {
                setErrorMessage(isHi ? 'उपयोगकर्ता आईडी प्राप्त नहीं हुई।' : 'Failed to get user ID.');
                setIsLoading(false);
                return;
            }

            // Success - show message and navigate
            setErrorMessage(
                isHi
                    ? 'खाता सफलतापूर्वक बनाया गया!'
                    : 'Account created successfully!'
            );

            setTimeout(() => {
                navigation.navigate('Otp', { userId: String(result.userId) });
                setIsLoading(false);
            }, 1500);

        } catch (err) {
            console.error('Error in Step 3:', err);
            setErrorMessage(isHi ? 'नेटवर्क त्रुटि।' : 'Network error.');
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Background Image */}
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

            {/* Footer */}
            <View
                style={{
                    position: 'absolute',
                    bottom: height * 0.04,
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
                    <View style={{ minHeight: height, paddingHorizontal: width * 0.05, paddingBottom: height * 0.15 }}>
                        {/* Back Button */}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                left: width * 0.04,
                                top: height * 0.09,
                                width: width * 0.12,
                                height: height * 0.06,
                                zIndex: 10,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => navigation.goBack()}
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

                        {/* Title */}
                        <View style={{
                            alignItems: 'center',
                            marginTop: height * 0.04,
                            marginBottom: height * 0.04,
                            zIndex: 5
                        }}>
                            <TranslatedText
                                className="font-bold text-center"
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.075,
                                }}
                            >
                                {isHi ? 'अतिरिक्त विवरण' : 'Additional Details'}
                            </TranslatedText>
                        </View>

                        {/* Form Container */}
                        <View style={{ alignItems: 'center', zIndex: 5 }}>
                            {/* Instagram ID Input */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                    marginBottom: height * 0.022,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <TextInput
                                    style={{
                                        flex: 1,
                                        paddingHorizontal: width * 0.04,
                                        paddingVertical: 0,
                                        color: Colors.light.blackPrimary,
                                        fontSize: Math.min(16, width * 0.035),
                                        backgroundColor: 'transparent'
                                    }}
                                    placeholder={isHi ? 'इंस्टाग्राम आईडी' : 'Instagram ID'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={instagramId}
                                    onChangeText={(t) => {
                                        setInstagramId(t);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !contextLoading}
                                />
                            </View>

                            {/* UPI ID Input */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                    marginBottom: height * 0.022,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <TextInput
                                    style={{
                                        flex: 1,
                                        paddingHorizontal: width * 0.04,
                                        paddingVertical: 0,
                                        color: Colors.light.blackPrimary,
                                        fontSize: Math.min(16, width * 0.035),
                                        backgroundColor: 'transparent'
                                    }}
                                    placeholder={isHi ? 'UPI आईडी' : 'UPI ID'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={upiId}
                                    onChangeText={(t) => {
                                        setUpiId(t);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    editable={!isLoading && !contextLoading}
                                />
                            </View>

                            {/* PAN Number Input */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                    marginBottom: height * 0.03,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <TextInput
                                    style={{
                                        flex: 1,
                                        paddingHorizontal: width * 0.04,
                                        paddingVertical: 0,
                                        color: Colors.light.blackPrimary,
                                        fontSize: Math.min(16, width * 0.035),
                                        backgroundColor: 'transparent'
                                    }}
                                    placeholder={isHi ? 'पैन नंबर*' : 'PAN Number*'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={panNumber}
                                    onChangeText={(t) => {
                                        setPanNumber(t.toUpperCase());
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    maxLength={10}
                                    editable={!isLoading && !contextLoading}
                                />
                            </View>

                            {/* Error/Success Message */}
                            {errorMessage ? (
                                <View style={{ marginBottom: height * 0.03, width: '100%' }}>
                                    <Text
                                        style={{
                                            color: errorMessage.includes('success') || errorMessage.includes('सफल')
                                                ? '#10B981'
                                                : '#EF4444',
                                            textAlign: 'center',
                                            fontSize: width * 0.035
                                        }}
                                    >
                                        {errorMessage}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Register Button */}
                            <View style={{ alignItems: 'center', marginBottom: height * 0.05 }}>
                                <CustomGradientButton
                                    text={
                                        isLoading || contextLoading
                                            ? (isHi ? 'खाता बना रहे हैं...' : 'Creating Account...')
                                            : (isHi ? 'पंजीकरण पूर्ण करें' : 'Complete Registration')
                                    }
                                    width={Math.min(width * 0.9, 500)}
                                    height={Math.max(48, height * 0.06)}
                                    borderRadius={100}
                                    fontSize={Math.min(18, width * 0.045)}
                                    textColor={Colors.light.whiteFfffff}
                                    onPress={handleRegisterUser}
                                    disabled={isLoading || contextLoading}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default UserDetails;