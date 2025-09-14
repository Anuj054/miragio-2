import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import CustomGradientButton from "../../components/CustomGradientButton"; // Updated import
import { Colors } from "../../constants/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import type { AuthStackParamList } from '../../Navigation/types';

// FIXED: Proper TypeScript props for React Native CLI
type Props = NativeStackScreenProps<AuthStackParamList, 'UserDetails'>;

// Type definitions
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

const UserDetails = ({ navigation }: Props) => { // Changed from UserDetailsPage
    // Get user context functions
    const { logout } = useUser();

    // State for registration data from previous steps
    const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

    // State for additional details - START EMPTY
    const [instagramId, setInstagramId] = useState<string>("")
    const [upiId, setUpiId] = useState<string>("")
    const [panNumber, setPanNumber] = useState<string>("")

    // Loading and error states
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")

    // Load registration data on component mount
    useEffect(() => {
        loadRegistrationData();
    }, []);

    const loadRegistrationData = async (): Promise<void> => {
        try {
            const storedData = await AsyncStorage.getItem('@registration_data');
            if (storedData) {
                const data: RegistrationData = JSON.parse(storedData);
                setRegistrationData(data);
                console.log('UserDetails - Loaded registration data:', data);
            } else {
                console.log('UserDetails - No registration data found, redirecting to signup');
                setErrorMessage("No registration data found. Please start from signup page.");
                setTimeout(() => {
                    navigation.navigate('SignUp'); // FIXED: React Native CLI navigation
                }, 3000);
            }
        } catch (error) {
            console.error('UserDetails - Error loading registration data:', error);
            setErrorMessage("Error loading data. Please try again.");
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string): void => {
        setter(value);
        if (errorMessage) setErrorMessage("");
    }

    // Validate PAN number format (now mandatory)
    const validatePanNumber = (pan: string): boolean => {
        if (!pan.trim()) return false; // Now required
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    }

    // Validate UPI ID format (optional field but if filled should be valid)
    const validateUpiId = (upi: string): boolean => {
        if (!upi.trim()) return true; // Optional field
        const upiRegex = /^[\w\.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(upi);
    }

    // Validate form inputs
    const validateForm = (): boolean => {
        console.log('UserDetails - Validating form...');

        // Check PAN number (now mandatory)
        if (!panNumber.trim()) {
            setErrorMessage("PAN number is required");
            return false;
        }

        if (!validatePanNumber(panNumber)) {
            setErrorMessage("Please enter a valid PAN number (e.g., ABCDE1234F)");
            return false;
        }

        // Check UPI ID if provided
        if (upiId.trim() && !validateUpiId(upiId)) {
            setErrorMessage("Please enter a valid UPI ID (e.g., username@paytm)");
            return false;
        }

        // Check that we have all required data from previous steps
        if (!registrationData) {
            setErrorMessage("Required data missing. Please start from signup page.");
            return false;
        }

        console.log('UserDetails - Form validation passed');
        return true;
    };

    // API call to register user with complete data
    const registerUserComplete = async (): Promise<void> => {
        if (isLoading) return; // Prevent double-tap

        console.log('UserDetails - Starting registration...');

        // Clear previous error
        setErrorMessage("");

        if (!validateForm()) {
            console.log('UserDetails - Form validation failed');
            return;
        }

        if (!registrationData) {
            setErrorMessage("Registration data not found. Please start from signup.");
            setTimeout(() => {
                navigation.navigate('SignUp'); // FIXED: React Native CLI navigation
            }, 3000);
            return;
        }

        setIsLoading(true);

        try {
            // FIRST: Clear any existing user session
            console.log('UserDetails - Clearing existing user session...');
            await logout();

            // Prepare complete API payload
            const payload = {
                action: "adduser",
                username: registrationData.username.trim(),
                password: registrationData.password.trim(),
                email: registrationData.email.trim(),
                age: registrationData.age.trim(),
                gender: registrationData.gender.trim(),
                occupation: registrationData.occupation.trim(),
                aadharnumber: registrationData.aadharnumber.trim(),
                phone_number: registrationData.phone_number.trim(),
                instagram_username: instagramId.trim() || "", // Optional field
                pan_number: panNumber.trim().toUpperCase(), // Now required field
                upi: upiId.trim() || "", // Optional field
                user_role: registrationData.user_role || "user",
                referral_code: registrationData.referral_code || "", // Handle empty referral code
                status: registrationData.status || "1"
            };

            console.log('UserDetails - Sending API payload:', payload);

            // Make API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('UserDetails - Response status:', response.status);

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('UserDetails - Raw response:', responseText);

            // Handle empty response
            if (!responseText.trim()) {
                throw new Error('Empty response from server');
            }

            let result: any;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('UserDetails - JSON parse error:', parseError);
                console.error('UserDetails - Response text that failed to parse:', responseText);
                throw new Error('Invalid JSON response from server');
            }

            console.log('UserDetails - Parsed result:', result);

            if (result.status === 'success') {
                console.log('UserDetails - Registration successful, user ID:', result.data?.id);

                // Store the new account credentials for potential auto-login
                await AsyncStorage.setItem('@new_account_credentials', JSON.stringify({
                    email: registrationData.email,
                    password: registrationData.password
                }));
                console.log('UserDetails - Stored credentials for auto-login');

                // Clear signup and registration data (but keep credentials for auto-login)
                await Promise.all([
                    AsyncStorage.removeItem('@signup_data'),
                    AsyncStorage.removeItem('@registration_data')
                ]);
                console.log('UserDetails - Cleared signup data, kept credentials for auto-login');

                // Show success message
                setErrorMessage("✅ Account created successfully! Redirecting to OTP verification...");

                // FIXED: Navigate to OTP screen with React Native CLI navigation
                setTimeout(() => {
                    navigation.navigate('Otp');
                }, 2000);

            } else {
                const errorMsg = result.message || "Failed to create account. Please try again.";
                console.error('UserDetails - API error:', errorMsg);

                // ENHANCED: Better error message display
                let displayMessage = errorMsg;

                if (result.message) {
                    const msg = result.message.toLowerCase();

                    if (msg.includes('email already registered') || msg.includes('email exists')) {
                        displayMessage = "❌ This email is already registered. Please use a different email or try signing in.";

                        setTimeout(() => {
                            setErrorMessage(displayMessage + "\n\n🔄 Redirecting to login page...");
                            setTimeout(() => {
                                navigation.navigate('SignIn');
                            }, 2000);
                        }, 3000);

                    } else if (msg.includes('username') && (msg.includes('exists') || msg.includes('taken'))) {
                        displayMessage = "❌ This username is already taken. Please choose a different username.";

                    } else {
                        displayMessage = `❌ ${result.message}`;
                    }
                } else {
                    displayMessage = "❌ Registration failed. Please check your details and try again.";
                }

                setErrorMessage(displayMessage);
            }

        } catch (error: unknown) {
            console.error('UserDetails - Registration error:', error);

            let errorMsg = "❌ Network error. Please check your connection and try again.";

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMsg = "❌ Request timeout. Please check your internet connection.";
                } else if (error.message.includes('JSON')) {
                    errorMsg = "❌ Server response error. Please try again in a moment.";
                } else if (error.message.includes('HTTP error')) {
                    errorMsg = "❌ Server error. Please try again later.";
                }
            }

            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false); // Always reset loading state
        }
    };

    // FIXED: Back button handler for React Native CLI
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
                {/* FIXED: Back button for React Native CLI */}
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
            <Text style={{ color: Colors.light.whiteFfffff }} className="absolute top-[220px] font-medium text-3xl" > Additional Details</Text >

            {/* =================== INPUT FIELDS SECTION =================== */}
            <View className="  absolute top-[280px] " >

                {/* Instagram ID input */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center  w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="ml-5 w-[300px] h-[56px]"
                        placeholder="Instagram ID (Optional)"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={instagramId}
                        onChangeText={(text) => handleInputChange(setInstagramId, text)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                {/* UPI ID input */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[300px] h-[56px] ml-5"
                        placeholder="UPI ID (Optional)"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={upiId}
                        onChangeText={(text) => handleInputChange(setUpiId, text)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                {/* PAN Number input - NOW REQUIRED */}
                <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="flex flex-row items-center w-[370px] h-[56px] rounded-[15px] mb-5">
                    <TextInput
                        style={{ backgroundColor: Colors.light.whiteFfffff, color: Colors.light.blackPrimary }}
                        className="w-[300px] h-[56px] ml-5"
                        placeholder="PAN Number *"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={panNumber}
                        onChangeText={(text) => handleInputChange(setPanNumber, text.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={10}
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                {/* ENHANCED: Error message display */}
                {errorMessage && (
                    <View className="w-[370px] mt-3 px-2">
                        <View
                            style={{
                                backgroundColor: errorMessage.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                borderColor: errorMessage.includes('✅') ? '#10B981' : '#EF4444',
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: 12,
                            }}
                        >
                            <Text
                                style={{
                                    color: errorMessage.includes('✅') ? '#10B981' : '#EF4444',
                                    textAlign: 'center',
                                    fontSize: 14,
                                    fontWeight: '500',
                                    lineHeight: 20,
                                }}
                            >
                                {errorMessage}
                            </Text>
                        </View>
                    </View>
                )}

            </View >

            {/* =================== COMPLETE REGISTRATION BUTTON =================== */}
            <View className="absolute top-[520px]" >
                <CustomGradientButton
                    text={isLoading ? "Creating Account..." : "Complete Registration"}
                    width={370}
                    height={56}
                    borderRadius={100}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={registerUserComplete}
                    disabled={isLoading || !registrationData || !panNumber.trim()}
                    style={{
                        opacity: (isLoading || !registrationData || !panNumber.trim()) ? 0.6 : 1,
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

export default UserDetails; // FIXED: Component name matches navigator registration
