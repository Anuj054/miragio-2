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

type Props = NativeStackScreenProps<AuthStackParamList, 'KYC'>;

const { width, height } = Dimensions.get('window');

const KYC = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    // Get data from context
    const { step1Data, currentUserId, registerStep2, isLoading: contextLoading } = useUser();

    const [aadharNumber, setAadharNumber] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [city, setCity] = useState('');

    const [selectedOccupation, setSelectedOccupation] = useState('');
    const [isDropdownActive, setIsDropdownActive] = useState(false);

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
                // Check if we have step1 data from context
                if (!step1Data || !currentUserId) {
                    setErrorMessage(
                        isHi
                            ? 'पंजीकरण डेटा नहीं मिला। कृपया साइनअप से शुरू करें।'
                            : 'Registration data not found. Please start from signup page.'
                    );
                    setTimeout(() => navigation.navigate('SignUp'), 2000);
                    return;
                }

                console.log('✅ KYC Screen loaded with User ID:', currentUserId);
            } catch (err) {
                console.error('❌ Error loading KYC:', err);
                setErrorMessage(
                    isHi ? 'डेटा लोड करने में त्रुटि।' : 'Error loading data.'
                );
            }
        })();
    }, [step1Data, currentUserId, isHi, navigation]);

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
        if (!city.trim())
            return err('Please enter city', 'कृपया शहर दर्ज करें');

        if (phoneNumber.length !== 10)
            return err('Phone number must be 10 digits', 'फ़ोन नंबर 10 अंकों का होना चाहिए');

        return '';
    };

    const proceed = async () => {
        if (isLoading || contextLoading) return;

        const e = validateForm();
        if (e) {
            setErrorMessage(e);
            return;
        }

        if (!step1Data || !currentUserId) {
            setErrorMessage(isHi ? 'सत्र समाप्त हो गया।' : 'Session expired.');
            setTimeout(() => navigation.navigate('SignUp'), 2000);
            return;
        }

        try {
            console.log('🔄 KYC - Calling registerStep2 for user:', currentUserId);

            const occLabel =
                occupations.find(o => o.value === selectedOccupation)?.label ||
                selectedOccupation;

            const step2Data = {
                ...step1Data,
                user_id: currentUserId,
                username,
                aadharnumber: aadharNumber,
                age,
                gender,
                occupation: occLabel,
                phone_number: phoneNumber,
                city: city,
            };

            console.log('KYC - Step2 Payload:', { user_id: step2Data.user_id, username, aadhar: aadharNumber });

            const result = await registerStep2(step2Data);

            console.log('KYC - API Response:', { success: result.success, message: result.message });

            if (result.success !== true) {
                setErrorMessage(result.message || (isHi ? 'चरण 2 विफल।' : 'Step 2 failed.'));
                console.error('❌ KYC - Step 2 failed:', result.message);
                return;
            }

            console.log('✅ KYC - Step 2 completed successfully');
            console.log('KYC - About to set loading and navigate to UserDetails');
            setIsLoading(true);

            setTimeout(() => {
                console.log('KYC - Navigating to UserDetails');
                navigation.navigate('UserDetails');
                setIsLoading(false);
            }, 800);

        } catch (err) {
            console.error('❌ KYC - Error in proceed:', err);
            setErrorMessage(
                isHi ? 'डेटा सेव करने में त्रुटि।' : 'Error saving data.'
            );
        }
    };

    const filteredOccupations = occupations.filter(o =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredGender = genderOptions.filter(g =>
        g.label.toLowerCase().includes(genderSearchQuery.toLowerCase())
    );

    return (
        <View style={{ flex: 1 }}>
            {/* Background Image - Fixed */}
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

            {/* Fixed Footer - Outside KeyboardAvoidingView */}
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
                        fontSize: width * 0.07,
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
                    scrollEnabled={!isDropdownActive}
                    nestedScrollEnabled={true}
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
                                {isHi ? 'केवाईसी विवरण भरें' : 'Fill KYC Details'}
                            </TranslatedText>
                        </View>

                        {/* Form Container */}
                        <View style={{ alignItems: 'center', zIndex: 5 }}>
                            {/* Aadhar Number */}
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
                                    placeholder={isHi ? 'आधार नंबर दर्ज करें*' : 'Enter Aadhar Number*'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={aadharNumber}
                                    onChangeText={(t) => {
                                        setAadharNumber(t.replace(/[^0-9]/g, ''));
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    keyboardType="numeric"
                                    maxLength={12}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !contextLoading}
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
                                    placeholder={isHi ? 'यूज़रनेम दर्ज करें*' : 'Enter Username*'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={username}
                                    onChangeText={(t) => {
                                        setUsername(t);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !contextLoading}
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
                                    placeholder={isHi ? 'उम्र दर्ज करें*' : 'Enter Age*'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={age}
                                    onChangeText={(t) => {
                                        setAge(t.replace(/[^0-9]/g, ''));
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !contextLoading}
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
                                    placeholder={isHi ? 'फ़ोन नंबर दर्ज करें*' : 'Enter Phone Number*'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={phoneNumber}
                                    onChangeText={(t) => {
                                        setPhoneNumber(t.replace(/[^0-9]/g, ''));
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !contextLoading}
                                />
                            </View>
                            {/* City Field */}
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
                                    placeholder={isHi ? 'शहर दर्ज करें*' : 'Enter City*'}
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={city}
                                    onChangeText={(t) => {
                                        setCity(t);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    editable={!isLoading && !contextLoading}
                                />
                            </View>


                            {/* Gender Dropdown */}
                            <View
                                style={{
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    marginBottom: height * 0.022,
                                    position: 'relative'
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        height: Math.max(48, height * 0.06),
                                        borderRadius: 15,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: width * 0.04
                                    }}
                                    onPress={() => {
                                        const willOpen = !isGenderDropdownOpen;
                                        setIsGenderDropdownOpen(willOpen);
                                        setIsDropdownActive(willOpen); // ✅ lock/unlock screen scroll
                                        setGenderSearchQuery('');
                                        if (isDropdownOpen) {
                                            setIsDropdownOpen(false);
                                        }
                                    }}
                                    disabled={isLoading || contextLoading}
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
                                            elevation: 20,
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
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />

                                        <ScrollView
                                            nestedScrollEnabled
                                            keyboardShouldPersistTaps="handled"
                                            style={{ maxHeight: height * 0.18 }}
                                        >
                                            {filteredGender.length > 0 ? (
                                                filteredGender.map((g, i) => (
                                                    <TouchableOpacity
                                                        key={i}
                                                        style={{
                                                            paddingHorizontal: width * 0.04,
                                                            height: Math.max(48, height * 0.06),
                                                            borderBottomWidth: i < filteredGender.length - 1 ? 1 : 0,
                                                            borderColor: Colors.light.secondaryText,
                                                            justifyContent: 'center'
                                                        }}
                                                        onPress={() => {
                                                            setGender(g.label);
                                                            setIsGenderDropdownOpen(false);
                                                            setIsDropdownActive(false); // ✅ unlock scroll
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
                                style={{
                                    width: '100%',
                                    maxWidth: width * 0.9,
                                    marginBottom: height * 0.03,
                                    position: 'relative'
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        height: Math.max(48, height * 0.06),
                                        borderRadius: 15,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: width * 0.04
                                    }}
                                    onPress={() => {
                                        const willOpen = !isDropdownOpen;
                                        setIsDropdownOpen(willOpen);
                                        setIsDropdownActive(willOpen); // ✅ lock/unlock scroll
                                        setSearchQuery('');
                                        if (isGenderDropdownOpen) {
                                            setIsGenderDropdownOpen(false);
                                        }
                                    }}
                                    disabled={isLoading || contextLoading}
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
                                            elevation: 20,
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
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />

                                        <ScrollView
                                            nestedScrollEnabled
                                            keyboardShouldPersistTaps="handled"
                                            style={{ maxHeight: height * 0.18 }}
                                        >
                                            {filteredOccupations.length > 0 ? (
                                                filteredOccupations.map((o, i) => (
                                                    <TouchableOpacity
                                                        key={i}
                                                        style={{
                                                            paddingHorizontal: width * 0.04,
                                                            height: Math.max(48, height * 0.06),
                                                            borderBottomWidth: i < filteredOccupations.length - 1 ? 1 : 0,
                                                            borderColor: Colors.light.secondaryText,
                                                            justifyContent: 'center'
                                                        }}
                                                        onPress={() => {
                                                            setSelectedOccupation(o.value);
                                                            setIsDropdownOpen(false);
                                                            setIsDropdownActive(false); // ✅ unlock scroll
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


                            {/* Error Message */}
                            {errorMessage ? (
                                <View style={{ marginBottom: height * 0.02, width: '100%' }}>
                                    <Text style={{
                                        color: '#EF4444',
                                        textAlign: 'center',
                                        fontSize: width * 0.035
                                    }}>
                                        {errorMessage}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Next Button */}
                            <View style={{ alignItems: 'center', marginBottom: height * 0.05 }}>
                                <CustomGradientButton
                                    text={
                                        isLoading || contextLoading
                                            ? (isHi ? 'सेव हो रहा है...' : 'Saving...')
                                            : (isHi ? 'अगला' : 'Next')
                                    }
                                    width={Math.min(width * 0.9, 500)}
                                    height={Math.max(48, height * 0.06)}
                                    borderRadius={100}
                                    fontSize={Math.min(18, width * 0.045)}
                                    textColor={Colors.light.whiteFfffff}
                                    onPress={proceed}
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

export default KYC;