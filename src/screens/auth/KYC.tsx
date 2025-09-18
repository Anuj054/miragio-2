import { Image, Text, TextInput, TouchableOpacity, View, ScrollView, Dimensions } from "react-native"
import { useState, useEffect } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import bg from "../../assets/images/bg.png"
import logo from "../../assets/images/MIRAGIO--LOGO.png"
import { icons } from "../../constants/index"
import CustomGradientButton from "../../components/CustomGradientButton"
import { Colors } from "../../constants/Colors"
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthStackParamList } from "../../navigation/types"

type Props = NativeStackScreenProps<AuthStackParamList, 'KYC'>;

const { width, height } = Dimensions.get('window');

// Type definitions
interface SignupData {
    email: string;
    password: string;
    referral_code: string;
    user_role: string;
    status: string;
}

interface Occupation {
    label: string;
    value: string;
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
    // State for signup data
    const [signupData, setSignupData] = useState<SignupData | null>(null);

    // State for KYC form fields - START EMPTY
    const [aadharNumber, setAadharNumber] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [age, setAge] = useState<string>("")
    const [gender, setGender] = useState<string>("")
    const [phoneNumber, setPhoneNumber] = useState<string>("")

    // State for occupation dropdown functionality
    const [selectedOccupation, setSelectedOccupation] = useState<string>("")
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Error state
    const [errorMessage, setErrorMessage] = useState<string>("")

    // Track if we've loaded data in this session (to allow back navigation within session)
    const [hasLoadedSessionData, setHasLoadedSessionData] = useState<boolean>(false);

    // Occupation options data
    const occupations: Occupation[] = [
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
    ]

    // Load signup data on component mount
    useEffect(() => {
        loadSignupData();
    }, []);

    // Gender options
    const genderOptions = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Prefer Not to Say", value: "prefer not to say" },
        { label: "Other", value: "other" },

    ];

    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState<boolean>(false);
    const [genderSearchQuery, setGenderSearchQuery] = useState<string>("");

    const filteredGenderOptions = genderOptions.filter(option =>
        option.label.toLowerCase().includes(genderSearchQuery.toLowerCase())
    );

    const handleGenderSelect = (option: { label: string; value: string }): void => {
        setGender(option.label);
        setIsGenderDropdownOpen(false);
        setGenderSearchQuery("");
        if (errorMessage) setErrorMessage("");
    };

    const handleGenderDropdownToggle = (): void => {
        if (!isLoading) {
            setIsGenderDropdownOpen(!isGenderDropdownOpen);
            if (!isGenderDropdownOpen) {
                setGenderSearchQuery("");
            }
        }
    };

    const loadSignupData = async (): Promise<void> => {
        try {
            const storedData = await AsyncStorage.getItem('@signup_data');
            if (storedData) {
                const data: SignupData = JSON.parse(storedData);
                setSignupData(data);
                console.log('KYC - Loaded signup data:', data);

                // Only load existing KYC data if we've already saved some in this session
                await loadCurrentSessionKYCData();
            } else {
                console.log('KYC - No signup data found, redirecting to signup');
                setErrorMessage("No signup data found. Please start from signup page.");
                // FIXED: Use proper navigation with timeout
                setTimeout(() => {
                    navigation.navigate('SignUp');
                }, 2000);
            }
        } catch (error) {
            console.error('KYC - Error loading signup data:', error);
            setErrorMessage("Error loading data. Please try again.");
        }
    };

    // Only load KYC data if it was saved in the current session
    const loadCurrentSessionKYCData = async (): Promise<void> => {
        try {
            const existingData = await AsyncStorage.getItem('@registration_data');
            if (existingData && hasLoadedSessionData) {
                // Only load if we've already saved data in this session (back navigation)
                const data: RegistrationData = JSON.parse(existingData);
                setAadharNumber(data.aadharnumber || "");
                setUsername(data.username || "");
                setAge(data.age || "");
                setGender(data.gender || "");
                setPhoneNumber(data.phone_number || "");
                setSelectedOccupation(data.occupation ?
                    occupations.find(occ => occ.label === data.occupation)?.value || "" : "");
                console.log('KYC - Loaded current session KYC data for editing');
            }
        } catch (error) {
            console.error('KYC - Error loading current session KYC data:', error);
        }
    };

    // Handle Aadhar number input - only allow 12 digits
    const handleAadharChange = (text: string): void => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 12 digits
        const limitedText = numericText.slice(0, 12);

        setAadharNumber(limitedText);
        if (errorMessage) setErrorMessage("");
    };

    // Handle phone number input - only allow 10 digits
    const handlePhoneChange = (text: string): void => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 10 digits
        const limitedText = numericText.slice(0, 10);

        setPhoneNumber(limitedText);
        if (errorMessage) setErrorMessage("");
    };

    // Handle age input - only allow numbers up to 3 digits
    const handleAgeChange = (text: string): void => {
        // Remove all non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 3 digits
        const limitedText = numericText.slice(0, 3);

        setAge(limitedText);
        if (errorMessage) setErrorMessage("");
    };

    // Filter occupations based on search query
    const filteredOccupations = occupations.filter(occupation =>
        occupation.label.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handle occupation selection from dropdown
    const handleOccupationSelect = (occupation: Occupation): void => {
        setSelectedOccupation(occupation.value)
        setIsDropdownOpen(false)
        setSearchQuery("")
        if (errorMessage) setErrorMessage("");
    }

    // Toggle dropdown visibility and reset search
    const handleDropdownToggle = (): void => {
        if (!isLoading) {
            setIsDropdownOpen(!isDropdownOpen)
            if (!isDropdownOpen) {
                setSearchQuery("")
            }
        }
    }

    // Clear error when user starts typing in any field
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string): void => {
        setter(value);
        if (errorMessage) setErrorMessage("");
    }

    // Validate form inputs with enhanced numeric validation
    const validateForm = (): boolean => {
        // Aadhar validation - must be exactly 12 digits and not start with 0 or 1
        if (!aadharNumber.trim()) {
            setErrorMessage("Please enter your Aadhar number");
            return false;
        }

        if (aadharNumber.length !== 12) {
            setErrorMessage("Aadhar number must be exactly 12 digits");
            return false;
        }

        // Aadhar should not start with 0 or 1
        if (aadharNumber.startsWith('0') || aadharNumber.startsWith('1')) {
            setErrorMessage("Aadhar number cannot start with 0 or 1");
            return false;
        }

        // Check if all characters are numeric
        if (!/^\d{12}$/.test(aadharNumber)) {
            setErrorMessage("Aadhar number must contain only digits");
            return false;
        }

        if (!username.trim()) {
            setErrorMessage("Please enter your username");
            return false;
        }

        if (!age.trim()) {
            setErrorMessage("Please enter your age");
            return false;
        }

        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
            setErrorMessage("Please enter a valid age between 18 and 100");
            return false;
        }

        if (!gender.trim()) {
            setErrorMessage("Please enter your gender");
            return false;
        }

        if (!selectedOccupation) {
            setErrorMessage("Please select your occupation");
            return false;
        }

        // Phone number validation - must be exactly 10 digits
        if (!phoneNumber.trim()) {
            setErrorMessage("Please enter your phone number");
            return false;
        }

        if (phoneNumber.length !== 10) {
            setErrorMessage("Phone number must be exactly 10 digits");
            return false;
        }

        // Check if all characters are numeric
        if (!/^\d{10}$/.test(phoneNumber)) {
            setErrorMessage("Phone number must contain only digits");
            return false;
        }

        // Phone number should not start with 0, 1, or 2
        if (phoneNumber.startsWith('0') || phoneNumber.startsWith('1') || phoneNumber.startsWith('2')) {
            setErrorMessage("Phone number cannot start with 0, 1, or 2");
            return false;
        }

        return true;
    };

    // FIXED: Navigate to UserDetails with stored data
    const proceedToUserDetails = async (): Promise<void> => {
        if (isLoading) return;

        setErrorMessage("");

        if (!validateForm()) return;

        if (!signupData) {
            setErrorMessage("Signup data not found. Please start from signup page.");
            setTimeout(() => {
                navigation.navigate('SignUp');
            }, 2000);
            return;
        }

        setIsLoading(true);

        try {
            const occupationLabel = occupations.find(occ => occ.value === selectedOccupation)?.label || selectedOccupation;

            const completeData: RegistrationData = {
                email: signupData.email,
                password: signupData.password,
                referral_code: signupData.referral_code,
                user_role: signupData.user_role,
                status: signupData.status,
                username: username.trim(),
                aadharnumber: aadharNumber.trim(),
                age: age.trim(),
                gender: gender.trim(),
                occupation: occupationLabel,
                phone_number: phoneNumber.trim()
            };

            await AsyncStorage.setItem('@registration_data', JSON.stringify(completeData));
            setHasLoadedSessionData(true);
            console.log('KYC - Stored complete data:', completeData);

            // FIXED: Navigate to UserDetails directly
            navigation.navigate('UserDetails');

        } catch (error) {
            console.error('KYC - Error storing data:', error);
            setErrorMessage("Error saving data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // FIXED: Handle back navigation
    const handleBackPress = (): void => {
        if (!isLoading) {
            navigation.goBack();
        }
    };

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ minHeight: height }}
            showsVerticalScrollIndicator={false}
        >
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

                {/* Page Title - responsive */}
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        position: 'absolute',
                        top: height * 0.24,  // 18% from top
                        fontSize: width * 0.077,
                        lineHeight: width * 0.075
                    }}
                    className="font-medium text-center"
                >
                    Fill KYC Details
                </Text>

                {/* Input Fields Section - responsive */}
                <View
                    className="absolute items-center"
                    style={{
                        top: height * 0.31,  // 25% from top
                        width: '100%',
                        paddingHorizontal: width * 0.05
                    }}
                >
                    {/* Aadhar Number Input */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022
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
                            placeholder="Enter Aadhar Number*"
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={aadharNumber}
                            onChangeText={handleAadharChange}
                            keyboardType="numeric"
                            maxLength={12}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Username Input */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022
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
                            placeholder="Enter Username*"
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={username}
                            onChangeText={(text) => handleInputChange(setUsername, text)}
                            autoCapitalize="words"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Age Input */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022
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
                            placeholder="Enter Age*"
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={age}
                            onChangeText={handleAgeChange}
                            keyboardType="numeric"
                            maxLength={3}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Gender Dropdown - responsive */}
                    <View
                        className="relative"
                        style={{
                            width: '100%',
                            maxWidth: width * 0.9,
                            marginBottom: height * 0.022
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                height: Math.max(48, height * 0.06),
                                borderRadius: 15
                            }}
                            className="flex flex-row items-center justify-between px-4"
                            onPress={handleGenderDropdownToggle}
                            disabled={isLoading}
                        >
                            <Text
                                style={{
                                    color: gender ? Colors.light.blackPrimary : Colors.light.placeholderColor,
                                    fontSize: Math.min(16, width * 0.035)
                                }}
                            >
                                {gender ? gender : "Select Gender*"}
                            </Text>
                            <Image
                                source={isGenderDropdownOpen ? icons.dropdownicon : icons.upicon}
                                style={{
                                    width: width * 0.03,
                                    height: width * 0.03,
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            />
                        </TouchableOpacity>

                        {isGenderDropdownOpen && (
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    borderColor: Colors.light.secondaryText,
                                    position: 'absolute',
                                    top: Math.max(48, height * 0.06),
                                    width: '100%',
                                    zIndex: 1000,
                                    maxHeight: height * 0.2,
                                    borderRadius: 10,
                                    borderWidth: 1
                                }}
                            >
                                <View
                                    style={{
                                        borderColor: Colors.light.secondaryText,
                                        borderBottomWidth: 1,
                                        padding: width * 0.02
                                    }}
                                >
                                    <TextInput
                                        style={{
                                            backgroundColor: Colors.light.whiteFefefe,
                                            color: Colors.light.blackPrimary,
                                            height: height * 0.05,
                                            paddingHorizontal: width * 0.03,
                                            borderRadius: 8,
                                            fontSize: Math.min(14, width * 0.035)
                                        }}
                                        placeholder="Search gender..."
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        value={genderSearchQuery}
                                        onChangeText={setGenderSearchQuery}
                                        autoFocus={false}
                                        editable={!isLoading}
                                    />
                                </View>

                                <ScrollView
                                    style={{ maxHeight: height * 0.12 }}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {filteredGenderOptions.length > 0 ? (
                                        filteredGenderOptions.map((option, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={{
                                                    borderColor: Colors.light.secondaryText,
                                                    borderBottomWidth: index < filteredGenderOptions.length - 1 ? 1 : 0,
                                                    height: Math.max(48, height * 0.06),
                                                    paddingHorizontal: width * 0.04
                                                }}
                                                className="justify-center"
                                                onPress={() => handleGenderSelect(option)}
                                                disabled={isLoading}
                                            >
                                                <Text
                                                    style={{
                                                        color: Colors.light.blackPrimary,
                                                        fontSize: Math.min(16, width * 0.04)
                                                    }}
                                                >
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View
                                            style={{
                                                height: Math.max(48, height * 0.06),
                                                paddingHorizontal: width * 0.04
                                            }}
                                            className="justify-center"
                                        >
                                            <Text
                                                style={{
                                                    color: Colors.light.placeholderColorOp70,
                                                    fontSize: Math.min(16, width * 0.04)
                                                }}
                                            >
                                                No gender found
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Phone Number Input */}
                    <View
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            width: '100%',
                            maxWidth: width * 0.9,
                            height: Math.max(48, height * 0.06),
                            borderRadius: 15,
                            marginBottom: height * 0.022
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
                            placeholder="Enter Phone Number*"
                            placeholderTextColor={Colors.light.placeholderColor}
                            value={phoneNumber}
                            onChangeText={handlePhoneChange}
                            keyboardType="numeric"
                            maxLength={10}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Occupation Dropdown - responsive */}
                    <View
                        className="relative"
                        style={{
                            width: '100%',
                            maxWidth: width * 0.9,
                            marginBottom: height * 0.01
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                height: Math.max(48, height * 0.06),
                                borderRadius: 15
                            }}
                            className="flex flex-row items-center justify-between px-4"
                            onPress={handleDropdownToggle}
                            disabled={isLoading}
                        >
                            <Text
                                style={{
                                    color: selectedOccupation ? Colors.light.blackPrimary : Colors.light.placeholderColor,
                                    fontSize: Math.min(16, width * 0.035)
                                }}
                            >
                                {selectedOccupation ? occupations.find(occ => occ.value === selectedOccupation)?.label : "Select Occupation*"}
                            </Text>
                            <Image
                                source={isDropdownOpen ? icons.dropdownicon : icons.upicon}
                                style={{
                                    width: width * 0.03,
                                    height: width * 0.03,
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            />
                        </TouchableOpacity>

                        {isDropdownOpen && (
                            <View
                                style={{
                                    backgroundColor: Colors.light.whiteFfffff,
                                    borderColor: Colors.light.secondaryText,
                                    position: 'absolute',
                                    top: Math.max(48, height * 0.06),
                                    width: '100%',
                                    zIndex: 1000,
                                    maxHeight: height * 0.2,
                                    borderRadius: 10,
                                    borderWidth: 1
                                }}
                            >
                                <View
                                    style={{
                                        borderColor: Colors.light.secondaryText,
                                        borderBottomWidth: 1,
                                        padding: width * 0.02
                                    }}
                                >
                                    <TextInput
                                        style={{
                                            backgroundColor: Colors.light.whiteFefefe,
                                            color: Colors.light.blackPrimary,
                                            height: height * 0.05,
                                            paddingHorizontal: width * 0.03,
                                            borderRadius: 8,
                                            fontSize: Math.min(14, width * 0.035)
                                        }}
                                        placeholder="Search occupation..."
                                        placeholderTextColor={Colors.light.placeholderColor}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        autoFocus={false}
                                        editable={!isLoading}
                                    />
                                </View>

                                <ScrollView
                                    style={{ maxHeight: height * 0.12 }}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {filteredOccupations.length > 0 ? (
                                        filteredOccupations.map((occupation, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={{
                                                    borderColor: Colors.light.secondaryText,
                                                    borderBottomWidth: index < filteredOccupations.length - 1 ? 1 : 0,
                                                    height: Math.max(48, height * 0.06),
                                                    paddingHorizontal: width * 0.04
                                                }}
                                                className="justify-center"
                                                onPress={() => handleOccupationSelect(occupation)}
                                                disabled={isLoading}
                                            >
                                                <Text
                                                    style={{
                                                        color: Colors.light.blackPrimary,
                                                        fontSize: Math.min(16, width * 0.04)
                                                    }}
                                                >
                                                    {occupation.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View
                                            style={{
                                                height: Math.max(48, height * 0.06),
                                                paddingHorizontal: width * 0.04
                                            }}
                                            className="justify-center"
                                        >
                                            <Text
                                                style={{
                                                    color: Colors.light.placeholderColorOp70,
                                                    fontSize: Math.min(16, width * 0.04)
                                                }}
                                            >
                                                No occupations found
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Error Message - responsive */}
                    {errorMessage ? (
                        <View
                            style={{
                                width: '100%',
                                maxWidth: width * 0.85,
                                paddingHorizontal: width * 0.02
                            }}
                        >
                            <Text
                                style={{
                                    color: '#EF4444',
                                    fontSize: width * 0.035,
                                    textAlign: 'center',
                                    fontWeight: '500'
                                }}
                            >
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Next Button - responsive */}
                <View
                    className="absolute items-center"
                    style={{
                        top: height * 0.817,  // 80% from top
                        width: '100%',
                        paddingHorizontal: width * 0.02
                    }}
                >
                    <CustomGradientButton
                        text={isLoading ? "Saving..." : "Next"}
                        width={Math.min(width * 0.9, 500)}
                        height={Math.max(48, height * 0.06)}
                        borderRadius={100}
                        fontSize={Math.min(18, width * 0.045)}
                        fontWeight="600"
                        textColor={Colors.light.whiteFfffff}
                        onPress={proceedToUserDetails}
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.6 : 1,
                        }}
                    />
                </View>

                {/* Footer Brand Name - responsive */}
                <View
                    className="absolute items-center"
                    style={{
                        bottom: height * 0.04  // 4% from bottom
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
            </View>
        </ScrollView>
    )
};

export default KYC;