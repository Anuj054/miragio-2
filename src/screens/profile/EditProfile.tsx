import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, TextInput, Alert, Animated, StatusBar, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState, useRef } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profileimg from "../../assets/images/profileimg.png";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../navigation/types";
// Translation imports - USING CUSTOM COMPONENTS
import { TranslatedText } from '../../components/TranslatedText';
import { useTranslation } from '../../context/TranslationContext';
import { usePlaceholder } from '../../hooks/useTranslatedText';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<MainStackParamList, 'EditProfile'>;

// Dropdown options with Hindi translations
const GENDER_OPTIONS = [
    { label: "Male", value: "male", labelHi: "पुरुष" },
    { label: "Female", value: "female", labelHi: "महिला" },
    { label: "Prefer Not to Say", value: "prefer_not_to_say", labelHi: "नहीं बताना चाहते" },
    { label: "Other", value: "other", labelHi: "अन्य" }
];

const OCCUPATION_OPTIONS = [
    { label: "Doctor", value: "doctor", labelHi: "डॉक्टर" },
    { label: "Engineer", value: "engineer", labelHi: "इंजीनियर" },
    { label: "Lawyer", value: "lawyer", labelHi: "वकील" },
    { label: "Teacher", value: "teacher", labelHi: "शिक्षक" },
    { label: "Business Owner", value: "business_owner", labelHi: "व्यापारी" },
    { label: "Student", value: "student", labelHi: "छात्र" },
    { label: "Accountant", value: "accountant", labelHi: "लेखाकार" },
    { label: "Nurse", value: "nurse", labelHi: "नर्स" },
    { label: "Developer", value: "developer", labelHi: "डेवलपर" },
    { label: "Designer", value: "designer", labelHi: "डिज़ाइनर" },
    { label: "Web Developer", value: "web_developer", labelHi: "वेब डेवलपर" },
    { label: "Others", value: "others", labelHi: "अन्य" }
];

// Define the shape of the edit user form data
interface EditUserData {
    username: string;
    email: string;
    phone_number: string;
    gender: string;
    occupation: string;
    aadharnumber: string;
    instagram_username: string;
    upi: string;
    pan_number: string;
    age: string;
}

// Define the shape of form errors
interface FormErrors {
    username?: string;
    email?: string;
    phone_number?: string;
    aadharnumber?: string;
    upi?: string;
    pan_number?: string;
}

const EditProfile = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const { user, isLoading: userLoading, refreshUserData, updateUserData } = useUser();

    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [editUser, setEditUser] = useState<EditUserData | null>(null);
    const [editErrors, setEditErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);

    // Track original user data and changes
    const [originalUserData, setOriginalUserData] = useState<EditUserData | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // Dropdown states
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState<boolean>(false);
    const [genderSearchQuery, setGenderSearchQuery] = useState<string>("");
    const [isOccupationDropdownOpen, setIsOccupationDropdownOpen] = useState<boolean>(false);
    const [occupationSearchQuery, setOccupationSearchQuery] = useState<string>("");

    // Success message state and animation
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const successOpacity = useRef(new Animated.Value(0)).current;
    const successTranslateY = useRef(new Animated.Value(50)).current;

    // Using custom placeholder hooks for all input fields
    const usernamePlaceholder = usePlaceholder('Enter username', 'उपयोगकर्ता नाम दर्ज करें');
    const emailPlaceholder = usePlaceholder('Enter email', 'ईमेल दर्ज करें');
    const phonePlaceholder = usePlaceholder('Enter phone number (10 digits)', 'फोन नंबर दर्ज करें (10 अंक)');
    const aadharPlaceholder = usePlaceholder('Enter Aadhar number (12 digits)', 'आधार नंबर दर्ज करें (12 अंक)');
    const instagramPlaceholder = usePlaceholder('Enter Instagram Username', 'इंस्टाग्राम उपयोगकर्ता नाम दर्ज करें');
    const upiPlaceholder = usePlaceholder('Enter UPI ID ', 'UPI ID दर्ज करें ');
    const panPlaceholder = usePlaceholder('Enter PAN Number (e.g., ABCDE1234F)', 'PAN नंबर दर्ज करें (जैसे, ABCDE1234F)');
    const searchGenderPlaceholder = usePlaceholder('Search gender...', 'लिंग खोजें...');
    const searchOccupationPlaceholder = usePlaceholder('Search occupation...', 'व्यवसाय खोजें...');

    // Helper function to get current language label
    const getGenderLabel = (option: any) => {
        return currentLanguage === 'hi' ? option.labelHi : option.label;
    };

    const getOccupationLabel = (option: any) => {
        return currentLanguage === 'hi' ? option.labelHi : option.label;
    };

    // Filter functions with multilingual search
    const filteredGenderOptions = GENDER_OPTIONS.filter(option => {
        const searchText = genderSearchQuery.toLowerCase();
        const englishMatch = option.label.toLowerCase().includes(searchText);
        const hindiMatch = option.labelHi.toLowerCase().includes(searchText);
        return englishMatch || hindiMatch;
    });

    const filteredOccupationOptions = OCCUPATION_OPTIONS.filter(option => {
        const searchText = occupationSearchQuery.toLowerCase();
        const englishMatch = option.label.toLowerCase().includes(searchText);
        const hindiMatch = option.labelHi.toLowerCase().includes(searchText);
        return englishMatch || hindiMatch;
    });

    // Check if data has changed
    const checkForChanges = (newData: EditUserData) => {
        if (!originalUserData) return false;

        const fieldsToCheck: (keyof EditUserData)[] = [
            'username', 'email', 'phone_number', 'gender',
            'occupation', 'aadharnumber', 'instagram_username',
            'upi', 'pan_number'
        ];

        return fieldsToCheck.some(field =>
            newData[field].trim() !== originalUserData[field].trim()
        );
    };

    // Initialize edit user data when user data is available
    useEffect(() => {
        if (user) {
            const userData: EditUserData = {
                username: user.username || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                gender: user.gender || '',
                occupation: user.occupation || '',
                aadharnumber: user.aadharnumber || '',
                instagram_username: user.instagram_username || '',
                upi: user.upi || '',
                pan_number: user.pan_number || '',
                age: user.age || ''
            };

            setEditUser(userData);
            setOriginalUserData(userData);
            setHasChanges(false);
        }
    }, [user]);

    // Refresh user data when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            if (user?.id) {
                setIsRefreshing(true);
                try {
                    await refreshUserData();
                } catch (error) {
                    console.error('Error refreshing user data:', error);
                } finally {
                    setIsRefreshing(false);
                }
            }
        };

        loadUserData();
    }, []);

    // Show success message animation
    const showSuccessToast = () => {
        setShowSuccessMessage(true);

        Animated.parallel([
            Animated.timing(successOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(successTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(successOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(successTranslateY, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setShowSuccessMessage(false);
            });
        }, 3000);
    };

    // Handle input changes with change detection
    const handleEditChange = (name: keyof EditUserData, value: string) => {
        if (!editUser) return;

        if (name === 'age') return;

        if (name === 'pan_number') {
            value = value.toUpperCase();
        }

        const updatedUser = { ...editUser, [name]: value };
        setEditUser(updatedUser);

        setHasChanges(checkForChanges(updatedUser));

        if (editErrors[name as keyof FormErrors]) {
            setEditErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Handle phone number input - only allow 10 digits
    const handlePhoneChange = (text: string) => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 10 digits
        const limitedText = numericText.slice(0, 10);

        handleEditChange('phone_number', limitedText);
    };

    // Handle Aadhar number input - only allow 12 digits
    const handleAadharChange = (text: string) => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 12 digits
        const limitedText = numericText.slice(0, 12);

        handleEditChange('aadharnumber', limitedText);
    };

    // Dropdown handlers
    const handleGenderSelect = (option: any): void => {
        const selectedLabel = getGenderLabel(option);
        handleEditChange('gender', selectedLabel);
        setIsGenderDropdownOpen(false);
        setGenderSearchQuery("");
    };

    const handleGenderDropdownToggle = (): void => {
        setIsGenderDropdownOpen(!isGenderDropdownOpen);
        if (!isGenderDropdownOpen) {
            setGenderSearchQuery("");
        }
        // Close occupation dropdown if open
        if (isOccupationDropdownOpen) {
            setIsOccupationDropdownOpen(false);
            setOccupationSearchQuery("");
        }
    };

    const handleOccupationSelect = (option: any): void => {
        const selectedLabel = getOccupationLabel(option);
        handleEditChange('occupation', selectedLabel);
        setIsOccupationDropdownOpen(false);
        setOccupationSearchQuery("");
    };

    const handleOccupationDropdownToggle = (): void => {
        setIsOccupationDropdownOpen(!isOccupationDropdownOpen);
        if (!isOccupationDropdownOpen) {
            setOccupationSearchQuery("");
        }
        // Close gender dropdown if open
        if (isGenderDropdownOpen) {
            setIsGenderDropdownOpen(false);
            setGenderSearchQuery("");
        }
    };

    // Validation helpers
    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePanNumber = (pan: string): boolean => {
        if (!pan.trim()) return true;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    }

    const validateUpiId = (upi: string): boolean => {
        if (!upi.trim()) return true;
        const upiRegex = /^[\w\.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(upi);
    }

    // Validate Edit User Form with Hindi error messages
    const validateEditUser = (): FormErrors => {
        if (!editUser) return {};

        const errors: FormErrors = {};

        if (!editUser.username.trim()) {
            errors.username = currentLanguage === 'hi' ? "कृपया अपना उपयोगकर्ता नाम दर्ज करें" : "Please enter your username";
        }

        if (!editUser.email.trim() || !validateEmail(editUser.email)) {
            errors.email = currentLanguage === 'hi' ? "कृपया वैध ईमेल दर्ज करें" : "Please enter a valid email";
        }

        // Phone number validation with Hindi messages
        if (!editUser.phone_number.trim()) {
            errors.phone_number = currentLanguage === 'hi' ? "कृपया अपना फोन नंबर दर्ज करें" : "Please enter your phone number";
        } else if (editUser.phone_number.length !== 10 || !/^\d{10}$/.test(editUser.phone_number) ||
            editUser.phone_number.startsWith('0') || editUser.phone_number.startsWith('1') || editUser.phone_number.startsWith('2')) {
            errors.phone_number = currentLanguage === 'hi' ? "कृपया सही फोन नंबर दर्ज करें" : "Please enter a correct phone number";
        }

        // Aadhar number validation with Hindi messages
        if (editUser.aadharnumber.trim()) {
            if (editUser.aadharnumber.length !== 12 || !/^\d{12}$/.test(editUser.aadharnumber) ||
                editUser.aadharnumber.startsWith('0') || editUser.aadharnumber.startsWith('1')) {
                errors.aadharnumber = currentLanguage === 'hi' ? "कृपया सही आधार नंबर दर्ज करें" : "Please enter a correct Aadhar number";
            }
        }

        if (editUser.pan_number.trim() && !validatePanNumber(editUser.pan_number)) {
            errors.pan_number = currentLanguage === 'hi' ? "कृपया सही PAN नंबर दर्ज करें" : "Please enter a correct PAN number";
        }

        if (editUser.upi.trim() && !validateUpiId(editUser.upi)) {
            errors.upi = currentLanguage === 'hi' ? "कृपया सही UPI ID दर्ज करें" : "Please enter a correct UPI ID";
        }

        return errors;
    };

    // Update user details
    const updateUser = async () => {
        if (!editUser || !user || !hasChanges) return;

        const errors = validateEditUser();
        setEditErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload = {
            action: "update_user",
            id: user.id,
            ...editUser,
            user_role: "user",
            status: "1"
        };

        try {
            setLoading(true);
            const res = await fetch(
                "https://miragiofintech.org/api/api.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const result = await res.json();

            if (result.status === "success") {
                updateUserData(editUser);

                setOriginalUserData(editUser);
                setHasChanges(false);

                showSuccessToast();

                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                const errorMessage = currentLanguage === 'hi' ?
                    result.message || "अपडेट विफल" :
                    result.message || "Update failed";
                Alert.alert(currentLanguage === 'hi' ? "त्रुटि" : "Error", errorMessage);
            }
        } catch (err) {
            const errorMessage = currentLanguage === 'hi' ?
                "प्रोफाइल अपडेट करने में त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।" :
                "Error updating profile. Please check your internet connection.";
            Alert.alert(currentLanguage === 'hi' ? "त्रुटि" : "Error", errorMessage);
            console.error(err);
        }
        setLoading(false);
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    if (userLoading || isRefreshing) {
        return (
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: Colors.light.blackPrimary }}
            >
                <ActivityIndicator size="large" color={Colors.light.whiteFfffff} />
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.045,
                        marginTop: height * 0.02
                    }}
                >
                    {currentLanguage === 'hi' ? 'प्रोफाइल लोड हो रहा है...' : 'Loading profile...'}
                </Text>
            </View>
        );
    }

    if (!user || !editUser) {
        return (
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: Colors.light.blackPrimary }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.045
                    }}
                >
                    {currentLanguage === 'hi' ? 'कोई उपयोगकर्ता डेटा उपलब्ध नहीं है' : 'No user data available'}
                </Text>
                <TouchableOpacity
                    onPress={handleBackPress}
                    style={{
                        backgroundColor: Colors.light.bgBlueBtn,
                        marginTop: height * 0.02,
                        paddingHorizontal: width * 0.06,
                        paddingVertical: height * 0.015,
                        borderRadius: 8
                    }}
                >
                    <Text style={{ color: Colors.light.whiteFfffff }}>
                        {currentLanguage === 'hi' ? 'वापस जाएं' : 'Go Back'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isButtonDisabled = !hasChanges || loading;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust offset as needed
        >
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"   // ✅ dismiss keyboard on outside tap
                contentContainerStyle={{ paddingBottom: height * 0.06 }}
            >
                <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                    {/* =================== FIXED HEADER SECTION =================== */}
                    <View style={{ height: height * 0.14 }}>
                        {/* Background image */}
                        <Image
                            source={bg2}
                            resizeMode="cover"
                            className="w-full h-full absolute"
                        />

                        {/* Header Content with proper flexbox layout */}
                        <View
                            className="flex-1"
                            style={{
                                paddingTop: height * 0.05,
                                paddingBottom: height * 0.02,
                                paddingHorizontal: width * 0.04
                            }}
                        >
                            {/* Header row with proper spacing */}
                            <View
                                className="flex-row items-center justify-between"
                                style={{ height: height * 0.08 }}
                            >
                                {/* Back button */}
                                <TouchableOpacity
                                    onPress={handleBackPress}
                                    style={{
                                        width: width * 0.1,
                                        height: width * 0.1,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Image
                                        source={icons.back}
                                        style={{
                                            width: width * 0.04,
                                            height: width * 0.06
                                        }}
                                    />
                                </TouchableOpacity>

                                {/* Centered title with translation */}
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.075
                                    }}
                                    className="font-medium"
                                >
                                    Edit Profile
                                </TranslatedText>

                                {/* Empty space for symmetry */}
                                <View style={{ width: width * 0.1, height: width * 0.1 }} />
                            </View>
                        </View>

                        {/* Bottom border */}
                        <View
                            className="absolute bottom-0 w-full"
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                height: 1
                            }}
                        />
                    </View>

                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: height * 0.06
                        }}
                    >
                        {/* Profile Image Section */}
                        <View
                            className="items-center"
                            style={{
                                marginTop: height * 0.04,
                                marginBottom: height * 0.03
                            }}
                        >
                            <View className="relative">
                                <Image
                                    source={profileimg}
                                    style={{
                                        width: width * 0.24,
                                        height: width * 0.24,
                                        borderRadius: (width * 0.24) / 2,
                                        borderWidth: 3,
                                        borderColor: Colors.light.whiteFfffff
                                    }}
                                />
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.bgBlueBtn,
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: width * 0.08,
                                        height: width * 0.08,
                                        borderRadius: (width * 0.08) / 2
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.04
                                        }}
                                    >
                                        +
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Form Fields */}
                        <View style={{ paddingHorizontal: width * 0.06 }}>
                            {/* Username Field */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Username
                                </TranslatedText>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.username}
                                        onChangeText={(value) => handleEditChange('username', value)}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={usernamePlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                    />
                                </View>
                                {editErrors.username && (
                                    <Text
                                        style={{
                                            color: '#ff4444',
                                            fontSize: width * 0.035,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        {editErrors.username}
                                    </Text>
                                )}
                            </View>

                            {/* Email Field */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Email
                                </TranslatedText>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.email}
                                        onChangeText={(value) => handleEditChange('email', value)}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={emailPlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        keyboardType="email-address"
                                    />
                                </View>
                                {editErrors.email && (
                                    <Text
                                        style={{
                                            color: '#ff4444',
                                            fontSize: width * 0.035,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        {editErrors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Phone Field */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Phone Number
                                </TranslatedText>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.phone_number}
                                        onChangeText={handlePhoneChange}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={phonePlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        keyboardType="numeric"
                                        maxLength={10}
                                    />
                                </View>
                                {editErrors.phone_number && (
                                    <Text
                                        style={{
                                            color: '#ff4444',
                                            fontSize: width * 0.035,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        {editErrors.phone_number}
                                    </Text>
                                )}
                            </View>

                            {/* Age Field (Read-only) */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Age
                                </TranslatedText>
                                <View
                                    style={{
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.age}
                                        style={{
                                            backgroundColor: '#f3f4f6',
                                            color: '#6b7280',
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={currentLanguage === 'hi' ? 'उम्र' : 'Age'}
                                        editable={false}
                                    />
                                </View>
                            </View>

                            {/* Gender Field - KYC STYLE DROPDOWN */}
                            <View
                                className="relative"
                                style={{ marginBottom: height * 0.025 }}
                            >
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Gender
                                </TranslatedText>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06,
                                        paddingHorizontal: width * 0.05
                                    }}
                                    className="flex flex-row items-center justify-between w-full"
                                    onPress={handleGenderDropdownToggle}
                                >
                                    <Text
                                        style={{
                                            color: editUser.gender ? Colors.light.blackPrimary : Colors.light.placeholderColor,
                                            fontSize: width * 0.04
                                        }}
                                    >
                                        {editUser.gender ? editUser.gender : (currentLanguage === 'hi' ? "लिंग चुनें*" : "Select Gender*")}
                                    </Text>
                                    <Image
                                        source={isGenderDropdownOpen ? icons.dropdownicon : icons.upicon}
                                        style={{
                                            width: width * 0.03,
                                            height: width * 0.03
                                        }}
                                    />
                                </TouchableOpacity>

                                {/* Gender Dropdown options container */}
                                {isGenderDropdownOpen && (
                                    <View
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            borderColor: Colors.light.secondaryText,
                                            position: 'absolute',
                                            top: height * 0.1,
                                            width: '100%',
                                            zIndex: 1000,
                                            maxHeight: height * 0.19,
                                            borderRadius: 8,
                                            borderWidth: 1
                                        }}
                                    >
                                        {/* Search input for filtering gender */}
                                        <View
                                            style={{
                                                borderColor: Colors.light.secondaryText,
                                                paddingHorizontal: width * 0.04,
                                                paddingVertical: height * 0.005,
                                                borderBottomWidth: 1
                                            }}
                                        >
                                            <TextInput
                                                style={{
                                                    backgroundColor: Colors.light.whiteFefefe,
                                                    color: Colors.light.blackPrimary,
                                                    height: height * 0.05,
                                                    paddingHorizontal: width * 0.03,
                                                    borderRadius: 8
                                                }}
                                                placeholder={searchGenderPlaceholder}
                                                placeholderTextColor={Colors.light.placeholderColor}
                                                value={genderSearchQuery}
                                                onChangeText={setGenderSearchQuery}
                                                autoFocus={false}
                                            />
                                        </View>

                                        {/* Scrollable gender options list */}
                                        <ScrollView
                                            style={{ maxHeight: height * 0.125 }}
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={true}
                                        >
                                            {filteredGenderOptions.length > 0 ? (
                                                filteredGenderOptions.map((option, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={{
                                                            borderColor: Colors.light.secondaryText,
                                                            paddingHorizontal: width * 0.05,
                                                            paddingVertical: height * 0.02,
                                                            height: height * 0.07,
                                                            justifyContent: 'center',
                                                            borderBottomWidth: index < filteredGenderOptions.length - 1 ? 1 : 0
                                                        }}
                                                        onPress={() => handleGenderSelect(option)}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: Colors.light.blackPrimary,
                                                                fontSize: width * 0.04
                                                            }}
                                                        >
                                                            {getGenderLabel(option)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <View
                                                    style={{
                                                        paddingHorizontal: width * 0.05,
                                                        paddingVertical: height * 0.02,
                                                        height: height * 0.07,
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: Colors.light.placeholderColorOp70,
                                                            fontSize: width * 0.04
                                                        }}
                                                    >
                                                        {currentLanguage === 'hi' ? "कोई लिंग नहीं मिला" : "No gender found"}
                                                    </Text>
                                                </View>
                                            )}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {/* Occupation Field - KYC STYLE DROPDOWN */}
                            <View
                                className="relative"
                                style={{ marginBottom: height * 0.025 }}
                            >
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Occupation
                                </TranslatedText>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06,
                                        paddingHorizontal: width * 0.05
                                    }}
                                    className="flex flex-row items-center justify-between w-full"
                                    onPress={handleOccupationDropdownToggle}
                                >
                                    <Text
                                        style={{
                                            color: editUser.occupation ? Colors.light.blackPrimary : Colors.light.placeholderColor,
                                            fontSize: width * 0.04
                                        }}
                                    >
                                        {editUser.occupation ? editUser.occupation : (currentLanguage === 'hi' ? "व्यवसाय चुनें*" : "Select Occupation*")}
                                    </Text>
                                    <Image
                                        source={isOccupationDropdownOpen ? icons.dropdownicon : icons.upicon}
                                        style={{
                                            width: width * 0.03,
                                            height: width * 0.03
                                        }}
                                    />
                                </TouchableOpacity>

                                {/* Occupation Dropdown options container */}
                                {isOccupationDropdownOpen && (
                                    <View
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            borderColor: Colors.light.secondaryText,
                                            position: 'absolute',
                                            top: height * 0.1,
                                            width: '100%',
                                            zIndex: 1000,
                                            maxHeight: height * 0.19,
                                            borderRadius: 8,
                                            borderWidth: 1
                                        }}
                                    >
                                        {/* Search input */}
                                        <View
                                            style={{
                                                borderColor: Colors.light.secondaryText,
                                                paddingHorizontal: width * 0.04,
                                                paddingVertical: height * 0.005,
                                                borderBottomWidth: 1
                                            }}
                                        >
                                            <TextInput
                                                style={{
                                                    backgroundColor: Colors.light.whiteFefefe,
                                                    color: Colors.light.blackPrimary,
                                                    height: height * 0.05,
                                                    paddingHorizontal: width * 0.03,
                                                    borderRadius: 8
                                                }}
                                                placeholder={searchOccupationPlaceholder}
                                                placeholderTextColor={Colors.light.placeholderColor}
                                                value={occupationSearchQuery}
                                                onChangeText={setOccupationSearchQuery}
                                                autoFocus={false}
                                            />
                                        </View>

                                        {/* Scrollable occupation list */}
                                        <ScrollView
                                            style={{ maxHeight: height * 0.125 }}
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={true}
                                        >
                                            {filteredOccupationOptions.length > 0 ? (
                                                filteredOccupationOptions.map((option, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={{
                                                            borderColor: Colors.light.secondaryText,
                                                            paddingHorizontal: width * 0.05,
                                                            paddingVertical: height * 0.02,
                                                            height: height * 0.07,
                                                            justifyContent: 'center',
                                                            borderBottomWidth: index < filteredOccupationOptions.length - 1 ? 1 : 0
                                                        }}
                                                        onPress={() => handleOccupationSelect(option)}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: Colors.light.blackPrimary,
                                                                fontSize: width * 0.04
                                                            }}
                                                        >
                                                            {getOccupationLabel(option)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <View
                                                    style={{
                                                        paddingHorizontal: width * 0.05,
                                                        paddingVertical: height * 0.02,
                                                        height: height * 0.07,
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: Colors.light.placeholderColorOp70,
                                                            fontSize: width * 0.04
                                                        }}
                                                    >
                                                        {currentLanguage === 'hi' ? "कोई व्यवसाय नहीं मिला" : "No occupations found"}
                                                    </Text>
                                                </View>
                                            )}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {/* Aadhar Number Field */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    Aadhar Number
                                </TranslatedText>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.aadharnumber}
                                        onChangeText={handleAadharChange}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={aadharPlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        keyboardType="numeric"
                                        maxLength={12}
                                    />
                                </View>
                                {editErrors.aadharnumber && (
                                    <Text
                                        style={{
                                            color: '#ff4444',
                                            fontSize: width * 0.035,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        {editErrors.aadharnumber}
                                    </Text>
                                )}
                            </View>

                            {/* Instagram Username Field */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    {currentLanguage === 'hi' ? 'इंस्टाग्राम उपयोगकर्ता नाम' : 'Instagram Username'} <Text style={{ color: Colors.light.placeholderColor }}>({currentLanguage === 'hi' ? 'वैकल्पिक' : 'Optional'})</Text>
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.instagram_username}
                                        onChangeText={(value) => handleEditChange('instagram_username', value)}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={instagramPlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            {/* UPI ID Field */}
                            <View style={{ marginBottom: height * 0.02 }}>
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    UPI ID <Text style={{ color: Colors.light.placeholderColor }}>({currentLanguage === 'hi' ? 'वैकल्पिक' : 'Optional'})</Text>
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.upi}
                                        onChangeText={(value) => handleEditChange('upi', value)}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={upiPlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoCorrect={false}
                                    />
                                </View>
                                {editErrors.upi && (
                                    <Text
                                        style={{
                                            color: '#ff4444',
                                            fontSize: width * 0.035,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        {editErrors.upi}
                                    </Text>
                                )}
                            </View>

                            {/* PAN Number Field */}
                            <View style={{ marginBottom: height * 0.04 }}>
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035,
                                        marginBottom: height * 0.01
                                    }}
                                    className="font-medium"
                                >
                                    {currentLanguage === 'hi' ? 'PAN नंबर' : 'PAN Number'} <Text style={{ color: Colors.light.placeholderColor }}>({currentLanguage === 'hi' ? 'वैकल्पिक' : 'Optional'})</Text>
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        borderRadius: 8,
                                        height: height * 0.06
                                    }}
                                    className="flex flex-row items-center"
                                >
                                    <TextInput
                                        value={editUser.pan_number}
                                        onChangeText={(value) => handleEditChange('pan_number', value)}
                                        style={{
                                            backgroundColor: Colors.light.whiteFfffff,
                                            color: Colors.light.blackPrimary,
                                            marginLeft: width * 0.05,
                                            width: width * 0.7,
                                            height: height * 0.058,
                                            fontSize: width * 0.04
                                        }}
                                        placeholder={panPlaceholder}
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        autoCapitalize="characters"
                                        maxLength={10}
                                        autoCorrect={false}
                                    />
                                </View>
                                {editErrors.pan_number && (
                                    <Text
                                        style={{
                                            color: '#ff4444',
                                            fontSize: width * 0.035,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        {editErrors.pan_number}
                                    </Text>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View
                                className="flex-row justify-between items-center"
                                style={{ marginTop: height * 0.03 }}
                            >
                                <TouchableOpacity
                                    onPress={updateUser}
                                    disabled={isButtonDisabled}
                                    style={{
                                        opacity: isButtonDisabled ? 0.5 : 1,
                                        width: width * 0.43,
                                        height: height * 0.055,
                                        borderRadius: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: hasChanges ? Colors.light.bgBlueBtn : '#6b7280'
                                    }}
                                >
                                    {loading ? (
                                        <View className="flex-row justify-center items-center">
                                            <ActivityIndicator size="small" color={Colors.light.whiteFfffff} />
                                            <Text
                                                style={{
                                                    color: Colors.light.whiteFfffff,
                                                    fontSize: width * 0.045,
                                                    fontWeight: '600',
                                                    marginLeft: width * 0.02
                                                }}
                                            >
                                                {currentLanguage === 'hi' ? 'सेव कर रहे हैं...' : 'Saving...'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.045,
                                                fontWeight: '600'
                                            }}
                                        >
                                            {currentLanguage === 'hi' ? 'परिवर्तन सेव करें' : 'Save Changes'}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleCancel}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: Colors.light.backlight2,
                                        opacity: loading ? 0.5 : 1,
                                        width: width * 0.43,
                                        height: height * 0.055,
                                        borderRadius: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.045,
                                            fontWeight: '600'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Success Message Toast */}
                    {showSuccessMessage && (
                        <Animated.View
                            style={{
                                position: 'absolute',
                                bottom: height * 0.075,
                                left: width * 0.05,
                                right: width * 0.05,
                                backgroundColor: Colors.light.bgGreen,
                                borderRadius: 10,
                                padding: width * 0.04,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                elevation: 5,
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                opacity: successOpacity,
                                transform: [{ translateY: successTranslateY }],
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: width * 0.04,
                                fontWeight: '600',
                                flex: 1,
                                textAlign: 'center'
                            }}>
                                {currentLanguage === 'hi' ? 'प्रोफाइल सफलतापूर्वक अपडेट हो गया!' : 'Profile updated successfully!'}
                            </Text>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;