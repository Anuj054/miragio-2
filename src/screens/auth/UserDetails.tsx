import { Image, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import { useState, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import logo from "../../assets/images/MIRAGIO--LOGO.png";
import { icons } from "../../constants/index";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
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
    // Use UserContext methods
    const { isLoading: contextLoading } = useUser();

    // State for registration data from previous steps
    const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

    // State for additional details - START EMPTY
    const [instagramId, setInstagramId] = useState<string>("");
    const [upiId, setUpiId] = useState<string>("");
    const [panNumber, setPanNumber] = useState<string>("");

    // Loading and error states
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

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
            } else {
                setErrorMessage("No registration data found. Please start from signup page.");
                setTimeout(() => {
                    navigation.navigate('SignUp');
                }, 3000);
            }
        } catch (error) {
            setErrorMessage("Error loading data. Please try again.");
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string): void => {
        setter(value);
        if (errorMessage) setErrorMessage("");
    }

    // PAN validation with detailed logging
    const validatePanNumber = (pan: string): boolean => {
        if (!pan.trim()) return false;

        if (pan.length !== 10) {
            return false;
        }

        const panUpper = pan.toUpperCase();

        // Standard PAN format: 5 letters + 4 digits + 1 letter (ABCDE1234F)
        const standardPanRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        // Alternative format for testing: 5 letters + 3 digits + 2 letters (YTCBU776YN)
        const altPanRegex = /^[A-Z]{5}[0-9]{3}[A-Z]{2}$/;

        const isStandardValid = standardPanRegex.test(panUpper);
        const isAltValid = altPanRegex.test(panUpper);
        const isValid = isStandardValid || isAltValid;

        return isValid;
    }

    // Validate UPI ID format (optional field but if filled should be valid)
    const validateUpiId = (upi: string): boolean => {
        if (!upi.trim()) return true; // Optional field
        const upiRegex = /^[\w\.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(upi);
    }

    // Enhanced form validation with detailed error messages
    const validateForm = (): boolean => {
        // STRICT: Check PAN number is mandatory and properly filled
        if (!panNumber || !panNumber.trim()) {
            setErrorMessage("PAN number is required. Please enter your PAN number.");
            return false;
        }

        if (panNumber.trim().length !== 10) {
            setErrorMessage("PAN number must be exactly 10 characters. Current length: " + panNumber.length);
            return false;
        }

        // DETAILED: Check PAN format
        const panUpper = panNumber.trim().toUpperCase();

        // Check if it matches either valid format
        if (!validatePanNumber(panUpper)) {
            // More specific error based on what's wrong
            if (!/^[A-Z]{5}/.test(panUpper)) {
                setErrorMessage("PAN must start with 5 letters (A-Z). Example: ABCDE1234F");
            } else if (!/[0-9]/.test(panUpper.substring(5, 9))) {
                setErrorMessage("PAN must contain digits in positions 6-9. Example: ABCDE1234F");
            } else {
                setErrorMessage("Invalid PAN format. Accepted formats: ABCDE1234F or ABCDE123FG");
            }
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

        return true;
    };

    const registerUserComplete = async (): Promise<void> => {
        if (isLoading || contextLoading) return;

        // Clear previous error
        setErrorMessage("");

        // STRICT: Validate form first
        if (!validateForm()) {
            return;
        }

        if (!registrationData) {
            setErrorMessage("Registration data not found. Please start from signup.");
            setTimeout(() => {
                navigation.navigate('SignUp');
            }, 3000);
            return;
        }

        setIsLoading(true);

        try {
            // DIRECT API CALL - bypassing UserContext temporarily
            const payload = {
                action: "adduser", // Make sure this matches your API
                username: registrationData.username.trim(),
                password: registrationData.password.trim(),
                email: registrationData.email.trim(),
                age: registrationData.age.trim(),
                gender: registrationData.gender.trim(),
                occupation: registrationData.occupation.trim(),
                aadharnumber: registrationData.aadharnumber.trim(),
                phone_number: registrationData.phone_number.trim(),
                instagram_username: instagramId.trim() || "",
                pan_number: panNumber.trim().toUpperCase(),
                upi: upiId.trim() || "",
                user_role: "user",
                referral_code: registrationData.referral_code || "",
                status: "1"
            };

            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();

            if (!responseText.trim()) {
                throw new Error('Empty response from server');
            }

            let result: any;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Invalid JSON response from server');
            }
            // In UserDetails.tsx - Update the registerUserComplete function around line 235:

            if (result.status === 'success') {
                // Extract user ID from different possible response formats
                const userId = result.data?.id || result.data?.user_id || result.id || result.user_id;

                // ADDED: Store credentials for auto-login (this was missing!)
                await AsyncStorage.setItem('@new_account_credentials', JSON.stringify({
                    email: registrationData.email,
                    password: registrationData.password
                }));

                // Clear signup and registration data
                await Promise.all([
                    AsyncStorage.removeItem('@signup_data'),
                    AsyncStorage.removeItem('@registration_data')
                ]);

                // Show success message
                setErrorMessage("Account created successfully! Redirecting to OTP verification...");

                // Navigate to OTP screen
                setTimeout(() => {
                    if (userId) {
                        // Store userId for OTP screen
                        AsyncStorage.setItem('@pending_user_id', userId.toString());
                        navigation.navigate('Otp', { userId: userId.toString() });
                    } else {
                        // Navigate without userId if not available
                        navigation.navigate('Otp', {});
                    }
                });
            }
            else {
                const errorMsg = result.message || "Failed to create account. Please try again.";

                let displayMessage = errorMsg;

                if (result.message) {
                    const msg = result.message.toLowerCase();

                    if (msg.includes('email already registered') || msg.includes('email exists')) {
                        displayMessage = "This email is already registered. Please use a different email or try signing in.";

                        setTimeout(() => {
                            setErrorMessage(displayMessage + "\n\nRedirecting to login page...");
                            setTimeout(() => {
                                navigation.navigate('SignIn');
                            }, 2000);
                        }, 3000);

                    } else if (msg.includes('username') && (msg.includes('exists') || msg.includes('taken'))) {
                        displayMessage = "This username is already taken. Please choose a different username.";
                    } else if (msg.includes('pan')) {
                        displayMessage = "Invalid PAN number. Please check and try again.";
                    } else {
                        displayMessage = `${result.message}`;
                    }
                } else {
                    displayMessage = "Registration failed. Please check your details and try again.";
                }

                setErrorMessage(displayMessage);
            }

        } catch (error: unknown) {
            let errorMsg = "Network error. Please check your connection and try again.";

            if (error instanceof Error) {
                if (error.message.includes('timeout')) {
                    errorMsg = "Request timeout. Please check your internet connection.";
                } else if (error.message.includes('JSON')) {
                    errorMsg = "Server response error. Please try again in a moment.";
                } else if (error.message.includes('HTTP error')) {
                    errorMsg = "Server error. Please try again later.";
                } else if (error.message.includes('Empty response')) {
                    errorMsg = "Server returned empty response. Please try again.";
                }
            }

            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Back button handler
    const handleBackPress = (): void => {
        if (!isLoading && !contextLoading) {
            navigation.goBack();
        }
    };

    // Button should be disabled if PAN is not properly filled
    const isButtonDisabled = isLoading || contextLoading || !registrationData || !panNumber.trim() || panNumber.trim().length !== 10;

    return (
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
                            opacity: isButtonDisabled ? 0.5 : 1
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
                    top: height * 0.25,  // 18% from top
                    fontSize: width * 0.077,
                    lineHeight: width * 0.075
                }}
                className="font-medium text-center"
            >
                Additional Details
            </Text>

            {/* Input Fields Section - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.31,  // 26% from top
                    width: '100%',
                    paddingHorizontal: width * 0.05
                }}
            >
                {/* Instagram ID Input */}
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
                            paddingHorizontal: width * 0.05,
                            paddingVertical: 0
                        }}
                        placeholder="Instagram ID "
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={instagramId}
                        onChangeText={(text) => handleInputChange(setInstagramId, text)}
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
                            paddingHorizontal: width * 0.05,
                            paddingVertical: 0
                        }}
                        placeholder="UPI ID"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={upiId}
                        onChangeText={(text) => handleInputChange(setUpiId, text)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                        editable={!isLoading && !contextLoading}
                    />
                </View>

                {/* PAN Number Input - Required */}
                <View
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        width: '100%',
                        maxWidth: width * 0.9,
                        height: Math.max(48, height * 0.06),
                        borderRadius: 15,
                        marginBottom: height * 0.01
                    }}
                    className="flex flex-row items-center"
                >
                    <TextInput
                        style={{
                            backgroundColor: 'transparent',
                            color: Colors.light.blackPrimary,
                            flex: 1,
                            fontSize: Math.min(16, width * 0.035),
                            paddingHorizontal: width * 0.05,
                            paddingVertical: 0
                        }}
                        placeholder="PAN Number*"
                        placeholderTextColor={Colors.light.placeholderColor}
                        value={panNumber}
                        onChangeText={(text) => handleInputChange(setPanNumber, text.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={10}
                        autoCorrect={false}
                        editable={!isLoading && !contextLoading}
                    />
                </View>

                {/* Error Message - responsive */}
                {errorMessage ? (
                    <View
                        style={{
                            marginTop: height * 0.02,
                            width: '100%',
                            maxWidth: width * 0.85,
                            paddingHorizontal: width * 0.02
                        }}
                    >
                        <Text
                            style={{
                                color: errorMessage.includes('successfully') ? '#10B981' : '#EF4444',
                                fontSize: width * 0.03,
                                textAlign: 'center',
                                fontWeight: '500',
                                lineHeight: width * 0.045
                            }}
                        >
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Complete Registration Button - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.567,  // 52% from top
                    width: '100%',
                    paddingHorizontal: width * 0.09
                }}
            >
                <CustomGradientButton
                    text={(isLoading || contextLoading) ? "Creating Account..." : "Complete Registration"}
                    width={Math.min(width * 0.9, 370)}
                    height={Math.max(48, height * 0.06)}
                    borderRadius={100}
                    fontSize={Math.min(18, width * 0.045)}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={registerUserComplete}
                    disabled={isButtonDisabled}
                    style={{
                        opacity: isButtonDisabled ? 0.6 : 1,
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
    )
};

export default UserDetails;