import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
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

// Get screen dimensions
const { width, height } = Dimensions.get('window');

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

            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "addWithdrawal",
                    user_id: getUserId() || "0",
                    withdraw_amount: coins,
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
                    amount: amount,
                    coins: coins,
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
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: Colors.light.blackPrimary }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.045
                    }}
                >
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />
                <View
                    className="flex-1"
                    style={{
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04
                    }}
                >
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

                        {/* Centered title */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.075
                                }}
                                className="font-medium"
                            >
                                Withdraw
                            </Text>
                        </View>

                        {/* Right spacer */}
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>

                <View
                    className="absolute bottom-0 w-full"
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        height: 1
                    }}
                />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: height * 0.12,
                    paddingHorizontal: width * 0.05
                }}
            >
                {/* Error Message */}
                {errorMessage ? (
                    <View
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            borderRadius: 8,
                            padding: width * 0.03,
                            marginTop: height * 0.02,
                            marginBottom: height * 0.02
                        }}
                    >
                        <Text
                            style={{
                                color: '#EF4444',
                                fontSize: width * 0.035,
                                lineHeight: width * 0.05
                            }}
                        >
                            ⚠️ {errorMessage}
                        </Text>
                    </View>
                ) : null}

                {/* Balance Info */}
                <View
                    style={{
                        borderRadius: 8,
                        padding: width * 0.03,
                        marginTop: height * 0.02,
                        marginBottom: height * 0.02
                    }}
                >
                    <View
                        className="flex-row items-center justify-between"
                        style={{ marginBottom: height * 0.01 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04
                            }}
                            className="font-medium"
                        >
                            Available Balance
                        </Text>
                        <TouchableOpacity
                            onPress={refreshBalance}
                            style={{ padding: width * 0.01 }}
                            disabled={loading}
                        >
                            <Image
                                source={icons.go}
                                style={{
                                    width: width * 0.04,
                                    height: width * 0.04,
                                    opacity: loading ? 0.5 : 1,
                                    transform: [{ rotate: loading ? '180deg' : '0deg' }]
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                        <Image
                            source={icons.maincoin}
                            style={{
                                width: width * 0.05,
                                height: width * 0.05,
                                marginRight: width * 0.02
                            }}
                        />
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.05
                            }}
                            className="font-bold"
                        >
                            {loading ? "Loading..." : userBalance.toLocaleString()} Coins
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            marginTop: height * 0.005
                        }}
                    >
                        ≈ ₹{loading ? "..." : (userBalance * coinValue).toFixed(2)} INR
                    </Text>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            marginTop: height * 0.005
                        }}
                    >
                        Rate: 10 Coins = ₹1
                    </Text>
                </View>

                {/* Amount Input */}
                <View style={{ marginTop: height * 0.01 }}>
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.045,
                            marginBottom: height * 0.015
                        }}
                        className="font-medium"
                    >
                        Enter Withdrawal Amount
                    </Text>

                    <View
                        className="bg-gray-800 rounded-lg"
                        style={{
                            padding: width * 0.03,
                            marginBottom: height * 0.02
                        }}
                    >
                        <View className="flex-row items-center">
                            <Image
                                source={icons.maincoin}
                                style={{
                                    width: width * 0.06,
                                    height: width * 0.06,
                                    marginRight: width * 0.02
                                }}
                            />
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
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.05,
                                    flex: 1
                                }}
                                className="font-bold"
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.04,
                                    marginLeft: width * 0.02
                                }}
                            >
                                Coins
                            </Text>
                        </View>
                        {amount && parseFloat(amount) > 0 && (
                            <Text
                                style={{
                                    color: '#9CA3AF',
                                    fontSize: width * 0.03,
                                    marginTop: height * 0.01
                                }}
                            >
                                ≈ ₹{(parseFloat(amount) * coinValue).toFixed(2)} INR
                            </Text>
                        )}
                        <Text
                            style={{
                                color: '#F59E0B',
                                fontSize: width * 0.03,
                                marginTop: height * 0.01
                            }}
                        >
                            Minimum withdrawal: {minWithdrawal} coins (₹{(minWithdrawal * coinValue).toFixed(2)})
                        </Text>
                    </View>

                    {/* Quick Amount Buttons */}
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.04,
                            marginBottom: height * 0.01
                        }}
                        className="font-medium"
                    >Quick Amount
                    </Text>
                    <View
                        className="flex-row flex-wrap justify-between"
                        style={{ marginBottom: height * 0.03 }}
                    >
                        {quickAmounts.map((quickAmount) => (
                            <TouchableOpacity
                                key={quickAmount}
                                onPress={() => handleQuickAmount(quickAmount)}
                                disabled={quickAmount > userBalance}
                                style={{

                                    borderRadius: 8,
                                    paddingHorizontal: width * 0.02,
                                    paddingVertical: height * 0.01,
                                    marginBottom: height * 0.01,
                                    width: '30%',
                                    borderWidth: amount === quickAmount.toString() ? 1 : 0,
                                    borderColor: amount === quickAmount.toString() ? '#3B82F6' : 'transparent',
                                    opacity: quickAmount > userBalance ? 0.5 : 1
                                }}
                                className="flex-row items-center justify-center bg-gray-800"
                            >
                                <Image
                                    source={icons.maincoin}
                                    style={{
                                        width: width * 0.03,
                                        height: width * 0.03,
                                        marginRight: width * 0.01
                                    }}
                                />
                                <View className="items-center">
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.03
                                        }}
                                        className="text-center font-medium"
                                    >
                                        {quickAmount}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Withdrawal Methods */}
                <View style={{ marginBottom: height * 0.03 }}>
                    <View
                        className="flex-row items-center justify-between"
                        style={{ marginBottom: height * 0.015 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045
                            }}
                            className="font-medium"
                        >
                            Withdrawal Method
                        </Text>
                        <TouchableOpacity onPress={handleAddPaymentMethod}>
                            <Text
                                style={{
                                    color: '#3B82F6',
                                    fontSize: width * 0.03
                                }}
                                className="font-medium"
                            >
                                + Add Method
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {withdrawalMethods.length === 0 ? (
                        <View
                            style={{

                                borderRadius: 8,
                                padding: width * 0.04
                            }}
                            className="items-center bg-gray-800"
                        >
                            <Text style={{ fontSize: width * 0.1, marginBottom: height * 0.015 }}>🏦</Text>
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.04,
                                    marginBottom: height * 0.01
                                }}
                                className="font-medium"
                            >
                                No Payment Methods
                            </Text>
                            <Text
                                style={{
                                    color: '#9CA3AF',
                                    fontSize: width * 0.03,
                                    textAlign: 'center',
                                    marginBottom: height * 0.015
                                }}
                            >
                                Add a UPI ID or bank account to withdraw your earnings
                            </Text>
                            <TouchableOpacity
                                onPress={handleAddPaymentMethod}
                                style={{

                                    borderRadius: 8,
                                    paddingHorizontal: width * 0.04,
                                    paddingVertical: height * 0.01
                                }}
                                className='bg-gray-800'
                            >
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035
                                    }}
                                    className="font-medium"
                                >
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
                                style={{

                                    borderRadius: 8,
                                    padding: width * 0.03,
                                    marginBottom: height * 0.01,
                                    borderWidth: selectedMethod === method.id && method.verified ? 1 : 0,
                                    borderColor: selectedMethod === method.id && method.verified ? '#3B82F6' : 'transparent',
                                    opacity: !method.verified ? 0.6 : 1
                                }}
                                className="flex-row items-center justify-between bg-gray-800"
                            >
                                <View className="flex-row items-center flex-1">
                                    <Text style={{ fontSize: width * 0.045, marginRight: width * 0.03 }}>
                                        {method.icon}
                                    </Text>
                                    <View className="flex-1">
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.04
                                            }}
                                            className="font-medium"
                                        >
                                            {method.name}
                                        </Text>
                                        <Text
                                            style={{
                                                color: method.verified ? '#9CA3AF' : '#EF4444',
                                                fontSize: width * 0.03
                                            }}
                                        >
                                            {method.verified ? method.details : 'Verification required'}
                                        </Text>
                                        {!method.verified && (
                                            <Text
                                                style={{
                                                    color: '#EF4444',
                                                    fontSize: width * 0.03,
                                                    marginTop: height * 0.005
                                                }}
                                            >
                                                {method.type === "bank" ? "Verify PAN to enable" : "Verification required"}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View
                                    style={{
                                        width: width * 0.05,
                                        height: width * 0.05,
                                        borderRadius: (width * 0.05) / 2,
                                        borderWidth: 1,
                                        borderColor: selectedMethod === method.id && method.verified ? '#3B82F6' : '#9CA3AF',
                                        backgroundColor: selectedMethod === method.id && method.verified ? '#3B82F6' : 'transparent'
                                    }}
                                    className="items-center justify-center"
                                >
                                    {selectedMethod === method.id && method.verified && (
                                        <View
                                            style={{
                                                width: width * 0.02,
                                                height: width * 0.02,
                                                borderRadius: (width * 0.02) / 2,
                                                backgroundColor: 'white'
                                            }}
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Withdrawal Summary */}
                {amount && parseFloat(amount) > 0 && (
                    <View
                        style={{

                            borderRadius: 8,
                            padding: width * 0.03,
                            marginBottom: height * 0.03
                        }}
                        className='bg-gray-800'
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04,
                                marginBottom: height * 0.01
                            }}
                            className="font-medium"
                        >
                            Withdrawal Summary
                        </Text>
                        <View
                            className="flex-row justify-between"
                            style={{ marginBottom: height * 0.005 }}
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.035
                                }}
                            >
                                Coins to withdraw:
                            </Text>
                            <View className="flex-row items-center">
                                <Image
                                    source={icons.maincoin}
                                    style={{
                                        width: width * 0.04,
                                        height: width * 0.04,
                                        marginRight: width * 0.01
                                    }}
                                />
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.035
                                    }}
                                    className="font-medium"
                                >
                                    {amount}
                                </Text>
                            </View>
                        </View>
                        <View
                            className="flex-row justify-between"
                            style={{ marginBottom: height * 0.005 }}
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.035
                                }}
                            >
                                Rate:
                            </Text>
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.035
                                }}
                            >
                                10 Coins = ₹1
                            </Text>
                        </View>
                        <View
                            className="flex-row justify-between"
                            style={{ marginBottom: height * 0.005 }}
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.035
                                }}
                            >
                                Processing Fee:
                            </Text>
                            <Text
                                style={{
                                    color: '#10B981',
                                    fontSize: width * 0.035
                                }}
                            >
                                Free
                            </Text>
                        </View>
                        <View
                            style={{
                                borderTopWidth: 1,
                                borderTopColor: '#6B7280',
                                paddingTop: height * 0.01,
                                marginTop: height * 0.01
                            }}
                        >
                            <View className="flex-row justify-between">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.04
                                    }}
                                    className="font-bold"
                                >
                                    You will receive:
                                </Text>
                                <Text
                                    style={{
                                        color: '#10B981',
                                        fontSize: width * 0.04
                                    }}
                                    className="font-bold"
                                >
                                    ₹{(parseFloat(amount) * coinValue).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Withdraw Button */}
                <View
                    className="items-center"
                    style={{ marginBottom: height * 0.02 }}
                >
                    <CustomGradientButton
                        borderRadius={12}
                        height={height * 0.06}
                        width={width * 0.9}
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
                <View
                    style={{

                        borderRadius: 8,
                        padding: width * 0.03,
                        marginTop: height * 0.02,
                        marginBottom: height * 0.015
                    }}
                    className='bg-gray-800'
                >
                    <View
                        className="flex-row items-center"
                        style={{ marginBottom: height * 0.01 }}
                    >
                        <Text
                            style={{
                                color: '#60A5FA',
                                fontSize: width * 0.04,
                                marginRight: width * 0.02
                            }}
                        >
                            ℹ️
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.035
                            }}
                            className="font-medium"
                        >
                            Withdrawal Information
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            lineHeight: width * 0.04,
                            marginBottom: height * 0.005
                        }}
                    >
                        • Withdrawals are processed within 24-48 hours
                    </Text>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            lineHeight: width * 0.04,
                            marginBottom: height * 0.005
                        }}
                    >
                        • Minimum withdrawal amount: {minWithdrawal} coins (₹{(minWithdrawal * coinValue).toFixed(2)})
                    </Text>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            lineHeight: width * 0.04,
                            marginBottom: height * 0.005
                        }}
                    >
                        • PAN verification required for bank transfers
                    </Text>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            lineHeight: width * 0.04
                        }}
                    >
                        • No processing fees on withdrawals
                    </Text>
                </View>

                <View
                    style={{

                        borderRadius: 8,
                        padding: width * 0.03
                    }}
                    className='bg-gray-800'
                >
                    <View
                        className="flex-row items-center"
                        style={{ marginBottom: height * 0.01 }}
                    >
                        <Text
                            style={{
                                color: '#10B981',
                                fontSize: width * 0.04,
                                marginRight: width * 0.02
                            }}
                        >
                            🔒
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.035
                            }}
                            className="font-medium"
                        >
                            Secure Withdrawal
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: width * 0.03,
                            lineHeight: width * 0.04
                        }}
                    >
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