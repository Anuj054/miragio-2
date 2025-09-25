import React from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Alert,
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

// Navigation types
type NavigationProp = any;

const WalletPage = () => {
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
                'https://netinnovatus.tech/miragio_task/api/api.php',
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

    
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const handleDeleteAccountPress = async () => {
        if (isDeletingAccount) return;

        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeletingAccount(true);
                        try {
                            const userId = getUserId && getUserId();
                            if (!userId) {
                                Alert.alert("Error", "User ID not found.");
                                setIsDeletingAccount(false);
                                return;
                            }
                            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    action: 'delete_user',
                                    id: userId,
                                }),
                            });
                            const data = await response.json();
                            if (data.status === "success") {
                                Alert.alert(
                                    "Account Deleted",
                                    "Your account has been deleted.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: async () => {
                                                // Log out the user after deletion
                                                Alert.alert("Account Deleted", "Your account has been deleted. Contact admin for more information.");
                                                await handleLogout();
                                            }
                                        }
                                    ]
                                );
                            } else {
                                Alert.alert("Error", data.message || "Failed to delete account.");
                            }
                        } catch (error) {
                            console.error('Delete account error:', error);
                            Alert.alert("Error", "An error occurred while deleting your account.");
                        } finally {
                            setIsDeletingAccount(false);
                        }
                    }
                }
            ]
        );
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
            <View className="relative h-32">
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header overlay content with navigation and profile */}
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
                            Wallet
                        </Text>

                        {/* Profile photo */}
                        <TouchableOpacity
                            onPress={handleProfilePress}
                            style={{ backgroundColor: Colors.light.whiteFfffff }}
                            className="w-11 h-11 rounded-full items-center justify-center"
                        >
                            <Image
                                source={profilephoto}
                                className="h-11 w-11 rounded-full"
                            />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </View>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* =================== WALLET BALANCE CARD SECTION =================== */}
                <View className="relative">
                    {/* Wallet background image */}
                    <Image
                        source={wallet2}
                        className=" w-full h-[300px]"
                        resizeMode="cover"
                    />

                    {/* Balance overlay content */}
                    <View className="absolute px-5 py-5">
                        {/* Total balance title */}
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="font-semibold text-2xl"
                        >
                            Total Balance
                        </Text>

                        {/* Balance amount with coin icon */}
                        <View className="flex-row items-center pt-2">
                            <Image source={icons.maincoin} className="w-10 h-10" />
                            <Text
                                style={{ color: Colors.light.whiteFfffff }}
                                className="font-extrabold text-xl ml-2"
                            >
                                {loading ? 'Loading...' : walletBalance}
                            </Text>
                            {/* Refresh button */}
                            <TouchableOpacity
                                onPress={refreshBalance}
                                className="ml-3 p-1"
                                disabled={loading}
                            >
                                <Image
                                    source={icons.go}
                                    className="w-5 h-5"
                                    style={{
                                        opacity: loading ? 0.5 : 1,
                                        transform: [{ rotate: loading ? '180deg' : '0deg' }],
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Account balance and transactions link */}
                        <View className="flex-row justify-between w-full mt-2">
                            <Text
                                style={{ color: Colors.light.placeholderColorOp70 }}
                                className="pt-2"
                            >
                                Account Balance
                            </Text>

                            {/* My transactions navigation link */}
                            <TouchableOpacity
                                className="flex-row items-center pt-2"
                                onPress={handleTransactionsPress}
                            >
                                <Text style={{ color: Colors.light.whiteFefefe }}>
                                    My Transactions
                                </Text>
                                <Image source={icons.go} className="h-3.5 w-3.5 ml-3" />
                            </TouchableOpacity>
                        </View>

                        {/* =================== COMPACT WITHDRAW SECTION =================== */}
                        <View
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                borderWidth: 1,
                            }}
                            className="w-full mt-3 rounded-[12px] p-3"
                        >
                            {/* Header with status */}
                            <View className="flex flex-row justify-between items-center mb-3">
                                <Text
                                    style={{ color: Colors.light.whiteFfffff }}
                                    className="text-sm font-medium"
                                >
                                    Available for Withdrawal
                                </Text>
                            </View>

                            {/* Compact balance and button row */}
                            <View className="flex flex-row justify-between items-center">
                                {/* Withdrawable balance display */}
                                <View className="flex flex-row items-center flex-1">
                                    <Image
                                        source={icons.maincoin}
                                        className="h-[25px] w-[25px] mr-2"
                                    />
                                    <View>
                                        <Text
                                            className="text-lg font-bold"
                                            style={{ color: Colors.light.whiteFefefe }}
                                        >
                                            {loading ? '...' : withdrawableBalance}
                                        </Text>
                                        <Text
                                            style={{ color: Colors.light.placeholderColorOp70 }}
                                            className="text-xs"
                                        >
                                            Withdrawable
                                        </Text>
                                    </View>
                                </View>

                                {/* Compact withdraw button */}
                                <TouchableOpacity
                                    className="items-center justify-center flex flex-row px-5 py-2"
                                    style={{
                                        backgroundColor:
                                            parseFloat(withdrawableBalance) >= 100
                                                ? Colors.light.bgGreen
                                                : 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: 12,
                                        minWidth: 120,
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
                                        className="w-[18px] h-[18px] mr-2"
                                        style={{
                                            opacity: parseFloat(withdrawableBalance) >= 100 ? 1 : 0.5,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color:
                                                parseFloat(withdrawableBalance) >= 100
                                                    ? Colors.light.whiteFefefe
                                                    : 'rgba(255, 255, 255, 0.5)',
                                        }}
                                        className="font-semibold text-base"
                                    >
                                        WITHDRAW
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Compact progress bar and info */}
                            <View className="mt-3">
                                <View
                                    className="h-0.5 rounded-full mb-1"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <View
                                        className="h-0.5 rounded-full"
                                        style={{
                                            backgroundColor: Colors.light.bgGreen,
                                            width: `${Math.min(
                                                (parseFloat(withdrawableBalance) / 100) * 100,
                                                100,
                                            )}%`,
                                        }}
                                    />
                                </View>
                                <Text
                                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                    className="text-xs"
                                >
                                    {parseFloat(withdrawableBalance) >= 100
                                        ? 'Ready to withdraw • Min: 100 coins'
                                        : `Need ${100 - parseFloat(withdrawableBalance)
                                        } more coins • Min: 100`}
                                </Text>
                            </View>
                        </View>

                        {/* =================== CONVERSION RATE INFO =================== */}
                        <View className="mt-3 flex-row items-center justify-center">
                            <View className="flex-row items-center">
                                <Image source={icons.maincoin} className="w-4 h-4 mr-1" />
                                <Text
                                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                    className="text-sm font-medium"
                                >
                                    10 = ₹1
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* =================== MAIN CONTENT SECTION =================== */}
                <View
                    style={{ backgroundColor: Colors.light.blackPrimary }}
                    className="min-h-screen"
                >
                    <View className="px-5 pt-8 items-center">
                        {/* =================== QUICK ACCESS GRID ROW 1 =================== */}
                        <View className="flex-row items-center justify-between my-3">
                            {/* FAQs card */}
                            <View
                                style={{ backgroundColor: Colors.light.backlight2 }}
                                className="h-[70px] w-[180px] rounded-xl flex-row items-center mx-3"
                            >
                                <View
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                    className="w-10 h-10 ml-3 rounded-md items-center justify-center"
                                >
                                    <Image source={icons.faq} className="w-[27px] h-[27px]" />
                                </View>
                                <View className="mx-3 flex-1">
                                    <Text
                                        style={{ color: Colors.light.secondaryText }}
                                        className="font-medium"
                                    >
                                        FAQs
                                    </Text>
                                    <Text
                                        style={{ color: Colors.light.placeholderColorOp70 }}
                                        className="text-sm "
                                    >
                                        Contact for all queries
                                    </Text>
                                </View>
                            </View>

                            {/* Offers card */}
                            <View
                                style={{ backgroundColor: Colors.light.backlight2 }}
                                className="h-[70px] w-[180px] rounded-xl flex-row items-center mx-3"
                            >
                                <View
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                    className="w-10 h-10 ml-3 rounded-md items-center justify-center"
                                >
                                    <Image source={icons.offers} className="w-7 h-7" />
                                </View>
                                <View className="mx-3 flex-1">
                                    <Text
                                        style={{ color: Colors.light.secondaryText }}
                                        className="font-medium"
                                    >
                                        Offers
                                    </Text>
                                    <Text
                                        style={{ color: Colors.light.placeholderColorOp70 }}
                                        className="text-sm"
                                    >
                                        Contact for all queries
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* =================== OTHERS SECTION =================== */}
                    <Text
                        className="text-xl m-5 font-medium"
                        style={{ color: Colors.light.whiteFefefe }}
                    >
                        Others
                    </Text>

                    <View className="mx-3">
                        {/* =================== ALL-IN-CLUB CARD =================== */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                            }}
                            className="w-full rounded-xl p-3 border-l-2 my-3"
                        >
                            <View className="flex-row items-center">
                                {/* Card icon */}
                                <View
                                    className="mr-2 w-10 h-10 rounded-md items-center justify-center"
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                >
                                    <Image
                                        source={icons.duedateicon}
                                        className="h-7 w-7"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Card content */}
                                <View className="flex-1 flex-row justify-between items-center">
                                    <View className="flex-1 pl-3">
                                        <Text
                                            style={{ color: Colors.light.whiteFefefe }}
                                            className="text-lg font-medium mb-1"
                                        >
                                            All-in-Club
                                        </Text>
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                            Feel the Privilege
                                        </Text>
                                    </View>

                                    {/* Navigation arrow */}
                                    <TouchableOpacity>
                                        <Image source={icons.go} className="w-3 h-3" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* =================== COINS ENQUIRY CARD =================== */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                            }}
                            className="w-full rounded-xl p-3 border-l-2 my-3"
                        >
                            <View className="flex-row items-center">
                                {/* Card icon */}
                                <View
                                    className="mr-2 w-10 h-10 rounded-md items-center justify-center"
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                >
                                    <Image
                                        source={icons.duedateicon}
                                        className="h-7 w-7"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Card content */}
                                <View className="flex-1 flex-row justify-between items-center">
                                    <View className="flex-1 pl-3">
                                        <Text
                                            style={{ color: Colors.light.whiteFefefe }}
                                            className="text-lg font-medium mb-1"
                                        >
                                            Coins Enquiry
                                        </Text>
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                            Keep track of your coins
                                        </Text>
                                    </View>

                                    {/* Navigation arrow */}
                                    <TouchableOpacity>
                                        <Image source={icons.go} className="w-3 h-3" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* =================== RESPONSIBLE GAMING CARD =================== */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                            }}
                            className="w-full rounded-xl p-3 border-l-2 my-3"
                        >
                            <View className="flex-row items-center">
                                {/* Card icon */}
                                <View
                                    className="mr-2 w-10 h-10 rounded-md items-center justify-center"
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                >
                                    <Image
                                        source={icons.duedateicon}
                                        className="h-7 w-7"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Card content */}
                                <View className="flex-1 flex-row justify-between items-center">
                                    <View className="flex-1 pl-3">
                                        <Text
                                            style={{ color: Colors.light.whiteFefefe }}
                                            className="text-lg font-medium mb-1"
                                        >
                                            Responsible Gaming
                                        </Text>
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                            Deposit limits & game restrictions
                                        </Text>
                                    </View>

                                    {/* Navigation arrow */}
                                    <TouchableOpacity>
                                        <Image source={icons.go} className="w-3 h-3" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* =================== TDS CERTIFICATE CARD =================== */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                            }}
                            className="w-full rounded-xl p-3 border-l-2 my-3"
                        >
                            <View className="flex-row items-center">
                                {/* Card icon */}
                                <View
                                    className="mr-2 w-10 h-10 rounded-md items-center justify-center"
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                >
                                    <Image
                                        source={icons.duedateicon}
                                        className="h-7 w-7"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Card content */}
                                <View className="flex-1 flex-row justify-between items-center">
                                    <View className="flex-1 pl-3">
                                        <Text
                                            style={{ color: Colors.light.whiteFefefe }}
                                            className="text-lg font-medium mb-1"
                                        >
                                            TDS Certificate Download
                                        </Text>
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                            You can download your TDS certificate
                                        </Text>
                                    </View>

                                    {/* Navigation arrow */}
                                    <TouchableOpacity>
                                        <Image source={icons.go} className="w-3 h-3" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* =================== REDEEM GIFT CARD =================== */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                            }}
                            className="w-full rounded-xl p-3 border-l-2 my-3"
                        >
                            <View className="flex-row items-center">
                                {/* Card icon */}
                                <View
                                    className="mr-2 w-10 h-10 rounded-md items-center justify-center"
                                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                                >
                                    <Image
                                        source={icons.duedateicon}
                                        className="h-7 w-7"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Card content */}
                                <View className="flex-1 flex-row justify-between items-center">
                                    <View className="flex-1 pl-3">
                                        <Text
                                            style={{ color: Colors.light.whiteFefefe }}
                                            className="text-lg font-medium mb-1"
                                        >
                                            Redeem Gift Card
                                        </Text>
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                            Enter gift card or coupon code
                                        </Text>
                                    </View>

                                    {/* Navigation arrow */}
                                    <TouchableOpacity>
                                        <Image source={icons.go} className="w-3 h-3" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* =================== FIXED LOGOUT BUTTON =================== */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.bgBlueBtn,
                                opacity: isLoggingOut ? 0.6 : 1,
                            }}
                            className="flex items-center justify-center h-[52px] my-5 rounded-xl flex-row"
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <Image
                                source={icons.logout}
                                className="h-5 w-5 mx-2"
                                style={{ opacity: isLoggingOut ? 0.7 : 1 }}
                            />
                            <Text
                                style={{ color: Colors.light.whiteFefefe }}
                                className="text-xl font-bold px-2"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </Text>
                        </TouchableOpacity>

                        {/* =================== FIXED DELETE ACCOUNT BUTTON =================== */}
                        <TouchableOpacity
                            style={{ backgroundColor: Colors.light.bgBlueBtn }}
                            className="flex items-center justify-center h-[52px] my-5 rounded-xl flex-row"
                            onPress={handleDeleteAccountPress}
                        >
                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-bold px-2">Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default WalletPage;
