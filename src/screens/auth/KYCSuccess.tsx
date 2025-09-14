import { Image, Text, View } from "react-native"
import { useState, useEffect } from 'react'
import bg from "../../assets/images/bg.png"
import tick from "../../assets/images/tick.png"
import { useNavigation } from '@react-navigation/native'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { StackActions } from '@react-navigation/native'
import CustomGradientButton from "../../components/CustomGradientButton"
import { Colors } from "../../constants/Colors"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUser } from '../../context/UserContext'

const KYCSuccess = () => {
    // Navigation hook
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const { login, isLoggedIn } = useUser();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginAttempted, setLoginAttempted] = useState<boolean>(false);
    const [loginMessage, setLoginMessage] = useState<string>("Yay! KYC Successful");

    useEffect(() => {
        attemptAutoLogin();
    }, []);

    const attemptAutoLogin = async (): Promise<void> => {
        if (loginAttempted) return;
        setLoginAttempted(true);

        try {
            setIsLoading(true);

            // Check for stored credentials
            const storedCredentials = await AsyncStorage.getItem('@new_account_credentials');

            if (storedCredentials) {
                const credentials = JSON.parse(storedCredentials);
                setLoginMessage("Logging you in...");

                // Attempt auto-login
                const loginResult = await login(credentials.email, credentials.password);

                if (loginResult.success) {
                    setLoginMessage("Welcome! You're now logged in.");

                    // Clear credentials after successful login
                    await Promise.all([
                        AsyncStorage.removeItem('@new_account_credentials'),
                        AsyncStorage.removeItem('@pending_user_id')
                    ]);

                } else {
                    setLoginMessage("Account created successfully! Please login manually if needed.");

                    // Clear credentials even if login failed
                    await AsyncStorage.removeItem('@new_account_credentials');
                }
            } else {
                setLoginMessage("KYC completed successfully!");
            }

        } catch (error) {
            setLoginMessage("KYC completed! Please login if needed.");

            // Clear credentials on error
            try {
                await AsyncStorage.removeItem('@new_account_credentials');
            } catch (clearError) {
                // Handle error silently
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = (): void => {
        try {
            // FIXED: Navigate to the main app based on user login status
            if (isLoggedIn) {
                // User is logged in, navigate to main app
                // Try different navigation methods based on your app structure

                // Method 1: Navigate to main tab navigator (most common)
                try {
                    navigation.navigate('MainTabs' as never);
                } catch (error1) {
                    // Method 2: Try navigating to Home or TaskPage directly
                    try {
                        navigation.navigate('TaskPage' as never);
                    } catch (error2) {
                        // Method 3: Try resetting the navigation stack
                        try {
                            navigation.dispatch(
                                StackActions.replace('MainTabs' as never)
                            );
                        } catch (error3) {
                            // Method 4: Final fallback - reset to a known screen
                            navigation.dispatch(
                                StackActions.replace('Welcome' as never)
                            );
                        }
                    }
                }
            } else {
                // User is not logged in, go to login screen
                navigation.navigate('SignIn' as never);
            }
        } catch (error) {
            // Final fallback
            navigation.navigate('Welcome' as never);
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

            {/* =================== SUCCESS ICON SECTION =================== */}
            <View className=" absolute top-[200px]">
                <Image source={tick} className="w-[360px] h-[360px]" />
            </View>

            {/* =================== SUCCESS MESSAGE SECTION =================== */}
            <View className=" absolute top-[600px] items-center">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold text-center">
                    {loginMessage}
                </Text>
                {isLoading && (
                    <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-base mt-2">
                        Please wait...
                    </Text>
                )}
            </View>

            {/* =================== CONTINUE BUTTON SECTION =================== */}
            <View className="absolute top-[780px]" >
                <CustomGradientButton
                    text={isLoading ? "Please wait..." : (isLoggedIn ? "Continue to App" : "Go to Login")}
                    width={370}
                    height={56}
                    borderRadius={15}
                    fontSize={18}
                    fontWeight="600"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleContinue}
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

export default KYCSuccess;
