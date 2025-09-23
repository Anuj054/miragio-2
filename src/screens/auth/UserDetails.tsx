import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import { icons } from '../../constants/index';
import CustomGradientButton from '../../components/CustomGradientButton';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';

// ✅ Translation
import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'UserDetails'>;

const { width, height } = Dimensions.get('window');

interface RegistrationData {
    email: string;
    password: string;
    referral_code: string;
    user_role: string;
    status: string;
    username: string;
    aadharnumber: string;
    age: string;
    gender: string;
    occupation: string;
    phone_number: string;
}

const UserDetails = ({ navigation }: Props) => {
    const { isLoading: contextLoading } = useUser();
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

    // Form fields
    const [instagramId, setInstagramId] = useState('');
    const [upiId, setUpiId] = useState('');
    const [panNumber, setPanNumber] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('@registration_data');
                if (stored) setRegistrationData(JSON.parse(stored));
                else {
                    setErrorMessage(
                        isHi
                            ? 'पंजीकरण डेटा नहीं मिला। कृपया साइनअप से शुरू करें।'
                            : 'Registration data not found. Please start from signup page.'
                    );
                    setTimeout(() => navigation.navigate('SignUp'), 3000);
                }
            } catch {
                setErrorMessage(
                    isHi ? 'डेटा लोड करने में त्रुटि।' : 'Error loading data.'
                );
            }
        })();
    }, [isHi, navigation]);

    const validateForm = () => {
        const err = (en: string, hi: string) => (isHi ? hi : en);
        if (!panNumber.trim())
            return err('PAN number is required', 'पैन नंबर आवश्यक है');
        if (panNumber.trim().length !== 10)
            return err('PAN must be 10 characters', 'पैन 10 अक्षरों का होना चाहिए');
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase()))
            return err('Invalid PAN format (ABCDE1234F)', 'अमान्य पैन प्रारूप (ABCDE1234F)');
        if (upiId.trim() && !/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId))
            return err('Invalid UPI ID (name@bank)', 'अमान्य UPI आईडी (name@bank)');
        if (!registrationData)
            return err('Missing registration data', 'पंजीकरण डेटा अनुपलब्ध है');
        return '';
    };

    const registerUser = async () => {
        if (isLoading || contextLoading) return;
        const e = validateForm();
        if (e) { setErrorMessage(e); return; }
        if (!registrationData) return;

        setIsLoading(true);
        try {
            const payload = {
                action: 'adduser',
                username: registrationData.username,
                password: registrationData.password,
                email: registrationData.email,
                age: registrationData.age,
                gender: registrationData.gender,
                occupation: registrationData.occupation,
                aadharnumber: registrationData.aadharnumber,
                phone_number: registrationData.phone_number,
                instagram_username: instagramId.trim(),
                pan_number: panNumber.toUpperCase(),
                upi: upiId.trim(),
                user_role: 'user',
                referral_code: registrationData.referral_code,
                status: '1',
            };

            const res = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            const result = JSON.parse(text);

            if (result.status === 'success') {
                const userId = result.data?.id || result.id;
                await AsyncStorage.setItem('@new_account_credentials',
                    JSON.stringify({ email: registrationData.email, password: registrationData.password })
                );
                await Promise.all([
                    AsyncStorage.removeItem('@signup_data'),
                    AsyncStorage.removeItem('@registration_data'),
                ]);

                setErrorMessage(isHi
                    ? 'खाता सफलतापूर्वक बनाया गया!'
                    : 'Account created successfully!');

                setTimeout(() => {
                    if (userId) {
                        AsyncStorage.setItem('@pending_user_id', String(userId));
                        navigation.navigate('Otp', { userId: String(userId) });
                    } else navigation.navigate('Otp', {});
                }, 2000);
            } else {
                setErrorMessage(result.message || (isHi ? 'पंजीकरण विफल।' : 'Registration failed.'));
            }
        } catch {
            setErrorMessage(isHi ? 'नेटवर्क त्रुटि।' : 'Network error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ minHeight: height }}
        >
            <View className="flex-1 items-center">
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
                {/* Back */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        left: width * 0.04,
                        top: height * 0.09,
                        width: width * 0.12,
                        height: height * 0.06,
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={icons.back}
                        style={{ width: width * 0.06, height: width * 0.07 }}
                    />
                </TouchableOpacity>

                {/* Logo */}
                <Image
                    source={logo}
                    style={{
                        position: 'absolute',
                        top: height * 0.08,
                        width: width * 0.25,
                        height: width * 0.22,
                    }}
                />

                {/* Title */}
                <TranslatedText
                    className="font-bold text-center"
                    style={{
                        position: 'absolute',
                        top: height * 0.23,
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.075,
                    }}
                >
                    {isHi ? 'अतिरिक्त विवरण' : 'Additional Details'}
                </TranslatedText>

                {/* Inputs */}
                <View
                    className="absolute items-center"
                    style={{
                        top: height * 0.31,
                        width: '100%',
                        paddingHorizontal: width * 0.05,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022,
                        }}
                        className="flex flex-row items-center"
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                paddingHorizontal: width * 0.04,
                                color: Colors.light.blackPrimary,
                                fontSize: Math.min(16, width * 0.035),
                            }}
                            placeholder={isHi ? 'इंस्टाग्राम आईडी' : 'Instagram ID'}
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={instagramId}
                            onChangeText={(t) => { setInstagramId(t); if (errorMessage) setErrorMessage(''); }}
                            autoCapitalize="none"
                        />
                    </View>

                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022,
                        }}
                        className="flex flex-row items-center"
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                paddingHorizontal: width * 0.04,
                                color: Colors.light.blackPrimary,
                                fontSize: Math.min(16, width * 0.035),
                            }}
                            placeholder={isHi ? 'UPI आईडी' : 'UPI ID'}
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={upiId}
                            onChangeText={(t) => { setUpiId(t); if (errorMessage) setErrorMessage(''); }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.01,
                        }}
                        className="flex flex-row items-center"
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                paddingHorizontal: width * 0.04,
                                color: Colors.light.blackPrimary,
                                fontSize: Math.min(16, width * 0.035),
                            }}
                            placeholder={isHi ? 'पैन नंबर*' : 'PAN Number*'}
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={panNumber}
                            onChangeText={(t) => { setPanNumber(t.toUpperCase()); if (errorMessage) setErrorMessage(''); }}
                            autoCapitalize="characters"
                            maxLength={10}
                        />
                    </View>

                    {errorMessage ? (
                        <Text
                            style={{
                                color: errorMessage.includes('success') || errorMessage.includes('सफल')
                                    ? '#10B981'
                                    : '#EF4444',
                                textAlign: 'center',
                            }}
                        >
                            {errorMessage}
                        </Text>
                    ) : null}
                </View>

                {/* Button */}
                <View
                    className="absolute items-center"
                    style={{ top: height * 0.6, width: '100%' }}
                >
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
                        onPress={registerUser}
                        disabled={isLoading || contextLoading}
                    />
                </View>

                {/* Footer */}
                <View
                    className="absolute items-center"
                    style={{ bottom: height * 0.04 }}
                >
                    <Text
                        style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.07 }}
                        className="font-bold"
                    >
                        MIRAGIO
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default UserDetails;
