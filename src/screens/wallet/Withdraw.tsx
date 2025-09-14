import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import { Colors } from "../../constants/Colors";
import CustomGradientButton from "../../components/CustomGradientButton";
import { useUser } from "../../context/UserContext";
import PaymentMethodModal from "../../components/PaymentMethodModal";
import WithdrawalSuccessModal from "../../components/WithdrawlSuccessModal";

// Navigation types
type NavigationProp = any;

interface WithdrawalMethod {
    id: string;
    name: string;
    icon: string;
    details: string;
    verified: boolean;
    type: 'upi' | 'bank';
}

interface UserDetails {
    upiId: string;
    bankAccount: string;
    panNumber: string;
    wallet: string;
}

const WithdrawAmountPage = () => {
    const [amount, setAmount] = useState<string>("");
    const [selectedMethod, setSelectedMethod] = useState<string>("");
    const [coinValue, setCoinValue] = useState<number>(0.1);
    const [userBalance, setUserBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([]);
    const [, setPanVerified] = useState<boolean>(false);
    const [, setUserDetails] = useState<UserDetails | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [transactionData, setTransactionData] = useState<{
        transaction_id: string;
        amount: string;
        coins: string;
        status: string;
        payment_method: string;
    } | null>(null);

    // Error states
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Navigation for React Native CLI
    const navigation = useNavigation<NavigationProp>();

    // Get user context
    const { user, getUserId, isLoggedIn, refreshUserData, updateUserData } = useUser();

    // Predefined quick amounts (in coins)
    const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

    // Minimum withdrawal amount
    const minWithdrawal = 100;

    // Navigation handlers
    const handleBackPress = () => {
        navigation.goBack();
    };

    // Function to fetch payment methods from API
    const fetchPaymentMethods = async (userId: string) => {
        try {
            const methods: WithdrawalMethod[] = [];

            // Fetch UPI details
            const upiResponse = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "get_upi"
                }),
            });

            const upiData = await upiResponse.json();

            if (upiData.status === "success" && upiData.data) {
                const userUpiData = upiData.data.filter((item: any) =>
                    item.user_id === userId && item.upi && item.upi.trim() !== ""
                );

                userUpiData.forEach((upiItem: any) => {
                    methods.push({
                        id: `upi_${upiItem.id}`,
                        name: "UPI",
                        icon: "💰",
                        details: upiItem.upi,
                        verified: true,
                        type: 'upi'
                    });
                });
            }

            // Fetch Bank details
            const bankResponse = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "get_BankDetail"
                }),
            });

            const bankData = await bankResponse.json();

            if (bankData.status === "success" && bankData.data) {
                const userBankData = bankData.data.filter((item: any) =>
                    item.user_id === userId &&
                    item.account_number &&
                    item.account_number.trim() !== "" &&
                    item.bank_name &&
                    item.bank_name.trim() !== ""
                );

                userBankData.forEach((bankItem: any) => {
                    const accountNumber = bankItem.account_number || "";
                    const maskedAccount = accountNumber.length > 4
                        ? `****${accountNumber.slice(-4)}`
                        : accountNumber;

                    methods.push({
                        id: `bank_${bankItem.id}`,
                        name: "Online Banking",
                        icon: "🏦",
                        details: `${bankItem.bank_name} - ${maskedAccount}`,
                        verified: bankItem.pan_number ? true : false,
                        type: 'bank'
                    });
                });
            }

            setWithdrawalMethods(methods);

        } catch (error) {
            console.error("Error fetching payment methods:", error);
            setErrorMessage("Failed to load payment methods. Please try again.");
        }
    };

    // Function to fetch user details and wallet balance
    const fetchUserData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const userId = getUserId();

            if (!userId) {
                console.error("No user ID found. User might not be logged in.");
                navigation.replace("Welcome");
                return;
            }

            setCoinValue(0.1);

            const userResponse = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "get_userdetails",
                    id: userId
                }),
            });

            const userData = await userResponse.json();
            if (userData.status === "success") {
                const user = userData.data;
                setUserDetails(user);
                setUserBalance(parseFloat(user.wallet || "0"));
                setPanVerified(user.pan_verified || false);
                await refreshUserData();
            } else {
                console.error("Failed to fetch user details:", userData.message);
                setErrorMessage("Failed to load user data. Please refresh and try again.");
            }

            await fetchPaymentMethods(userId);

        } catch (error) {
            console.error("Error fetching user data:", error);
            setErrorMessage("Failed to load user data. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && getUserId()) {
            fetchUserData();
        } else {
            navigation.replace("Welcome");
        }
    }, [isLoggedIn, user?.id]);

    useFocusEffect(
        useCallback(() => {
            if (isLoggedIn && getUserId()) {
                fetchUserData();
            }
        }, [isLoggedIn, user?.id])
    );

    const refreshBalance = () => {
        fetchUserData();
    };

    const handleQuickAmount = (quickAmount: number) => {
        if (quickAmount <= userBalance) {
            setAmount(quickAmount.toString());
            setErrorMessage("");
        } else {
            setErrorMessage(`You don't have enough coins. Available: ${userBalance} coins`);
        }
    };

    const handleWithdraw = () => {
        setErrorMessage("");

        if (!amount || parseFloat(amount) <= 0) {
            setErrorMessage("Please enter a valid withdrawal amount");
            return;
        }

        if (parseFloat(amount) < minWithdrawal) {
            setErrorMessage(`Minimum withdrawal amount is ${minWithdrawal} coins (₹${(minWithdrawal * coinValue).toFixed(2)})`);
            return;
        }

        if (parseFloat(amount) > userBalance) {
            setErrorMessage(`You don't have enough coins. Available: ${userBalance} coins`);
            return;
        }

        if (!selectedMethod) {
            setErrorMessage("Please select a withdrawal method");
            return;
        }

        const selectedMethodData = withdrawalMethods.find(m => m.id === selectedMethod);

        if (!selectedMethodData?.verified) {
            setErrorMessage("Please verify your payment method to proceed with withdrawal");
            setShowPaymentModal(true);
            return;
        }

        const totalAmountINR = (parseFloat(amount) * coinValue).toFixed(2);
        // Pass coins as first parameter, method as second, INR amount as third
        processWithdrawal(amount, selectedMethod, totalAmountINR);
    };


    const processWithdrawal = async (coins: string, method: string, amount: string) => {
        try {
            setLoading(true);
            setErrorMessage("");

            const selectedMethodData = withdrawalMethods.find(m => m.id === method);

            let paymentMethodString = "";
            if (selectedMethodData?.type === 'upi') {
                paymentMethodString = "upi";
            } else if (selectedMethodData?.type === 'bank') {
                paymentMethodString = "bank_transfer";
            }

            // Send the number of coins instead of INR amount
            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "addWithdrawal",
                    user_id: getUserId() || "0",
                    withdraw_amount: coins, // Send coins instead of INR amount
                    payment_method: paymentMethodString,
                    remarks: `Withdrawal of ${coins} Miragio Coins (₹${amount}) via ${selectedMethodData?.name || 'Unknown Method'}`
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                const newBalance = userBalance - parseFloat(coins);
                setUserBalance(newBalance);
                updateUserData({ wallet: newBalance.toString() });

                setTransactionData({
                    transaction_id: data.message.transaction_id,
                    amount: amount, // INR amount for display
                    coins: coins,   // Number of coins for display
                    status: data.message.status,
                    payment_method: paymentMethodString
                });

                setAmount("");
                setSelectedMethod("");
                setShowSuccessModal(true);
            } else {
                setErrorMessage(data.message || "Failed to create withdrawal request. Please try again.");
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            setErrorMessage("Failed to process withdrawal request. Please check your internet connection and try again.");
        } finally {
            setLoading(false);
        }
    };


    const formatAmount = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            return parts[0] + '.' + parts.slice(1).join('');
        }
        return numericValue;
    };

    const handleAddPaymentMethod = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentMethodSuccess = () => {
        fetchUserData();
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setTransactionData(null);
        navigation.goBack();
    };

    if (loading && !userBalance) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-lg">
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            {/* Header */}
            <View className="relative h-32">
                <Image source={bg2} resizeMode="cover" className="w-full h-full absolute" />
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

                        {/* Centered title - Use flex-1 and center alignment */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{ color: Colors.light.whiteFfffff }}
                                className="text-3xl font-medium pt-1"
                            >
                                Withdraw
                            </Text>
                        </View>

                        {/* Right spacer to balance the back button */}
                        <View className="w-10 h-10" />
                    </View>
                </View>

                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </View>


            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
            >
                {/* Error Message */}
                {errorMessage ? (
                    <View
                        className="mt-4 rounded-lg p-3 mb-4"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                        <Text className="text-red-400 text-sm leading-5">
                            ⚠️ {errorMessage}
                        </Text>
                    </View>
                ) : null}

                {/* Balance Info */}
                <View className="mt-4 rounded-lg p-3 mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-base font-medium">
                            Available Balance
                        </Text>
                        <TouchableOpacity
                            onPress={refreshBalance}
                            className="p-1"
                            disabled={loading}
                        >
                            <Image
                                source={icons.go}
                                className="w-[16px] h-[16px]"
                                style={{
                                    opacity: loading ? 0.5 : 1,
                                    transform: [{ rotate: loading ? '180deg' : '0deg' }]
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                        <Image source={icons.maincoin} className="w-[20px] h-[20px] mr-2" />
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-xl font-bold">
                            {loading ? "Loading..." : userBalance.toLocaleString()} Coins
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-xs mt-1">
                        ≈ ₹{loading ? "..." : (userBalance * coinValue).toFixed(2)} INR
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                        Rate: 10 Coins = ₹1
                    </Text>
                </View>

                {/* Amount Input */}
                <View className="mt-2">
                    <Text style={{ color: Colors.light.whiteFfffff }} className="text-lg font-medium mb-3">
                        Enter Withdrawal Amount
                    </Text>

                    <View className="bg-gray-800 rounded-lg p-3 mb-4">
                        <View className="flex-row items-center">
                            <Image source={icons.maincoin} className="w-[24px] h-[24px] mr-2" />
                            <TextInput
                                value={amount}
                                onChangeText={(text) => {
                                    const formatted = formatAmount(text);
                                    if (parseFloat(formatted) <= userBalance || formatted === "") {
                                        setAmount(formatted);
                                        if (errorMessage) setErrorMessage("");
                                    }
                                }}
                                placeholder="0"
                                placeholderTextColor="#666"
                                style={{ color: Colors.light.whiteFfffff, fontSize: 20 }}
                                className="font-bold flex-1"
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-base ml-2">
                                Coins
                            </Text>
                        </View>
                        {amount && parseFloat(amount) > 0 && (
                            <Text className="text-gray-400 text-xs mt-2">
                                ≈ ₹{(parseFloat(amount) * coinValue).toFixed(2)} INR
                            </Text>
                        )}
                        <Text className="text-yellow-500 text-xs mt-2">
                            Minimum withdrawal: {minWithdrawal} coins (₹{(minWithdrawal * coinValue).toFixed(2)})
                        </Text>
                    </View>

                    {/* Quick Amount Buttons */}
                    <Text style={{ color: Colors.light.whiteFfffff }} className="text-base font-medium mb-2">
                        Quick Amount
                    </Text>
                    <View className="flex-row flex-wrap justify-between mb-6">
                        {quickAmounts.map((quickAmount) => (
                            <TouchableOpacity
                                key={quickAmount}
                                onPress={() => handleQuickAmount(quickAmount)}
                                disabled={quickAmount > userBalance}
                                className={`bg-gray-800 rounded-md px-2 py-2 mb-2 flex-row items-center justify-center ${amount === quickAmount.toString() ? 'border border-blue-500' : ''
                                    } ${quickAmount > userBalance ? 'opacity-50' : ''}`}
                                style={{ width: '30%' }}
                            >
                                <Image source={icons.maincoin} className="w-[12px] h-[12px] mr-1" />
                                <View className="items-center">
                                    <Text style={{ color: Colors.light.whiteFfffff }} className="text-center font-medium text-xs">
                                        {quickAmount}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Withdrawal Methods */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-lg font-medium">
                            Withdrawal Method
                        </Text>
                        <TouchableOpacity onPress={handleAddPaymentMethod}>
                            <Text className="text-blue-500 text-xs font-medium">
                                + Add Method
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {withdrawalMethods.length === 0 ? (
                        <View className="bg-gray-800 rounded-lg p-4 items-center">
                            <Text className="text-4xl mb-3">🏦</Text>
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-base font-medium mb-2">
                                No Payment Methods
                            </Text>
                            <Text className="text-gray-400 text-center text-xs mb-3">
                                Add a UPI ID or bank account to withdraw your earnings
                            </Text>
                            <TouchableOpacity
                                onPress={handleAddPaymentMethod}
                                className="bg-blue-600 rounded-md px-4 py-2"
                            >
                                <Text style={{ color: Colors.light.whiteFfffff }} className="font-medium text-sm">
                                    Add Payment Method
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        withdrawalMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                onPress={() => {
                                    if (method.verified) {
                                        setSelectedMethod(method.id);
                                        if (errorMessage) setErrorMessage("");
                                    } else {
                                        setErrorMessage(`Please verify your ${method.type === 'bank' ? 'PAN number' : 'payment method'} to use this withdrawal method`);
                                        setShowPaymentModal(true);
                                    }
                                }}
                                disabled={!method.verified}
                                className={`bg-gray-800 rounded-lg p-3 mb-2 flex-row items-center justify-between ${selectedMethod === method.id && method.verified ? 'border border-blue-500' : ''
                                    } ${!method.verified ? 'opacity-60' : ''}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-lg mr-3">{method.icon}</Text>
                                    <View className="flex-1">
                                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-base font-medium">
                                            {method.name}
                                        </Text>
                                        <Text className={`text-xs ${method.verified ? 'text-gray-400' : 'text-red-400'}`}>
                                            {method.verified ? method.details : 'Verification required'}
                                        </Text>
                                        {!method.verified && (
                                            <Text className="text-red-400 text-xs mt-1">
                                                {method.type === "bank" ? "Verify PAN to enable" : "Verification required"}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View className={`w-5 h-5 rounded-full border ${selectedMethod === method.id && method.verified
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-400'
                                    } flex items-center justify-center`}>
                                    {selectedMethod === method.id && method.verified && (
                                        <View className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Withdrawal Summary */}
                {amount && parseFloat(amount) > 0 && (
                    <View className="bg-gray-800 rounded-lg p-3 mb-6">
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-base font-medium mb-2">
                            Withdrawal Summary
                        </Text>
                        <View className="flex-row justify-between mb-1">
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm">
                                Coins to withdraw:
                            </Text>
                            <View className="flex-row items-center">
                                <Image source={icons.maincoin} className="w-[16px] h-[16px] mr-1" />
                                <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium">
                                    {amount}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row justify-between mb-1">
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm">
                                Rate:
                            </Text>
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm">
                                10 Coins = ₹1
                            </Text>
                        </View>
                        <View className="flex-row justify-between mb-1">
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm">
                                Processing Fee:
                            </Text>
                            <Text className="text-green-500 text-sm">
                                Free
                            </Text>
                        </View>
                        <View className="border-t border-gray-600 pt-2 mt-2">
                            <View className="flex-row justify-between">
                                <Text style={{ color: Colors.light.whiteFfffff }} className="text-base font-bold">
                                    You will receive:
                                </Text>
                                <Text className="text-green-500 text-base font-bold">
                                    ₹{(parseFloat(amount) * coinValue).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Withdraw Button */}
                <View className="items-center mb-4">
                    <CustomGradientButton
                        borderRadius={12}
                        height={48}
                        width={350}
                        text={`WITHDRAW ${amount || '0'} COINS`}
                        onPress={handleWithdraw}
                        disabled={
                            !amount ||
                            parseFloat(amount) <= 0 ||
                            parseFloat(amount) < minWithdrawal ||
                            parseFloat(amount) > userBalance ||
                            !selectedMethod ||
                            loading ||
                            withdrawalMethods.length === 0
                        }
                        style={{
                            opacity: (
                                !amount ||
                                parseFloat(amount) <= 0 ||
                                parseFloat(amount) < minWithdrawal ||
                                parseFloat(amount) > userBalance ||
                                !selectedMethod ||
                                loading ||
                                withdrawalMethods.length === 0
                            ) ? 0.5 : 1
                        }}
                    />
                </View>

                {/* Info Sections */}
                <View className="mt-4 bg-gray-800 rounded-lg p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                        <Text className="text-blue-500 text-base mr-2">ℹ️</Text>
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium">
                            Withdrawal Information
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-xs leading-4 mb-1">
                        • Withdrawals are processed within 24-48 hours
                    </Text>
                    <Text className="text-gray-400 text-xs leading-4 mb-1">
                        • Minimum withdrawal amount: {minWithdrawal} coins (₹{(minWithdrawal * coinValue).toFixed(2)})
                    </Text>
                    <Text className="text-gray-400 text-xs leading-4 mb-1">
                        • PAN verification required for bank transfers
                    </Text>
                    <Text className="text-gray-400 text-xs leading-4">
                        • No processing fees on withdrawals
                    </Text>
                </View>

                <View className="bg-gray-800 rounded-lg p-3">
                    <View className="flex-row items-center mb-2">
                        <Text className="text-green-500 text-base mr-2">🔒</Text>
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-sm font-medium">
                            Secure Withdrawal
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-xs leading-4">
                        All withdrawals are processed securely through encrypted channels.
                        Your financial information is protected and never stored on our servers.
                        Current rate: 10 Miragio Coins = ₹1
                    </Text>
                </View>
            </ScrollView>

            <PaymentMethodModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentMethodSuccess}
                userId={getUserId() || ""}
            />

            <WithdrawalSuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessModalClose}
                transactionData={transactionData}
            />
        </View>
    );
};

export default WithdrawAmountPage;
