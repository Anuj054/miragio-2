import React from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Import your assets
import bg2 from '../../assets/images/bg2.png';
import wallet2 from '../../assets/images/wallet2.jpg';
import { icons } from '../../constants/index';
import profilephoto from '../../assets/images/profilephoto.png';

import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';

// Translation imports - USING CUSTOM COMPONENTS
import { TranslatedText } from '../../components/TranslatedText';
import { useTranslation } from '../../context/TranslationContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Navigation types
type NavigationProp = any;

const WalletPage = () => {
    const { currentLanguage } = useTranslation();

    const [walletBalance, setWalletBalance] = useState('0');
    const [withdrawableBalance, setWithdrawableBalance] = useState('0');
    const [loading, setLoading] = useState(true);
    const [, setUserDetails] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Navigation for React Native CLI
    const navigation = useNavigation<NavigationProp>();

    // Get user context - including logout function
    const { user, getUserId, isLoggedIn, refreshUserData, logout } = useUser();

    // Function to fetch user details and wallet balance
    const fetchWalletBalance = async () => {
        try {
            setLoading(true);

            // Get the logged-in user's ID
            const userId = getUserId();

            if (!userId) {
                console.error('No user ID found. User might not be logged in.');
                // Redirect to login if no user ID
                navigation.replace('Welcome');
                return;
            }

            const response = await fetch(
                'https://miragiofintech.org/api/api.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'get_userdetails',
                        id: userId, // Use dynamic user ID from context
                    }),
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                setUserDetails(data.data);
                setWalletBalance(data.data.wallet || '0');

                // Calculate withdrawable balance (assuming it's the total balance for now)
                // You can modify this logic based on your business rules
                const totalBalance = parseFloat(data.data.wallet || '0');
                const withdrawable = totalBalance; // Or apply any business logic here
                setWithdrawableBalance(withdrawable.toString());

                // Update user context with latest data (including wallet balance)
                await refreshUserData();
            } else {
                console.error('Failed to fetch user details:', data.message);
                // Keep default values on error
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            // Keep default values on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch wallet balance on component mount and when user changes
    useEffect(() => {
        if (isLoggedIn && getUserId()) {
            fetchWalletBalance();
        } else {
            // Redirect to login if user is not logged in
            navigation.replace('Welcome');
        }
    }, [isLoggedIn, user?.id]); // Re-fetch when login status or user ID changes

    // Refresh wallet balance when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (isLoggedIn && getUserId()) {
                fetchWalletBalance();
            }
        }, [isLoggedIn, user?.id]),
    );

    // Function to refresh wallet balance (can be called from pull-to-refresh or button)
    const refreshBalance = () => {
        fetchWalletBalance();
    };

    // Navigation handlers
    const handleBackPress = () => {
        // Use goBack() instead of specific navigation
        navigation.goBack();
    };

    const handleProfilePress = () => {
        // Since UserProfile is at root level, navigate directly
        navigation.navigate('UserProfile', { from: 'wallet' });
    };

    const handleTransactionsPress = () => {
        navigation.replace('Transactions');
    };

    const handleWithdrawPress = () => {
        navigation.navigate('Withdraw');
    };

    // FIXED: Proper logout function
    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevent double-tap

        try {
            setIsLoggingOut(true);
            console.log('Wallet - Starting logout process...');

            // Call the logout function from UserContext
            // This will set isAuthenticated to false and clear user data
            await logout();

            console.log('Wallet - Logout completed, automatic navigation will occur');

            // No manual navigation needed!
            // RootNavigator will detect isAuthenticated = false
            // and automatically show Auth stack instead of Main stack

        } catch (error) {
            console.error('Wallet - Logout error:', error);
            // UserContext logout should still work even with errors
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <View
            className="flex-1"
            style={{ backgroundColor: Colors.light.blackPrimary }}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />

            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <View style={{ height: height * 0.14 }}>
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header overlay content with navigation and profile */}
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
                            Wallet
                        </TranslatedText>

                        {/* Profile photo */}
                        <TouchableOpacity
                            onPress={handleProfilePress}
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                width: width * 0.11,
                                height: width * 0.11,
                                borderRadius: (width * 0.11) / 2
                            }}
                            className="items-center justify-center"
                        >
                            <Image
                                source={profilephoto}
                                style={{
                                    height: width * 0.11,
                                    width: width * 0.11,
                                    borderRadius: (width * 0.11) / 2
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full"
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        height: 1
                    }}
                />
            </View>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.01 }}
            >
                {/* =================== WALLET BALANCE CARD SECTION =================== */}
                <View className="relative">
                    {/* Wallet background image */}
                    <Image
                        source={wallet2}
                        style={{
                            width: '100%',
                            height: height * 0.34
                        }}
                        resizeMode="cover"
                    />

                    {/* Balance overlay content */}
                    <View
                        className="absolute"
                        style={{
                            paddingHorizontal: width * 0.05,
                            paddingVertical: height * 0.025
                        }}
                    >
                        {/* Total balance title with translation */}
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.06
                            }}
                            className="font-semibold"
                        >
                            Total Balance
                        </TranslatedText>

                        {/* Balance amount with coin icon */}
                        <View
                            className="flex-row items-center"
                            style={{ paddingTop: height * 0.01 }}
                        >
                            <Image
                                source={icons.maincoin}
                                style={{
                                    width: width * 0.1,
                                    height: width * 0.1
                                }}
                            />
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.05,
                                    marginLeft: width * 0.02
                                }}
                                className="font-extrabold"
                            >
                                {loading ? (currentLanguage === 'hi' ? 'लोड हो रहा है...' : 'Loading...') : walletBalance}
                            </Text>
                            {/* Refresh button */}
                            <TouchableOpacity
                                onPress={refreshBalance}
                                style={{
                                    marginLeft: width * 0.03,
                                    padding: width * 0.01
                                }}
                                disabled={loading}
                            >
                                <Image
                                    source={icons.go}
                                    style={{
                                        width: width * 0.05,
                                        height: width * 0.05,
                                        opacity: loading ? 0.5 : 1,
                                        transform: [{ rotate: loading ? '180deg' : '0deg' }]
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Account balance and transactions link */}
                        <View
                            className="flex-row justify-between w-full"
                            style={{ marginTop: height * 0.005 }}
                        >
                            <TranslatedText
                                style={{
                                    color: Colors.light.placeholderColorOp70,
                                    fontSize: width * 0.035,
                                    paddingTop: height * 0.01
                                }}
                            >
                                Account Balance
                            </TranslatedText>

                            {/* My transactions navigation link */}
                            <TouchableOpacity
                                className="flex-row items-center"
                                style={{ paddingTop: height * 0.01 }}
                                onPress={handleTransactionsPress}
                            >
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.035
                                    }}
                                >
                                    My Transactions
                                </TranslatedText>
                                <Image
                                    source={icons.go}
                                    style={{
                                        height: width * 0.035,
                                        width: width * 0.035,
                                        marginLeft: width * 0.03
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* =================== COMPACT WITHDRAW SECTION =================== */}
                        <View
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                borderWidth: 1,
                                borderRadius: 12,
                                padding: width * 0.03,
                                marginTop: height * 0.015,
                                width: '100%'
                            }}
                        >
                            {/* Header with status */}
                            <View
                                className="flex flex-row justify-between items-center"
                                style={{ marginBottom: height * 0.015 }}
                            >
                                <TranslatedText
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035
                                    }}
                                    className="font-medium"
                                >
                                    Available for Withdrawal
                                </TranslatedText>
                            </View>

                            {/* Compact balance and button row */}
                            <View className="flex flex-row justify-between items-center">
                                {/* Withdrawable balance display */}
                                <View className="flex flex-row items-center flex-1">
                                    <Image
                                        source={icons.maincoin}
                                        style={{
                                            height: width * 0.063,
                                            width: width * 0.063,
                                            marginRight: width * 0.02
                                        }}
                                    />
                                    <View>
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.045
                                            }}
                                            className="font-bold"
                                        >
                                            {loading ? '...' : withdrawableBalance}
                                        </Text>
                                        <TranslatedText
                                            style={{
                                                color: Colors.light.placeholderColorOp70,
                                                fontSize: width * 0.03
                                            }}
                                        >
                                            Withdrawable
                                        </TranslatedText>
                                    </View>
                                </View>

                                {/* Compact withdraw button */}
                                <TouchableOpacity
                                    className="items-center justify-center flex flex-row"
                                    style={{
                                        backgroundColor:
                                            parseFloat(withdrawableBalance) >= 100
                                                ? Colors.light.bgGreen
                                                : 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: 12,
                                        minWidth: width * 0.3,
                                        paddingHorizontal: width * 0.05,
                                        paddingVertical: height * 0.01
                                    }}
                                    onPress={() => {
                                        if (parseFloat(withdrawableBalance) >= 100) {
                                            handleWithdrawPress();
                                        }
                                    }}
                                    disabled={parseFloat(withdrawableBalance) < 100}
                                >
                                    <Image
                                        source={icons.withdraw}
                                        style={{
                                            width: width * 0.045,
                                            height: width * 0.045,
                                            marginRight: width * 0.02,
                                            opacity: parseFloat(withdrawableBalance) >= 100 ? 1 : 0.5
                                        }}
                                    />
                                    <TranslatedText
                                        style={{
                                            color:
                                                parseFloat(withdrawableBalance) >= 100
                                                    ? Colors.light.whiteFefefe
                                                    : 'rgba(255, 255, 255, 0.5)',
                                            fontSize: width * 0.04
                                        }}
                                        className="font-semibold"
                                    >
                                        WITHDRAW
                                    </TranslatedText>
                                </TouchableOpacity>
                            </View>

                            {/* Compact progress bar and info */}
                            <View style={{ marginTop: height * 0.015 }}>
                                <View
                                    style={{
                                        height: 2,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: 1,
                                        marginBottom: height * 0.005
                                    }}
                                >
                                    <View
                                        style={{
                                            height: 2,
                                            backgroundColor: Colors.light.bgGreen,
                                            borderRadius: 1,
                                            width: `${Math.min(
                                                (parseFloat(withdrawableBalance) / 100) * 100,
                                                100,
                                            )}%`
                                        }}
                                    />
                                </View>
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    {parseFloat(withdrawableBalance) >= 100
                                        ? (currentLanguage === 'hi'
                                            ? 'निकालने के लिए तैयार • न्यूनतम: 100 सिक्के'
                                            : 'Ready to withdraw • Min: 100 coins')
                                        : (currentLanguage === 'hi'
                                            ? `${100 - parseFloat(withdrawableBalance)} और सिक्के चाहिए • न्यूनतम: 100`
                                            : `Need ${100 - parseFloat(withdrawableBalance)} more coins • Min: 100`)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* =================== MAIN CONTENT SECTION =================== */}
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        minHeight: height * 0.7
                    }}
                >
                    <View
                        className="items-center"
                        style={{
                            paddingHorizontal: width * 0.05,
                            paddingTop: height * 0.04
                        }}
                    >
                        {/* =================== QUICK ACCESS GRID ROW 1 =================== */}
                        <View
                            className="flex-row items-center justify-between"
                            style={{ marginVertical: height * 0.015 }}
                        >
                            {/* FAQs card */}
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.light.backlight2,
                                    height: height * 0.09,
                                    width: width * 0.45,
                                    borderRadius: 12,
                                    marginHorizontal: width * 0.015
                                }}
                                className="flex-row items-center"
                                onPress={() => navigation.navigate('FAQ')}
                            >
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        width: width * 0.1,
                                        height: width * 0.1,
                                        marginLeft: width * 0.03,
                                        borderRadius: 8
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Image
                                        source={icons.faq}
                                        style={{
                                            width: width * 0.068,
                                            height: width * 0.068
                                        }}
                                    />
                                </View>
                                <View
                                    className="flex-1"
                                    style={{ marginHorizontal: width * 0.03 }}
                                >
                                    <TranslatedText
                                        style={{
                                            color: Colors.light.secondaryText,
                                            fontSize: width * 0.04
                                        }}
                                        className="font-medium"
                                    >
                                        FAQs
                                    </TranslatedText>
                                    <TranslatedText
                                        style={{
                                            color: Colors.light.placeholderColorOp70,
                                            fontSize: width * 0.03
                                        }}
                                    >
                                        Contact for all queries
                                    </TranslatedText>
                                </View>
                            </TouchableOpacity>

                            {/* Offers card */}
                            <View
                                style={{
                                    backgroundColor: Colors.light.backlight2,
                                    height: height * 0.09,
                                    width: width * 0.45,
                                    borderRadius: 12,
                                    marginHorizontal: width * 0.015
                                }}
                                className="flex-row items-center"
                            >
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        width: width * 0.1,
                                        height: width * 0.1,
                                        marginLeft: width * 0.03,
                                        borderRadius: 8
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Image
                                        source={icons.offers}
                                        style={{
                                            width: width * 0.07,
                                            height: width * 0.07
                                        }}
                                    />
                                </View>
                                <View
                                    className="flex-1"
                                    style={{ marginHorizontal: width * 0.03 }}
                                >
                                    <TranslatedText
                                        style={{
                                            color: Colors.light.secondaryText,
                                            fontSize: width * 0.04
                                        }}
                                        className="font-medium"
                                    >
                                        Offers
                                    </TranslatedText>
                                    <TranslatedText
                                        style={{
                                            color: Colors.light.placeholderColorOp70,
                                            fontSize: width * 0.03
                                        }}
                                    >
                                        Contact for all queries
                                    </TranslatedText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* =================== OTHERS SECTION =================== */}
                    <TranslatedText
                        style={{
                            color: Colors.light.whiteFefefe,
                            fontSize: width * 0.05,
                            margin: width * 0.05
                        }}
                        className="font-medium"
                    >
                        Others
                    </TranslatedText>

                    <View style={{ marginHorizontal: width * 0.03 }}>






                        {/* =================== TDS CERTIFICATE CARD =================== */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                                borderLeftWidth: 4,
                                borderRadius: 12,
                                padding: width * 0.03,
                                marginVertical: height * 0.015,
                                width: '100%'
                            }}
                        >
                            <TouchableOpacity className="flex-row items-center"
                                onPress={() => navigation.navigate('TdsSummary')} >
                                {/* Card icon */}
                                <View
                                    style={{
                                        backgroundColor: Colors.light.whiteFfffff,
                                        marginRight: width * 0.02,
                                        width: width * 0.1,
                                        height: width * 0.1,
                                        borderRadius: 8
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Image
                                        source={icons.duedateicon}
                                        style={{
                                            height: width * 0.07,
                                            width: width * 0.07
                                        }}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Card content */}
                                <View className="flex-1 flex-row justify-between items-center">
                                    <View
                                        className="flex-1"
                                        style={{ paddingLeft: width * 0.03 }}
                                    >
                                        <TranslatedText
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.045,
                                                marginBottom: height * 0.005
                                            }}
                                            className="font-medium"
                                        >
                                            TDS Summary
                                        </TranslatedText>
                                        <TranslatedText
                                            style={{
                                                color: Colors.light.placeholderColorOp70,
                                                fontSize: width * 0.035
                                            }}
                                        >
                                            You can download your TDS certificate
                                        </TranslatedText>
                                    </View>

                                    {/* Navigation arrow */}
                                    <TouchableOpacity>
                                        <Image
                                            source={icons.go}
                                            style={{
                                                width: width * 0.03,
                                                height: width * 0.03
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>



                        {/* =================== FIXED LOGOUT BUTTON =================== */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.bgBlueBtn,
                                opacity: isLoggingOut ? 0.6 : 1,
                                height: height * 0.055,
                                marginVertical: height * 0.025,
                                borderRadius: 12
                            }}
                            className="flex items-center justify-center flex-row"
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <Image
                                source={icons.logout}
                                style={{
                                    height: width * 0.05,
                                    width: width * 0.05,
                                    marginHorizontal: width * 0.02,
                                    opacity: isLoggingOut ? 0.7 : 1
                                }}
                            />
                            <TranslatedText
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05,
                                    paddingHorizontal: width * 0.02
                                }}
                                className="font-bold"
                            >
                                {isLoggingOut ? (currentLanguage === 'hi' ? 'लॉगआउट हो रहा है...' : 'Logging out...') : 'Logout'}
                            </TranslatedText>
                        </TouchableOpacity>

                        {/* =================== FIXED DELETE ACCOUNT BUTTON =================== */}
                        
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default WalletPage;