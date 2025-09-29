import React, { useState, useEffect } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,   // ✅ NEW
    Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bg from '../../assets/images/bg.png';
import logo from '../../assets/images/MIRAGIO--LOGO.png';
import { icons } from '../../constants/index';
import CustomGradientButton from '../../components/CustomGradientButton';
import { Colors } from '../../constants/Colors';

// ✅ Translation
import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYC'>;

const { width, height } = Dimensions.get('window');

interface SignupData {
    email: string;
    password: string;
    referral_code: string;
    user_role: string;
    status: string;
}

interface RegistrationData extends SignupData {
    username: string;
    aadharnumber: string;
    age: string;
    gender: string;
    occupation: string;
    phone_number: string;
}

const KYC = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const [signupData, setSignupData] = useState<SignupData | null>(null);

    const [aadharNumber, setAadharNumber] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedOccupation, setSelectedOccupation] = useState('');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [genderSearchQuery, setGenderSearchQuery] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const occupations = [
        { label: isHi ? 'डॉक्टर' : 'Doctor', value: 'doctor' },
        { label: isHi ? 'इंजीनियर' : 'Engineer', value: 'engineer' },
        { label: isHi ? 'वकील' : 'Lawyer', value: 'lawyer' },
        { label: isHi ? 'शिक्षक' : 'Teacher', value: 'teacher' },
        { label: isHi ? 'व्यवसायी' : 'Business Owner', value: 'business_owner' },
        { label: isHi ? 'छात्र' : 'Student', value: 'student' },
        { label: isHi ? 'अकाउंटेंट' : 'Accountant', value: 'accountant' },
        { label: isHi ? 'नर्स' : 'Nurse', value: 'nurse' },
        { label: isHi ? 'डेवलपर' : 'Developer', value: 'developer' },
        { label: isHi ? 'डिज़ाइनर' : 'Designer', value: 'designer' },
        { label: isHi ? 'वेब डेवलपर' : 'Web Developer', value: 'web_developer' },
        { label: isHi ? 'अन्य' : 'Others', value: 'others' },
    ];

    const genderOptions = [
        { label: isHi ? 'पुरुष' : 'Male', value: 'male' },
        { label: isHi ? 'महिला' : 'Female', value: 'female' },
        { label: isHi ? 'नहीं बताना चाहते' : 'Prefer Not to Say', value: 'prefer' },
        { label: isHi ? 'अन्य' : 'Other', value: 'other' },
    ];

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('@signup_data');
                if (stored) setSignupData(JSON.parse(stored));
                else {
                    setErrorMessage(
                        isHi
                            ? 'साइनअप डेटा नहीं मिला। कृपया साइनअप से शुरू करें।'
                            : 'Signup data not found. Please start from signup page.'
                    );
                    setTimeout(() => navigation.navigate('SignUp'), 2000);
                }
            } catch {
                setErrorMessage(
                    isHi ? 'डेटा लोड करने में त्रुटि।' : 'Error loading signup data.'
                );
            }
        })();
    }, [isHi, navigation]);

    const validateForm = () => {
        const err = (en: string, hi: string) => (isHi ? hi : en);
        if (!aadharNumber.trim())
            return err('Please enter Aadhar number', 'कृपया आधार नंबर दर्ज करें');
        if (aadharNumber.length !== 12)
            return err('Aadhar number must be 12 digits', 'आधार नंबर 12 अंकों का होना चाहिए');
        if (!username.trim())
            return err('Please enter username', 'कृपया यूज़रनेम दर्ज करें');
        if (!age.trim())
            return err('Please enter age', 'कृपया उम्र दर्ज करें');
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100)
            return err('Enter valid age (18-100)', 'उम्र 18 से 100 के बीच होनी चाहिए');
        if (!gender.trim())
            return err('Please select gender', 'कृपया लिंग चुनें');
        if (!selectedOccupation)
            return err('Please select occupation', 'कृपया व्यवसाय चुनें');
        if (!phoneNumber.trim())
            return err('Please enter phone number', 'कृपया फ़ोन नंबर दर्ज करें');
        if (phoneNumber.length !== 10)
            return err('Phone number must be 10 digits', 'फ़ोन नंबर 10 अंकों का होना चाहिए');
        return '';
    };

    const proceed = async () => {
        if (isLoading) return;
        const e = validateForm();
        if (e) {
            setErrorMessage(e);
            return;
        }
        if (!signupData) return;
        setIsLoading(true);
        try {
            const occLabel =
                occupations.find(o => o.value === selectedOccupation)?.label ||
                selectedOccupation;
            const data: RegistrationData = {
                ...signupData,
                username,
                aadharnumber: aadharNumber,
                age,
                gender,
                occupation: occLabel,
                phone_number: phoneNumber,
            };
            await AsyncStorage.setItem('@registration_data', JSON.stringify(data));
            navigation.navigate('UserDetails');
        } catch {
            setErrorMessage(
                isHi ? 'डेटा सेव करने में त्रुटि।' : 'Error saving data.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOccupations = occupations.filter(o =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredGender = genderOptions.filter(g =>
        g.label.toLowerCase().includes(genderSearchQuery.toLowerCase())
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // ✅ moves UI up on keyboard show
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ minHeight: height }}
                keyboardShouldPersistTaps="handled"                  // ✅ tap outside to dismiss keyboard
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
                        {isHi ? 'केवाईसी विवरण भरें' : 'Fill KYC Details'}
                    </TranslatedText>

                    {/* Input Fields */}
                    <View
                        className="absolute items-center"
                        style={{
                            top: height * 0.31,
                            width: '100%',
                            paddingHorizontal: width * 0.05,
                        }}
                    >
                        {/* Aadhar Number */}
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
                                placeholder={isHi ? 'आधार नंबर दर्ज करें*' : 'Enter Aadhar Number*'}
                                placeholderTextColor={Colors.light.placeholderColor}
                                value={aadharNumber}
                                onChangeText={(t) => { setAadharNumber(t.replace(/[^0-9]/g, '')); if (errorMessage) setErrorMessage(''); }}
                                keyboardType="numeric"
                                maxLength={12}
                            />
                        </View>

                        {/* Username */}
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
                                placeholder={isHi ? 'यूज़रनेम दर्ज करें*' : 'Enter Username*'}
                                placeholderTextColor={Colors.light.placeholderColor}
                                value={username}
                                onChangeText={(t) => { setUsername(t); if (errorMessage) setErrorMessage(''); }}
                            />
                        </View>

                        {/* Age */}
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
                                placeholder={isHi ? 'उम्र दर्ज करें*' : 'Enter Age*'}
                                placeholderTextColor={Colors.light.placeholderColor}
                                value={age}
                                onChangeText={(t) => { setAge(t.replace(/[^0-9]/g, '')); if (errorMessage) setErrorMessage(''); }}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                        </View>

                        {/* Phone Number */}
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
                                placeholder={isHi ? 'फ़ोन नंबर दर्ज करें*' : 'Enter Phone Number*'}
                                placeholderTextColor={Colors.light.placeholderColor}
                                value={phoneNumber}
                                onChangeText={(t) => { setPhoneNumber(t.replace(/[^0-9]/g, '')); if (errorMessage) setErrorMessage(''); }}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        {/* Gender Dropdown */}
                        <View
                            className="relative"
                            style={{
                                width: '100%',
                                maxWidth: width * 0.9,
                                marginBottom: height * 0.022,
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                }}
                                className="flex flex-row items-center justify-between px-4"
                                onPress={() => {
                                    setIsGenderDropdownOpen(!isGenderDropdownOpen);
                                    setGenderSearchQuery('');
                                }}
                            >
                                <Text
                                    style={{
                                        color: gender ? Colors.light.blackPrimary : Colors.light.placeholderColor,
                                        fontSize: Math.min(16, width * 0.035),
                                    }}
                                >
                                    {gender || (isHi ? 'लिंग चुनें*' : 'Select Gender*')}
                                </Text>
                                <Image
                                    source={isGenderDropdownOpen ? icons.dropdownicon : icons.upicon}
                                    style={{ width: width * 0.03, height: width * 0.03 }}
                                />
                            </TouchableOpacity>
                            {isGenderDropdownOpen && (
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderWidth: 1,
                                        borderColor: Colors.light.secondaryText,
                                        position: 'absolute',
                                        top: Math.max(48, height * 0.06),
                                        width: '100%',
                                        zIndex: 1000,
                                        borderRadius: 10,
                                        maxHeight: height * 0.25,
                                    }}
                                >
                                    <TextInput
                                        style={{
                                            backgroundColor: Colors.light.whiteFefefe,
                                            color: Colors.light.blackPrimary,
                                            paddingHorizontal: width * 0.03,
                                            height: height * 0.05,
                                        }}
                                        placeholder={isHi ? 'लिंग खोजें...' : 'Search gender...'}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        value={genderSearchQuery}
                                        onChangeText={setGenderSearchQuery}
                                    />
                                    <ScrollView style={{ maxHeight: height * 0.18 }}>
                                        {filteredGender.length > 0 ? (
                                            filteredGender.map((g, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={{
                                                        paddingHorizontal: width * 0.04,
                                                        height: Math.max(48, height * 0.06),
                                                        borderBottomWidth: i < filteredGender.length - 1 ? 1 : 0,
                                                        borderColor: Colors.light.secondaryText,
                                                    }}
                                                    className="justify-center"
                                                    onPress={() => {
                                                        setGender(g.label);
                                                        setIsGenderDropdownOpen(false);
                                                        setGenderSearchQuery('');
                                                        if (errorMessage) setErrorMessage('');
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: Colors.light.blackPrimary,
                                                            fontSize: Math.min(16, width * 0.04),
                                                        }}
                                                    >
                                                        {g.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <View style={{ padding: width * 0.04 }}>
                                                <Text style={{ color: Colors.light.placeholderColor }}>
                                                    {isHi ? 'कोई विकल्प नहीं' : 'No options'}
                                                </Text>
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Occupation Dropdown */}
                        <View
                            className="relative"
                            style={{
                                width: '100%',
                                maxWidth: width * 0.9,
                                marginBottom: height * 0.01,
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    height: Math.max(48, height * 0.06),
                                    borderRadius: 15,
                                }}
                                className="flex flex-row items-center justify-between px-4"
                                onPress={() => {
                                    setIsDropdownOpen(!isDropdownOpen);
                                    setSearchQuery('');
                                }}
                            >
                                <Text
                                    style={{
                                        color: selectedOccupation
                                            ? Colors.light.blackPrimary
                                            : Colors.light.placeholderColor,
                                        fontSize: Math.min(16, width * 0.035),
                                    }}
                                >
                                    {selectedOccupation
                                        ? occupations.find(o => o.value === selectedOccupation)?.label ?? ''
                                        : isHi
                                            ? 'व्यवसाय चुनें*'
                                            : 'Select Occupation*'}
                                </Text>
                                <Image
                                    source={isDropdownOpen ? icons.dropdownicon : icons.upicon}
                                    style={{ width: width * 0.03, height: width * 0.03 }}
                                />
                            </TouchableOpacity>
                            {isDropdownOpen && (
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderWidth: 1,
                                        borderColor: Colors.light.secondaryText,
                                        position: 'absolute',
                                        top: Math.max(48, height * 0.06),
                                        width: '100%',
                                        zIndex: 1000,
                                        borderRadius: 10,
                                        maxHeight: height * 0.25,
                                    }}
                                >
                                    <TextInput
                                        style={{
                                            backgroundColor: Colors.light.whiteFefefe,
                                            color: Colors.light.blackPrimary,
                                            paddingHorizontal: width * 0.03,
                                            height: height * 0.05,
                                        }}
                                        placeholder={isHi ? 'व्यवसाय खोजें...' : 'Search occupation...'}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                    <ScrollView style={{ maxHeight: height * 0.18 }}>
                                        {filteredOccupations.length > 0 ? (
                                            filteredOccupations.map((o, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={{
                                                        paddingHorizontal: width * 0.04,
                                                        height: Math.max(48, height * 0.06),
                                                        borderBottomWidth: i < filteredOccupations.length - 1 ? 1 : 0,
                                                        borderColor: Colors.light.secondaryText,
                                                    }}
                                                    className="justify-center"
                                                    onPress={() => {
                                                        setSelectedOccupation(o.value);
                                                        setIsDropdownOpen(false);
                                                        setSearchQuery('');
                                                        if (errorMessage) setErrorMessage('');
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: Colors.light.blackPrimary,
                                                            fontSize: Math.min(16, width * 0.04),
                                                        }}
                                                    >
                                                        {o.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <View style={{ padding: width * 0.04 }}>
                                                <Text style={{ color: Colors.light.placeholderColor }}>
                                                    {isHi ? 'कोई व्यवसाय नहीं' : 'No occupations'}
                                                </Text>
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {errorMessage ? (
                            <Text style={{ color: '#EF4444', textAlign: 'center' }}>
                                {errorMessage}
                            </Text>
                        ) : null}
                    </View>

                    {/* Next Button */}
                    <View
                        className="absolute items-center"
                        style={{ top: height * 0.82, width: '100%' }}
                    >
                        <CustomGradientButton
                            text={
                                isLoading
                                    ? (isHi ? 'सेव हो रहा है...' : 'Saving...')
                                    : (isHi ? 'अगला' : 'Next')
                            }
                            width={Math.min(width * 0.9, 500)}
                            height={Math.max(48, height * 0.06)}
                            borderRadius={100}
                            fontSize={Math.min(18, width * 0.045)}
                            textColor={Colors.light.whiteFfffff}
                            onPress={proceed}
                            disabled={isLoading}
                        />
                    </View>

                    {/* Footer */}
                    <View
                        className="absolute items-center"
                        style={{ bottom: height * 0.04 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.07,
                            }}
                            className="font-bold"
                        >
                            MIRAGIO
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default KYC;
