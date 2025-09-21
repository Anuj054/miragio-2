import React, { useState, useEffect } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
    StatusBar,
    TextInput,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import bg2 from '../../assets/images/bg2.png';
import { icons } from '../../constants/index';
import { Colors } from '../../constants/Colors';
import NoTransactionsModal from '../../components/NoTransactionsModal';
import { useUser } from '../../context/UserContext';

// Screen size
const { width, height } = Dimensions.get('window');

type NavigationProp = any;

interface Submission {
    id: string;
    user_id: string;
    task_id: string;
    task_image: string;
    task_url: string;
    wallet: string;
    submitted_at: string;
    task_status: string;
    updated_at: string;
}

interface SubmissionResponse {
    status: string;
    message: string;
    data: Submission[];
}

interface Withdrawal {
    id: string;
    user_id: string;
    withdraw_amount: string;
    transaction_id: string;
    withdrawal_status: string;
    withdrawal_date: string;
    processed_date: string;
    payment_method: string;
    remarks: string;
    created_at: string;
    status: string;
    updated_at: string;
}

interface WithdrawalResponse {
    status: string;
    message: string;
    data: Withdrawal[];
}

interface Transaction {
    id: string;
    type: string;
    title: string;
    description: string;
    amount: number;
    iconColor: string;
    icon: any;
    date: string;
    taskId: string;
    taskUrl: string;
}

interface GroupedTransactions {
    [monthYear: string]: Transaction[];
}

const TransactionsPage = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, getUserId, isLoggedIn, refreshUserData } = useUser();

    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [showNoTransactionModal, setShowNoTransactionModal] = useState<boolean>(false);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchVisible, setSearchVisible] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filterOptions: string[] = ['All', 'Mirago Rewards', 'Withdraw'];

    const handleBackPress = () => {
        navigation.replace('WalletPage');
    };

    const formatMonthYear = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Unknown Date';
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch {
            return 'Unknown Date';
        }
    };

    const getMonthYearKey = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '9999-12';
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${year}-${month}`;
        } catch {
            return '9999-12';
        }
    };

    const groupTransactionsByMonth = (transactions: Transaction[]): GroupedTransactions => {
        const grouped: GroupedTransactions = {};
        transactions.forEach(t => {
            const key = formatMonthYear(t.date);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(t);
        });
        Object.keys(grouped).forEach(k =>
            grouped[k].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        return grouped;
    };

    const getSortedMonthKeys = (g: GroupedTransactions): string[] =>
        Object.keys(g).sort((a, b) => {
            const keyA = getMonthYearKey(g[a][0]?.date || '');
            const keyB = getMonthYearKey(g[b][0]?.date || '');
            return keyB.localeCompare(keyA);
        });

    const formatDateForDescription = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
            }
            if (date.toDateString() === yesterday.toDateString()) {
                return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
            }
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateString;
        }
    };

    const fetchTransactions = async (): Promise<void> => {
        try {
            const userId = getUserId();
            if (!userId) {
                navigation.replace('Welcome');
                return;
            }

            const apiUrls = [
                'https://netinnovatus.tech/miragiotask/api/api.php',
                'https://netinnovatus.tech/miragio_task/api/api.php',
            ];

            let allData: Transaction[] = [];

            // Submissions
            let submissionResponse: Response | null = null;
            for (const url of apiUrls) {
                try {
                    submissionResponse = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'get_submission' }),
                    });
                    if (submissionResponse.ok) break;
                } catch { }
            }
            if (submissionResponse && submissionResponse.ok) {
                const text = await submissionResponse.text();
                if (!text.trim().startsWith('<')) {
                    const json: SubmissionResponse = JSON.parse(text);
                    if (json.status === 'success') {
                        const rewards = json.data
                            .filter(s => s.user_id === userId && s.task_status === 'approved')
                            .map(s => ({
                                id: `reward_${s.id}`,
                                type: 'Mirago Rewards',
                                title: 'Task Reward',
                                description: `Approved on ${formatDateForDescription(s.updated_at)}`,
                                amount: parseInt(s.wallet) || 0,
                                iconColor: Colors.light.bgBlueBtn,
                                icon: icons.transactioncoin || icons.coin,
                                date: s.updated_at,
                                taskId: s.task_id,
                                taskUrl: s.task_url,
                            }));
                        allData = [...allData, ...rewards];
                    }
                }
            }

            // Withdrawals
            let withdrawalResponse: Response | null = null;
            for (const url of apiUrls) {
                try {
                    withdrawalResponse = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'get_Withdrawal' }),
                    });
                    if (withdrawalResponse.ok) break;
                } catch { }
            }
            if (withdrawalResponse && withdrawalResponse.ok) {
                const text = await withdrawalResponse.text();
                if (!text.trim().startsWith('<')) {
                    const json: WithdrawalResponse = JSON.parse(text);
                    if (json.status === 'success') {
                        const withdraws = json.data
                            .filter(w => w.user_id === userId)
                            .map(w => ({
                                id: `withdraw_${w.id}`,
                                type: 'Withdraw',
                                title: 'Withdrawal',
                                description: `${w.withdrawal_status.charAt(0).toUpperCase() + w.withdrawal_status.slice(1)} - ${w.payment_method.toUpperCase()}`,
                                amount: parseFloat(w.withdraw_amount) || 0,
                                iconColor: '#FF6B6B',
                                icon: icons.withdraw || icons.wallet,
                                date: w.withdrawal_date,
                                taskId: w.transaction_id,
                                taskUrl: w.remarks || '',
                            }));
                        allData = [...allData, ...withdraws];
                    }
                }
            }

            allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAllTransactions(allData);
            await refreshUserData();
        } catch (e) {
            console.error('Error fetching transactions', e);
            setAllTransactions([]);
        }
    };

    useEffect(() => {
        if (isLoggedIn && getUserId()) {
            setLoading(true);
            fetchTransactions().finally(() => setLoading(false));
        } else {
            navigation.replace('Welcome');
        }
    }, [isLoggedIn, user?.id]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    };

    const getFilteredTransactions = (): Transaction[] => {
        let filtered = activeFilter === 'All'
            ? allTransactions
            : allTransactions.filter(t => t.type === activeFilter);

        if (searchQuery.trim()) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.taskUrl && t.taskUrl.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        return filtered;
    };

    const filteredTransactions = getFilteredTransactions();
    const groupedTransactions = groupTransactionsByMonth(filteredTransactions);
    const sortedMonthKeys = getSortedMonthKeys(groupedTransactions);
    const hasTransactions = filteredTransactions.length > 0;

    const renderFilterButton = (option: string) => (
        <TouchableOpacity
            key={option}
            onPress={() => {
                setActiveFilter(option);
                const filtered =
                    option === 'All'
                        ? allTransactions
                        : allTransactions.filter(t => t.type === option);
                if (filtered.length === 0) setShowNoTransactionModal(true);
            }}
            style={{
                paddingVertical: height * 0.009,
                paddingHorizontal: width * 0.04,
                borderRadius: 50,
                marginRight: width * 0.02,
                marginBottom: height * 0.01,
                backgroundColor:
                    activeFilter === option ? Colors.light.bgBlueBtn : 'transparent',
                borderWidth: activeFilter === option ? 0 : 1,
                borderColor:
                    activeFilter === option
                        ? 'transparent'
                        : Colors.light.secondaryText,
            }}
        >
            <Text
                style={{
                    color: Colors.light.whiteFefefe,
                    fontSize: width * 0.035,
                    fontWeight: activeFilter === option ? '700' : '400',
                }}
            >
                {option}
            </Text>
        </TouchableOpacity>
    );

    const renderTransactionItem = (t: Transaction) => (
        <View
            key={t.id}
            style={{
                marginHorizontal: width * 0.04,
                marginBottom: height * 0.02,
                padding: width * 0.04,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderLeftWidth: 3,
                borderLeftColor: t.type === 'Withdraw' ? '#FF6B6B' : Colors.light.bgBlueBtn,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <View
                        style={{
                            width: width * 0.12,
                            height: width * 0.12,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: width * 0.04,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                        }}
                    >
                        <Image source={t.icon} style={{ width: width * 0.08, height: width * 0.08 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045,
                                fontWeight: '600',
                                marginBottom: height * 0.005,
                            }}
                        >
                            {t.title}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: width * 0.035,
                                marginBottom: height * 0.003,
                            }}
                        >
                            {t.description}
                        </Text>
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: width * 0.03,
                            }}
                        >
                            {formatDateTime(t.date)}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: width * 0.02 }}>
                    <Text
                        style={{
                            color: t.type === 'Withdraw' ? '#FF6B6B' : Colors.light.bgGreen,
                            fontSize: width * 0.04,
                            marginRight: width * 0.01,
                            fontWeight: '700',
                        }}
                    >
                        {t.type === 'Withdraw' ? '-' : '+'}
                    </Text>
                    <Image source={icons.maincoin} style={{ width: width * 0.05, height: width * 0.05 }} />
                    <Text
                        style={{
                            color: t.type === 'Withdraw' ? '#FF6B6B' : Colors.light.bgGreen,
                            fontSize: width * 0.045,
                            marginLeft: width * 0.01,
                            fontWeight: '700',
                        }}
                    >
                        {t.amount}
                    </Text>
                </View>
            </View>


        </View>
    );

    const handleCloseModal = () => setShowNoTransactionModal(false);
    const clearSearch = () => {
        setSearchQuery('');
        setSearchVisible(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" style={{ width: '100%', height: '100%', position: 'absolute' }} />
                <View
                    style={{
                        flex: 1,
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04,
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: height * 0.08 }}>
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{
                                width: width * 0.1,
                                height: width * 0.1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.04, height: width * 0.06 }} />
                        </TouchableOpacity>

                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.075,
                                fontWeight: '500',
                            }}
                        >
                            Transactions
                        </Text>

                        <TouchableOpacity
                            onPress={() => setSearchVisible(!searchVisible)}
                            style={{
                                width: width * 0.1,
                                height: width * 0.1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image source={icons.search} style={{ width: width * 0.05, height: width * 0.05 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: 1,
                        backgroundColor: Colors.light.whiteFfffff,
                    }}
                />
            </View>

            {/* Search Bar */}
            {searchVisible && (
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        borderBottomColor: Colors.light.backlight2,
                        borderBottomWidth: 1,
                        paddingHorizontal: width * 0.04,
                        paddingVertical: height * 0.015,
                    }}
                >
                    <View>
                        <TextInput
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                color: Colors.light.whiteFefefe,
                                paddingHorizontal: width * 0.04,
                                paddingVertical: height * 0.015,
                                borderRadius: 10,
                                fontSize: width * 0.04,
                                paddingRight: width * 0.1,
                            }}
                            placeholder="Search transactions..."
                            placeholderTextColor={Colors.light.placeholderColorOp70}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: width * 0.03,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ color: Colors.light.placeholderColorOp70, fontSize: width * 0.06 }}>×</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.light.bgBlueBtn]}
                        tintColor={Colors.light.bgBlueBtn}
                    />
                }
            >
                {/* Filters */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: width * 0.04, paddingVertical: height * 0.02 }}>
                    {filterOptions.map(renderFilterButton)}
                </View>

                {loading && (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: height * 0.1 }}>
                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.045 }}>Loading transactions...</Text>
                    </View>
                )}

                {!loading && searchQuery.trim() && (
                    <View style={{ paddingHorizontal: width * 0.04, paddingBottom: height * 0.02 }}>
                        <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.045, fontWeight: '600' }}>
                            Search Results ({filteredTransactions.length})
                            {activeFilter !== 'All' && ` in ${activeFilter}`}
                        </Text>
                        <Text style={{ color: Colors.light.placeholderColorOp70, fontSize: width * 0.035, marginTop: height * 0.005 }}>
                            Showing results for "{searchQuery}"
                        </Text>
                    </View>
                )}

                {!loading && hasTransactions ? (
                    searchQuery.trim() ? (
                        <View>{filteredTransactions.map(renderTransactionItem)}</View>
                    ) : (
                        <View>
                            {sortedMonthKeys.map(monthYear => (
                                <View key={monthYear} style={{ marginBottom: height * 0.04 }}>
                                    <View style={{ paddingHorizontal: width * 0.04, paddingBottom: height * 0.015 }}>
                                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.055, fontWeight: '600' }}>
                                            {monthYear}
                                        </Text>
                                        <View
                                            style={{
                                                marginTop: height * 0.01,
                                                height: 1,
                                                backgroundColor: 'rgba(255,255,255,0.3)',
                                            }}
                                        />
                                    </View>
                                    {groupedTransactions[monthYear].map(renderTransactionItem)}
                                </View>
                            ))}
                        </View>
                    )
                ) : !loading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: height * 0.1 }}>
                        <View
                            style={{
                                width: width * 0.2,
                                height: width * 0.2,
                                borderRadius: width * 0.1,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: height * 0.03,
                            }}
                        >
                            <Image
                                source={icons.wallet || icons.coin}
                                style={{ width: width * 0.1, height: width * 0.1, opacity: 0.5 }}
                            />
                        </View>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.06,
                                fontWeight: '700',
                                marginBottom: height * 0.015,
                                textAlign: 'center',
                            }}
                        >
                            {searchQuery.trim() ? 'No Results Found' : 'No Transactions Yet'}
                        </Text>
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: width * 0.04,
                                textAlign: 'center',
                                paddingHorizontal: width * 0.1,
                            }}
                        >
                            {searchQuery.trim()
                                ? `No transactions found for "${searchQuery}"`
                                : 'Complete and get approved tasks to see your reward transactions here'}
                        </Text>
                        {searchQuery.trim() && (
                            <TouchableOpacity onPress={clearSearch} style={{ marginTop: height * 0.02 }}>
                                <Text style={{ color: Colors.light.bgBlueBtn, fontSize: width * 0.04 }}>Clear Search</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : null}
            </ScrollView>

            <NoTransactionsModal visible={showNoTransactionModal} onClose={handleCloseModal} activeFilter={activeFilter} />
        </View>
    );
};

export default TransactionsPage;
