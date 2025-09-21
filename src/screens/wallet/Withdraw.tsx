import React, { useState, useEffect, useCallback } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import bg2 from '../../assets/images/bg2.png';
import { icons } from '../../constants/index';
import { Colors } from '../../constants/Colors';
import CustomGradientButton from '../../components/CustomGradientButton';
import { useUser } from '../../context/UserContext';
import PaymentMethodModal from '../../components/PaymentMethodModal';
import WithdrawalSuccessModal from '../../components/WithdrawlSuccessModal';

const { width, height } = Dimensions.get('window');

type NavigationProp = any;

interface WithdrawalMethod {
    id: string;
    name: string;
    icon: string;
    details: string;
    verified: boolean;
    type: 'upi' | 'bank';
}

const WithdrawAmountPage = () => {
    const [amount, setAmount] = useState<string>('');
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [coinValue, setCoinValue] = useState<number>(0.1);
    const [userBalance, setUserBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [transactionData, setTransactionData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const navigation = useNavigation<NavigationProp>();
    const { getUserId, isLoggedIn, refreshUserData, updateUserData } = useUser();

    const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];
    const minWithdrawal = 100;

    const handleBackPress = () => navigation.goBack();

    const formatAmount = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            return parts[0] + '.' + parts.slice(1).join('');
        }
        return numericValue;
    };

    const handleQuickAmount = (quickAmount: number) => {
        if (quickAmount <= userBalance) {
            setAmount(quickAmount.toString());
            setErrorMessage('');
        } else {
            setErrorMessage(`You don't have enough coins. Available: ${userBalance} coins`);
        }
    };

    const handleWithdraw = () => {
        setErrorMessage('');
        if (!amount || parseFloat(amount) < minWithdrawal) {
            setErrorMessage(`Minimum withdrawal is ${minWithdrawal} coins`);
            return;
        }
        if (parseFloat(amount) > userBalance) {
            setErrorMessage(`You don't have enough coins. Available: ${userBalance}`);
            return;
        }
        if (!selectedMethod) {
            setErrorMessage('Please select a withdrawal method');
            return;
        }
        setShowSuccessModal(true);
    };

    const clearError = () => setErrorMessage('');

    if (loading && !userBalance) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.blackPrimary }}>
                <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.045 }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" style={{ width: '100%', height: '100%', position: 'absolute' }} />
                <View style={{ flex: 1, paddingTop: height * 0.05, paddingHorizontal: width * 0.04 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: height * 0.08 }}>
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{ width: width * 0.1, height: width * 0.1, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.04, height: width * 0.06 }} />
                        </TouchableOpacity>
                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.07, fontWeight: '600' }}>Withdraw</Text>
                        <View style={{ width: width * 0.1 }} />
                    </View>
                </View>
                <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 1, backgroundColor: Colors.light.whiteFfffff }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: height * 0.12, paddingHorizontal: width * 0.05 }}>
                {/* Error */}
                {errorMessage ? (
                    <View style={{ marginTop: height * 0.02, padding: width * 0.03, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)' }}>
                        <Text style={{ color: 'red', fontSize: width * 0.035 }}>⚠️ {errorMessage}</Text>
                    </View>
                ) : null}

                {/* Balance */}
                <View style={{ marginTop: height * 0.02 }}>
                    <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.045, fontWeight: '600' }}>Available Balance</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: height * 0.01 }}>
                        <Image source={icons.maincoin} style={{ width: width * 0.06, height: width * 0.06, marginRight: width * 0.02 }} />
                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.05, fontWeight: '700' }}>{userBalance} Coins</Text>
                    </View>
                    <Text style={{ color: 'gray', fontSize: width * 0.035, marginTop: height * 0.005 }}>≈ ₹{(userBalance * coinValue).toFixed(2)} INR</Text>
                </View>

                {/* Amount Input */}
                <View style={{ marginTop: height * 0.03 }}>
                    <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.045, fontWeight: '600', marginBottom: height * 0.01 }}>
                        Enter Withdrawal Amount
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: width * 0.03 }}>
                        <Image source={icons.maincoin} style={{ width: width * 0.06, height: width * 0.06, marginRight: width * 0.02 }} />
                        <TextInput
                            value={amount}
                            onChangeText={(text) => setAmount(formatAmount(text))}
                            placeholder="0"
                            placeholderTextColor="gray"
                            style={{ flex: 1, color: Colors.light.whiteFfffff, fontSize: width * 0.05, fontWeight: '700' }}
                            keyboardType="numeric"
                        />
                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.04 }}>Coins</Text>
                    </View>
                    {amount ? (
                        <Text style={{ color: 'gray', fontSize: width * 0.035, marginTop: height * 0.005 }}>
                            ≈ ₹{(parseFloat(amount || '0') * coinValue).toFixed(2)} INR
                        </Text>
                    ) : null}
                </View>

                {/* Quick Amounts */}
                <View style={{ marginTop: height * 0.02, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {quickAmounts.map((q) => (
                        <TouchableOpacity
                            key={q}
                            onPress={() => handleQuickAmount(q)}
                            style={{
                                width: '30%',
                                marginBottom: height * 0.015,
                                paddingVertical: height * 0.015,
                                borderRadius: 8,
                                backgroundColor: q > userBalance ? 'rgba(255,255,255,0.1)' : 'rgba(0,122,255,0.3)',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.04 }}>{q}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Withdraw Button */}
                <View style={{ marginTop: height * 0.03, alignItems: 'center' }}>
                    <CustomGradientButton
                        width={width * 0.85}
                        height={height * 0.06}
                        borderRadius={12}
                        text={`WITHDRAW ${amount || '0'} COINS`}
                        onPress={handleWithdraw}
                        disabled={!amount || parseFloat(amount) < minWithdrawal || parseFloat(amount) > userBalance}
                    />
                </View>
            </ScrollView>

            <PaymentMethodModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSuccess={clearError} userId={getUserId() || ''} />
            <WithdrawalSuccessModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)} transactionData={transactionData} />
        </View>
    );
};

export default WithdrawAmountPage;
