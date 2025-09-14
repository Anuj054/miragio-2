import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, TextInput, Alert, Animated, StatusBar } from "react-native";
import { useEffect, useState, useRef } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profileimg from "../../assets/images/profileimg.png";

import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../Navigation/types";

type Props = NativeStackScreenProps<MainStackParamList, 'EditProfile'>;

// Dropdown options (same as KYC)
const GENDER_OPTIONS = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Prefer Not to Say", value: "prefer_not_to_say" },
    { label: "Other", value: "other" }
];

const OCCUPATION_OPTIONS = [
    { label: "Doctor", value: "doctor" },
    { label: "Engineer", value: "engineer" },
    { label: "Lawyer", value: "lawyer" },
    { label: "Teacher", value: "teacher" },
    { label: "Business Owner", value: "business_owner" },
    { label: "Student", value: "student" },
    { label: "Accountant", value: "accountant" },
    { label: "Nurse", value: "nurse" },
    { label: "Developer", value: "developer" },
    { label: "Designer", value: "designer" },
    { label: "Web Developer", value: "web_developer" },
    { label: "Others", value: "others" }
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

    const { user, isLoading: userLoading, refreshUserData, updateUserData } = useUser();
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [editUser, setEditUser] = useState<EditUserData | null>(null);
    const [editErrors, setEditErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);

    // Track original user data and changes
    const [originalUserData, setOriginalUserData] = useState<EditUserData | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // Dropdown states (same as KYC)
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState<boolean>(false);
    const [genderSearchQuery, setGenderSearchQuery] = useState<string>("");
    const [isOccupationDropdownOpen, setIsOccupationDropdownOpen] = useState<boolean>(false);
    const [occupationSearchQuery, setOccupationSearchQuery] = useState<string>("");

    // Success message state and animation
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const successOpacity = useRef(new Animated.Value(0)).current;
    const successTranslateY = useRef(new Animated.Value(50)).current;

    // Filter functions (same as KYC)
    const filteredGenderOptions = GENDER_OPTIONS.filter(option =>
        option.label.toLowerCase().includes(genderSearchQuery.toLowerCase())
    );

    const filteredOccupationOptions = OCCUPATION_OPTIONS.filter(option =>
        option.label.toLowerCase().includes(occupationSearchQuery.toLowerCase())
    );

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

    // Dropdown handlers (same as KYC)
    const handleGenderSelect = (option: { label: string; value: string }): void => {
        handleEditChange('gender', option.label);
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

    const handleOccupationSelect = (option: { label: string; value: string }): void => {
        handleEditChange('occupation', option.label);
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

    // Validate Edit User Form with simplified error messages
    const validateEditUser = (): FormErrors => {
        if (!editUser) return {};

        const errors: FormErrors = {};

        if (!editUser.username.trim()) errors.username = "Please enter your username";

        if (!editUser.email.trim() || !validateEmail(editUser.email))
            errors.email = "Please enter a valid email";

        // Simplified phone number validation
        if (!editUser.phone_number.trim()) {
            errors.phone_number = "Please enter your phone number";
        } else if (editUser.phone_number.length !== 10 || !/^\d{10}$/.test(editUser.phone_number) ||
            editUser.phone_number.startsWith('0') || editUser.phone_number.startsWith('1') || editUser.phone_number.startsWith('2')) {
            errors.phone_number = "Please enter a correct phone number";
        }

        // Simplified Aadhar number validation
        if (editUser.aadharnumber.trim()) {
            if (editUser.aadharnumber.length !== 12 || !/^\d{12}$/.test(editUser.aadharnumber) ||
                editUser.aadharnumber.startsWith('0') || editUser.aadharnumber.startsWith('1')) {
                errors.aadharnumber = "Please enter a correct Aadhar number";
            }
        }

        if (editUser.pan_number.trim() && !validatePanNumber(editUser.pan_number)) {
            errors.pan_number = "Please enter a correct PAN number";
        }

        if (editUser.upi.trim() && !validateUpiId(editUser.upi)) {
            errors.upi = "Please enter a correct UPI ID";
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
                "https://netinnovatus.tech/miragio_task/api/api.php",
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
                Alert.alert("Error", result.message || "Update failed");
            }
        } catch (err) {
            Alert.alert("Error", "Error updating profile. Please check your internet connection.");
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
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <ActivityIndicator size="large" color={Colors.light.whiteFfffff} />
                <Text style={{ color: Colors.light.whiteFfffff }} className="mt-4 text-lg">
                    Loading profile...
                </Text>
            </View>
        );
    }

    if (!user || !editUser) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-lg">
                    No user data available
                </Text>
                <TouchableOpacity
                    onPress={handleBackPress}
                    className="mt-4 px-6 py-3 rounded-lg"
                    style={{ backgroundColor: Colors.light.bgBlueBtn }}
                >
                    <Text style={{ color: Colors.light.whiteFfffff }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isButtonDisabled = !hasChanges || loading;

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== FIXED HEADER SECTION MATCHING MOREPAGE =================== */}
            <View className="relative h-32">
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header Content with proper flexbox layout */}
                <View className="flex-1 pt-12 pb-4 px-4">
                    {/* Header row with proper spacing */}
                    <View className="flex-row items-center justify-between h-16">
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <Image
                                source={icons.back}
                                className="w-4 h-6"
                            />
                        </TouchableOpacity>

                        {/* Centered title */}
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-3xl font-medium pt-1"
                        >
                            Edit Profile
                        </Text>

                        {/* Empty space for symmetry (same as MorePage) */}
                        <View className="w-10 h-10" />
                    </View>
                </View>

                {/* Bottom border */}
                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Profile Image Section */}
                <View className="items-center mt-8 mb-6">
                    <View className="relative">
                        <Image
                            source={profileimg}
                            className="w-24 h-24 rounded-full"
                            style={{ borderWidth: 3, borderColor: Colors.light.whiteFfffff }}
                        />
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
                            style={{ backgroundColor: Colors.light.bgBlueBtn }}
                        >
                            <Text style={{ color: Colors.light.whiteFfffff, fontSize: 16 }}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View className="px-6 space-y-4">
                    {/* Username Field - NO RED BORDER */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Username
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                borderRadius: 8,
                            }}
                            className="flex flex-row items-center h-[56px]"
                        >
                            <TextInput
                                value={editUser.username}
                                onChangeText={(value) => handleEditChange('username', value)}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter username"
                                placeholderTextColor={Colors.light.placeholderColor}
                            />
                        </View>
                        {editErrors.username && (
                            <Text className="text-red-400 text-sm mt-1">{editErrors.username}</Text>
                        )}
                    </View>

                    {/* Email Field - NO RED BORDER */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Email
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                borderRadius: 8,
                            }}
                            className="flex flex-row items-center h-[56px]"
                        >
                            <TextInput
                                value={editUser.email}
                                onChangeText={(value) => handleEditChange('email', value)}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter email"
                                placeholderTextColor={Colors.light.placeholderColor}
                                keyboardType="email-address"
                            />
                        </View>
                        {editErrors.email && (
                            <Text className="text-red-400 text-sm mt-1">{editErrors.email}</Text>
                        )}
                    </View>

                    {/* Phone Field - NO RED BORDER */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Phone Number
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                borderRadius: 8,
                            }}
                            className="flex flex-row items-center h-[56px]"
                        >
                            <TextInput
                                value={editUser.phone_number}
                                onChangeText={handlePhoneChange}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter phone number (10 digits)"
                                placeholderTextColor={Colors.light.placeholderColor}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>
                        {editErrors.phone_number && (
                            <Text className="text-red-400 text-sm mt-1">{editErrors.phone_number}</Text>
                        )}
                    </View>

                    {/* Age Field (Read-only) */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Age
                        </Text>
                        <View style={{ backgroundColor: '#f3f4f6', borderRadius: 8 }} className="flex flex-row items-center h-[56px]">
                            <TextInput
                                value={editUser.age}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                                placeholder="Age"
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Gender Field - KYC STYLE DROPDOWN */}
                    <View className="mb-5 relative">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Gender
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: Colors.light.whiteFfffff, borderRadius: 8 }}
                            className="flex flex-row items-center justify-between w-full h-[56px] px-5"
                            onPress={handleGenderDropdownToggle}
                        >
                            <Text style={{ color: editUser.gender ? Colors.light.blackPrimary : Colors.light.placeholderColor }} className="text-base">
                                {editUser.gender ? editUser.gender : "Select Gender*"}
                            </Text>
                            <Image
                                source={isGenderDropdownOpen ? icons.dropdownicon : icons.upicon}
                                className="w-3 h-3"
                            />
                        </TouchableOpacity>

                        {/* Gender Dropdown options container */}
                        {isGenderDropdownOpen && (
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    borderColor: Colors.light.secondaryText,
                                    position: 'absolute',
                                    top: 80,
                                    width: '100%',
                                    zIndex: 1000,
                                    maxHeight: 150,
                                    borderRadius: 8,
                                }}
                                className="border"
                            >
                                {/* Search input for filtering gender */}
                                <View style={{ borderColor: Colors.light.secondaryText }} className="px-4 py-1 border-b">
                                    <TextInput
                                        style={{ backgroundColor: Colors.light.whiteFefefe, color: Colors.light.blackPrimary }}
                                        className="h-[40px] px-3 rounded-lg"
                                        placeholder="Search gender..."
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        value={genderSearchQuery}
                                        onChangeText={setGenderSearchQuery}
                                        autoFocus={false}
                                    />
                                </View>

                                {/* Scrollable gender options list */}
                                <ScrollView
                                    style={{ maxHeight: 100 }}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {filteredGenderOptions.length > 0 ? (
                                        filteredGenderOptions.map((option, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={{ borderColor: Colors.light.secondaryText }}
                                                className="px-5 py-4 h-[56px] justify-center border-b last:border-b-0"
                                                onPress={() => handleGenderSelect(option)}
                                            >
                                                <Text style={{ color: Colors.light.blackPrimary }} className="text-base">
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View className="px-5 py-4 h-[56px] justify-center">
                                            <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-base">
                                                No gender found
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Occupation Field - KYC STYLE DROPDOWN */}
                    <View className="mb-5 relative">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Occupation
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: Colors.light.whiteFfffff, borderRadius: 8 }}
                            className="flex flex-row items-center justify-between w-full h-[56px] px-5"
                            onPress={handleOccupationDropdownToggle}
                        >
                            <Text style={{ color: editUser.occupation ? Colors.light.blackPrimary : Colors.light.placeholderColor }} className="text-base">
                                {editUser.occupation ? editUser.occupation : "Select Occupation*"}
                            </Text>
                            <Image
                                source={isOccupationDropdownOpen ? icons.dropdownicon : icons.upicon}
                                className="w-3 h-3"
                            />
                        </TouchableOpacity>

                        {/* Occupation Dropdown options container */}
                        {isOccupationDropdownOpen && (
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    borderColor: Colors.light.secondaryText,
                                    position: 'absolute',
                                    top: 80,
                                    width: '100%',
                                    zIndex: 1000,
                                    maxHeight: 150,
                                    borderRadius: 8,
                                }}
                                className="border"
                            >
                                {/* Search input */}
                                <View style={{ borderColor: Colors.light.secondaryText }} className="px-4 py-1 border-b">
                                    <TextInput
                                        style={{ backgroundColor: Colors.light.whiteFefefe, color: Colors.light.blackPrimary }}
                                        className="h-[40px] px-3 rounded-lg"
                                        placeholder="Search occupation..."
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        value={occupationSearchQuery}
                                        onChangeText={setOccupationSearchQuery}
                                        autoFocus={false}
                                    />
                                </View>

                                {/* Scrollable occupation list */}
                                <ScrollView
                                    style={{ maxHeight: 100 }}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {filteredOccupationOptions.length > 0 ? (
                                        filteredOccupationOptions.map((option, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={{ borderColor: Colors.light.secondaryText }}
                                                className="px-5 py-4 h-[56px] justify-center border-b last:border-b-0"
                                                onPress={() => handleOccupationSelect(option)}
                                            >
                                                <Text style={{ color: Colors.light.blackPrimary }} className="text-base">
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View className="px-5 py-4 h-[56px] justify-center">
                                            <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-base">
                                                No occupations found
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Aadhar Number Field - NO RED BORDER */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Aadhar Number
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                borderRadius: 8,
                            }}
                            className="flex flex-row items-center h-[56px]"
                        >
                            <TextInput
                                value={editUser.aadharnumber}
                                onChangeText={handleAadharChange}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter Aadhar number (12 digits)"
                                placeholderTextColor={Colors.light.placeholderColor}
                                keyboardType="numeric"
                                maxLength={12}
                            />
                        </View>
                        {editErrors.aadharnumber && (
                            <Text className="text-red-400 text-sm mt-1">{editErrors.aadharnumber}</Text>
                        )}
                    </View>

                    {/* Instagram Username Field */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            Instagram Username <Text style={{ color: Colors.light.placeholderColor }}>(Optional)</Text>
                        </Text>
                        <View style={{ backgroundColor: Colors.light.whiteFfffff, borderRadius: 8 }} className="flex flex-row items-center h-[56px]">
                            <TextInput
                                value={editUser.instagram_username}
                                onChangeText={(value) => handleEditChange('instagram_username', value)}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter Instagram Username"
                                placeholderTextColor={Colors.light.placeholderColor}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* UPI ID Field - NO RED BORDER */}
                    <View className="mb-4">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            UPI ID <Text style={{ color: Colors.light.placeholderColor }}>(Optional)</Text>
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                borderRadius: 8,
                            }}
                            className="flex flex-row items-center h-[56px]"
                        >
                            <TextInput
                                value={editUser.upi}
                                onChangeText={(value) => handleEditChange('upi', value)}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter UPI ID (e.g., username@paytm)"
                                placeholderTextColor={Colors.light.placeholderColor}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoCorrect={false}
                            />
                        </View>
                        {editErrors.upi && (
                            <Text className="text-red-400 text-sm mt-1">{editErrors.upi}</Text>
                        )}
                    </View>

                    {/* PAN Number Field - NO RED BORDER */}
                    <View className="mb-8">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium mb-2">
                            PAN Number <Text style={{ color: Colors.light.placeholderColor }}>(Optional)</Text>
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                borderRadius: 8,
                            }}
                            className="flex flex-row items-center h-[56px]"
                        >
                            <TextInput
                                value={editUser.pan_number}
                                onChangeText={(value) => handleEditChange('pan_number', value)}
                                className="ml-5 w-[280px] h-[56px] text-base"
                                style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                                placeholder="Enter PAN Number (e.g., ABCDE1234F)"
                                placeholderTextColor={Colors.light.placeholderColor}
                                autoCapitalize="characters"
                                maxLength={10}
                                autoCorrect={false}
                            />
                        </View>
                        {editErrors.pan_number && (
                            <Text className="text-red-400 text-sm mt-1">{editErrors.pan_number}</Text>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-between items-center mt-6">
                        <TouchableOpacity
                            onPress={updateUser}
                            disabled={isButtonDisabled}
                            style={{ opacity: isButtonDisabled ? 0.5 : 1 }}
                        >
                            {loading ? (
                                <View
                                    className="flex-row justify-center items-center px-6 py-3 rounded-lg"
                                    style={{ backgroundColor: '#6b7280', width: 180, height: 50 }}
                                >
                                    <ActivityIndicator size="small" color={Colors.light.whiteFfffff} />
                                    <Text style={{ color: Colors.light.whiteFfffff, fontSize: 18, fontWeight: '600' }} className="ml-2">
                                        Saving...
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    className="flex-row justify-center items-center px-6 py-3 rounded-lg"
                                    style={{
                                        backgroundColor: hasChanges ? Colors.light.bgBlueBtn : '#6b7280',
                                        width: 180,
                                        height: 50
                                    }}
                                >
                                    <Text style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: 18,
                                        fontWeight: '600'
                                    }}>
                                        Save Changes
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCancel}
                            disabled={loading}
                            className="py-3 px-6 rounded-lg"
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                opacity: loading ? 0.5 : 1,
                                width: 180,
                                height: 50,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: Colors.light.whiteFfffff, fontSize: 18, fontWeight: '600' }}>
                                Cancel
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
                        bottom: 60,
                        left: 20,
                        right: 20,
                        backgroundColor: Colors.light.bgGreen,
                        borderRadius: 10,
                        padding: 16,
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
                        fontSize: 16,
                        fontWeight: '600',
                        flex: 1,
                        textAlign: 'center'
                    }}>
                        Profile updated successfully!
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

export default EditProfile;
