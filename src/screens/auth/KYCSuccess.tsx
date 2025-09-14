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

    const { login } = useUser();
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
                console.log('KYCSuccess - Found credentials, attempting auto-login:', credentials.email);

                setLoginMessage("Logging you in...");

                // Attempt auto-login
                const loginResult = await login(credentials.email, credentials.password);

                if (loginResult.success) {
                    console.log('KYCSuccess - Auto-login successful!');
                    setLoginMessage("Welcome! You're now logged in.");

                    // Clear credentials after successful login
                    await AsyncStorage.removeItem('@new_account_credentials');
                    console.log('KYCSuccess - Credentials cleared after successful login');

                } else {
                    console.error('KYCSuccess - Auto-login failed:', loginResult.message);
                    setLoginMessage("Account created successfully! Please login manually if needed.");

                    // Clear credentials even if login failed
                    await AsyncStorage.removeItem('@new_account_credentials');
                }
            } else {
                console.log('KYCSuccess - No credentials found for auto-login');
                setLoginMessage("KYC completed successfully!");
            }

        } catch (error) {
            console.error('KYCSuccess - Auto-login error:', error);
            setLoginMessage("KYC completed! Please login if needed.");

            // Clear credentials on error
            try {
                await AsyncStorage.removeItem('@new_account_credentials');
            } catch (clearError) {
                console.error('KYCSuccess - Error clearing credentials:', clearError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = (): void => {
        try {
            // Method 1: Try simple navigate first
            navigation.navigate('Tabs');
        } catch (error) {
            console.error('Direct navigation failed:', error);

            try {
                // Method 2: Use StackActions.replace for stack navigation
                navigation.dispatch(
                    StackActions.replace('Tabs')
                );
            } catch (error2) {
                console.error('StackActions.replace failed:', error2);

                try {
                    // Method 3: Try navigating to TaskPage directly  
                    navigation.navigate('TaskPage');
                } catch (error3) {
                    console.error('TaskPage navigation failed:', error3);

                    try {
                        // Method 4: Use StackActions.replace for TaskPage
                        navigation.dispatch(
                            StackActions.replace('TaskPage')
                        );
                    } catch (error4) {
                        console.error('All navigation methods failed:', error4);
                        // You might want to show an error message to the user here
                    }
                }
            }
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
                    text={isLoading ? "Please wait..." : "Continue"}
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
