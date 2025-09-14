import { Image, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native"
import { useState, useEffect } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import bg from "../../assets/images/bg.png"
import logo from "../../assets/images/MIRAGIO--LOGO.png"
import { icons } from "../../constants/index"
import CustomGradientButton from "../../components/CustomGradientButton"
import { Colors } from "../../constants/Colors"
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthStackParamList } from "../../Navigation/types"

// FIXED: Proper TypeScript props
type Props = NativeStackScreenProps<AuthStackParamList, 'KYC'>;

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
        <View className="flex items-center ">

            {/* =================== BACKGROUND IMAGE =================== */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
            />

            {/* =================== HEADER SECTION WITH LOGO =================== */}
            <View className="absolute  flex  items-center w-full" >
                {/* FIXED: Back button */}
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
                    className=" top-[80px] w-[100px] h-[80px] " />
            </View >

            {/* =================== PAGE TITLE =================== */}
            <Text style={{ color: Colors.light.whiteFfffff }} className="absolute top-[220px] font-medium text-3xl" > Fill KYC Details</Text >

            {/* =================== INPUT FIELDS SECTION =================== */}
            <View className="  absolute top-[280px] " >

                {/* Aadhar number input - Enhanced with numeric validation */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center  w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="ml-5 w-[280px] h-[56px]"
                        placeholder="Enter Aadhar Number*"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={aadharNumber}
                        onChangeText={handleAadharChange}
                        keyboardType="numeric"
                        maxLength={12}
                        editable={!isLoading}
                    />

                </View>

                {/* Name input */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[300px] h-[56px] ml-5"
                        placeholder="Enter Username*"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={username}
                        onChangeText={(text) => handleInputChange(setUsername, text)}
                        autoCapitalize="words"
                        editable={!isLoading}
                    />
                </View>

                {/* Age input - Enhanced with numeric validation */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[300px] h-[56px] ml-5"
                        placeholder="Enter Age*"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={age}
                        onChangeText={handleAgeChange}
                        keyboardType="numeric"
                        maxLength={3}
                        editable={!isLoading}
                    />
                </View>

                {/* Gender input */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[300px] h-[56px] ml-5"
                        placeholder="Enter Gender*"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={gender}
                        onChangeText={(text) => handleInputChange(setGender, text)}
                        autoCapitalize="words"
                        editable={!isLoading}
                    />
                </View>

                {/* Phone Number input - Enhanced with numeric validation */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[280px] h-[56px] ml-5"
                        placeholder="Enter Phone Number*"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        keyboardType="numeric"
                        maxLength={10}
                        editable={!isLoading}
                    />

                </View>

                {/* =================== OCCUPATION DROPDOWN SECTION =================== */}
                <View className="w-[370px] mb-2">
                    {/* Dropdown trigger button */}
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.light.whiteFfffff }}
                        className="flex flex-row items-center justify-between w-[370px] h-[56px] rounded-[15px] px-5"
                        onPress={handleDropdownToggle}
                        disabled={isLoading}
                    >
                        <Text style={{ color: selectedOccupation ? Colors.light.blackPrimary : Colors.light.placeholderColor }} className="text-base">
                            {selectedOccupation ? occupations.find(occ => occ.value === selectedOccupation)?.label : "Select Occupation*"}
                        </Text>
                        <Image
                            source={isDropdownOpen ? icons.dropdownicon : icons.upicon}
                            className="w-3 h-3"
                            style={{ opacity: isLoading ? 0.5 : 1 }}
                        />
                    </TouchableOpacity>

                    {/* Dropdown options container */}
                    {isDropdownOpen && (
                        <View style={{ backgroundColor: Colors.light.whiteFfffff, borderColor: Colors.light.secondaryText }} className="w-[370px] rounded-[10px] mt-3 border z-30">
                            {/* Search input for filtering occupations */}
                            <View style={{ borderColor: Colors.light.secondaryText }} className="px-4 py-3 border-b">
                                <TextInput
                                    style={{ backgroundColor: Colors.light.whiteFefefe, color: Colors.light.blackPrimary }}
                                    className="h-[40px] px-3 rounded-[8px]"
                                    placeholder="Search occupation..."
                                    placeholderTextColor={Colors.light.placeholderColor}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus={false}
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Scrollable occupation options list */}
                            <ScrollView
                                style={{ maxHeight: 90 }}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                            >
                                {filteredOccupations.length > 0 ? (
                                    filteredOccupations.map((occupation, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={{ borderColor: Colors.light.secondaryText }}
                                            className="px-5 py-4 h-[56px] justify-center border-b last:border-b-0"
                                            onPress={() => handleOccupationSelect(occupation)}
                                            disabled={isLoading}
                                        >
                                            <Text style={{ color: Colors.light.blackPrimary }} className="text-base">{occupation.label}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View className="px-5 py-4 h-[56px] justify-center">
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-base">No occupations found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Error message display */}
                {errorMessage ? (
                    <View className="w-[350px] px-4">
                        <Text style={{ color: '#EF4444' }} className="text-center text-sm font-medium">
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}

            </View >

            {/* =================== NEXT BUTTON SECTION =================== */}
            <View className="absolute top-[750px]" >
                <CustomGradientButton
                    text={isLoading ? "Saving..." : "Next"}
                    width={370}
                    height={56}
                    borderRadius={100}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={proceedToUserDetails}
                    disabled={isLoading}
                    style={{
                        opacity: isLoading ? 0.6 : 1,
                    }}
                />
            </View>

            {/* =================== FOOTER BRAND NAME =================== */}
            <View className="absolute bottom-8">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">MIRAGIO</Text>
            </View>

        </View >
    )
};

export default KYC;
