import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, RefreshControl, StatusBar, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import { Colors } from "../../constants/Colors";
import NoTransactionsModal from "../../components/NoTransactionsModal";
import { useUser } from "../../context/UserContext";

// Navigation types
type NavigationProp = any;

// Type definitions for API response
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

// Type definitions for withdrawal API response
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

// Type definitions for transformed transaction
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

// ADDED: Grouped transactions interface
interface GroupedTransactions {
    [monthYear: string]: Transaction[];
}

const TransactionsPage = () => {
    // Navigation for React Native CLI
    const navigation = useNavigation<NavigationProp>();

    // Get user context
    const { user, getUserId, isLoggedIn, refreshUserData } = useUser();

    // State for active filter and modal visibility
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [showNoTransactionModal, setShowNoTransactionModal] = useState<boolean>(false);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Search functionality state
    const [searchVisible, setSearchVisible] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Filter options for transaction types
    const filterOptions: string[] = [
        'All',
        'Mirago Rewards',
        'Withdraw'
    ];

    // Navigation handlers
    const handleBackPress = () => {
        navigation.replace("WalletPage");
    };

    // ADDED: Utility functions for month grouping (similar to TaskPage)
    const formatMonthYear = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Unknown Date';
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch (error) {
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
        } catch (error) {
            return '9999-12';
        }
    };

    const groupTransactionsByMonth = (transactionsToGroup: Transaction[]): GroupedTransactions => {
        const grouped: GroupedTransactions = {};
        transactionsToGroup.forEach(transaction => {
            const dateForGrouping = transaction.date || new Date().toISOString();
            const monthYear = formatMonthYear(dateForGrouping);
            if (!grouped[monthYear]) {
                grouped[monthYear] = [];
            }
            grouped[monthYear].push(transaction);
        });

        // Sort transactions within each month by date (newest first)
        Object.keys(grouped).forEach(monthYear => {
            grouped[monthYear].sort((a, b) => {
                const dateA = new Date(a.date || '').getTime();
                const dateB = new Date(b.date || '').getTime();
                return dateB - dateA;
            });
        });

        return grouped;
    };

    const getSortedMonthKeys = (groupedTransactions: GroupedTransactions): string[] => {
        return Object.keys(groupedTransactions).sort((a, b) => {
            const firstTransactionA = groupedTransactions[a][0];
            const firstTransactionB = groupedTransactions[b][0];
            const keyA = getMonthYearKey(firstTransactionA?.date || '');
            const keyB = getMonthYearKey(firstTransactionB?.date || '');
            return keyB.localeCompare(keyA);
        });
    };

    // Function to fetch transactions from API
    const fetchTransactions = async (): Promise<void> => {
        try {
            const userId = getUserId();
            if (!userId) {
                console.error("No user ID found. User might not be logged in.");
                navigation.replace("Welcome");
                return;
            }

            console.log("Fetching transactions for user:", userId);

            // API URLs
            const apiUrls = [
                "https://netinnovatus.tech/miragiotask/api/api.php", // Current URL
                "https://netinnovatus.tech/miragio_task/api/api.php"  // Alternative URL
            ];

            let allTransactionsData: Transaction[] = [];

            // Fetch submissions (rewards)
            let submissionResponse: Response | null = null;

            for (const apiUrl of apiUrls) {
                try {
                    console.log("Trying submission API URL:", apiUrl);

                    submissionResponse = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            action: "get_submission"
                        }),
                    });

                    if (submissionResponse.ok) {
                        break;
                    }
                } catch (error) {
                }
            }

            // Process submissions if successful
            if (submissionResponse && submissionResponse.ok) {
                try {
                    const submissionText = await submissionResponse.text();
                    console.log("Submission response (first 200 chars):", submissionText.substring(0, 200));

                    if (!submissionText.trim().startsWith('<')) {
                        const submissionData: SubmissionResponse = JSON.parse(submissionText);

                        if (submissionData.status === "success" && submissionData.data) {
                            console.log("API returned", submissionData.data.length, "total submissions");

                            const userSubmissions = submissionData.data.filter((submission: Submission) =>
                                submission.user_id === userId && submission.task_status === "approved"
                            );

                            console.log("Found", userSubmissions.length, "approved submissions for user");

                            const rewardTransactions: Transaction[] = userSubmissions.map((submission: Submission) => ({
                                id: `reward_${submission.id}`,
                                type: 'Mirago Rewards',
                                title: 'Task Reward',
                                description: `Approved on ${formatDateForDescription(submission.updated_at)}`,
                                amount: parseInt(submission.wallet) || 0,
                                iconColor: Colors.light.bgBlueBtn,
                                icon: icons.transactioncoin || icons.coin,
                                date: submission.updated_at,
                                taskId: submission.task_id,
                                taskUrl: submission.task_url
                            }));

                            allTransactionsData = [...allTransactionsData, ...rewardTransactions];
                        }
                    }
                } catch (error) {
                    console.error("Error processing submissions:", error);
                }
            }

            // Fetch withdrawals
            let withdrawalResponse: Response | null = null;

            for (const apiUrl of apiUrls) {
                try {
                    console.log("Trying withdrawal API URL:", apiUrl);

                    withdrawalResponse = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            action: "get_Withdrawal"
                        }),
                    });

                    if (withdrawalResponse.ok) {
                        break;
                    }
                } catch (error) {
                }
            }

            // Process withdrawals if successful
            if (withdrawalResponse && withdrawalResponse.ok) {
                try {
                    const withdrawalText = await withdrawalResponse.text();
                    console.log("Withdrawal response (first 200 chars):", withdrawalText.substring(0, 200));

                    if (!withdrawalText.trim().startsWith('<')) {
                        const withdrawalData: WithdrawalResponse = JSON.parse(withdrawalText);

                        if (withdrawalData.status === "success" && withdrawalData.data) {
                            console.log("API returned", withdrawalData.data.length, "total withdrawals");

                            const userWithdrawals = withdrawalData.data.filter((withdrawal: Withdrawal) =>
                                withdrawal.user_id === userId
                            );

                            console.log("Found", userWithdrawals.length, "withdrawals for user");

                            const withdrawalTransactions: Transaction[] = userWithdrawals.map((withdrawal: Withdrawal) => ({
                                id: `withdraw_${withdrawal.id}`,
                                type: 'Withdraw',
                                title: 'Withdrawal',
                                description: `${withdrawal.withdrawal_status.charAt(0).toUpperCase() + withdrawal.withdrawal_status.slice(1)} - ${withdrawal.payment_method.toUpperCase()}`,
                                amount: parseFloat(withdrawal.withdraw_amount) || 0,
                                iconColor: '#FF6B6B',
                                icon: icons.withdraw || icons.wallet,
                                date: withdrawal.withdrawal_date,
                                taskId: withdrawal.transaction_id,
                                taskUrl: withdrawal.remarks || ''
                            }));

                            allTransactionsData = [...allTransactionsData, ...withdrawalTransactions];
                        }
                    }
                } catch (error) {
                    console.error("Error processing withdrawals:", error);
                }
            }

            // Sort all transactions by date (newest first)
            allTransactionsData.sort((a: Transaction, b: Transaction) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setAllTransactions(allTransactionsData);

            // Refresh user data to update wallet balance
            await refreshUserData();

        } catch (error) {
            console.error("Error fetching transactions:", error);
            console.error("Error details:", {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            setAllTransactions([]);
        }
    };

    // UPDATED: Function to format date for description display
    const formatDateForDescription = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            return dateString;
        }
    };

    // ADDED: Function to format date and time for transaction display
    const formatDateTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            // Check if it's today
            if (date.toDateString() === today.toDateString()) {
                return `Today, ${date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}`;
            }

            // Check if it's yesterday
            if (date.toDateString() === yesterday.toDateString()) {
                return `Yesterday, ${date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}`;
            }

            // For other dates
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return dateString;
        }
    };

    // Fetch transactions on component mount
    useEffect(() => {
        if (isLoggedIn && getUserId()) {
            setLoading(true);
            fetchTransactions().finally(() => setLoading(false));
        } else {
            navigation.replace("Welcome");
        }
    }, [isLoggedIn, user?.id]);

    // Function to handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    };

    // Filter transactions based on active filter and search query
    const getFilteredTransactions = (): Transaction[] => {
        let filtered = activeFilter === 'All' ? allTransactions : allTransactions.filter((transaction: Transaction) => transaction.type === activeFilter);

        // Apply search filter if search query exists
        if (searchQuery.trim()) {
            filtered = filtered.filter((transaction: Transaction) =>
                transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transaction.taskUrl && transaction.taskUrl.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return filtered;
    };

    const filteredTransactions: Transaction[] = getFilteredTransactions();
    const groupedTransactions = groupTransactionsByMonth(filteredTransactions);
    const sortedMonthKeys = getSortedMonthKeys(groupedTransactions);
    const hasTransactions: boolean = filteredTransactions.length > 0;

    // Render filter button component
    const renderFilterButton = (option: string) => (
        <TouchableOpacity
            key={option}
            onPress={() => {
                setActiveFilter(option);
                // Show modal if no transactions for this filter
                const filtered = option === 'All' ? allTransactions : allTransactions.filter((t: Transaction) => t.type === option);
                if (filtered.length === 0) {
                    setShowNoTransactionModal(true);
                }
            }}
            className={`px-4 py-2 rounded-full mr-2 mb-2 ${activeFilter === option
                ? 'border-0'
                : 'border'
                }`}
            style={{
                backgroundColor: activeFilter === option ? Colors.light.bgBlueBtn : 'transparent',
                borderColor: activeFilter === option ? 'transparent' : Colors.light.secondaryText,
            }}
        >
            <Text
                className={`text-sm ${activeFilter === option ? 'font-bold' : 'font-normal'
                    }`}
                style={{
                    color: activeFilter === option ? Colors.light.whiteFefefe : Colors.light.whiteFefefe,
                }}
            >
                {option}
            </Text>
        </TouchableOpacity>
    );

    // UPDATED: Render transaction item with date/time display
    const renderTransactionItem = (transaction: Transaction) => (
        <View
            key={transaction.id}
            className="mx-4 mb-3 p-4 rounded-2xl"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderLeftWidth: 3,
                borderLeftColor: transaction.type === 'Withdraw' ? '#FF6B6B' : Colors.light.bgBlueBtn,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            {/* Transaction header with icon and details */}
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center flex-1">
                    {/* Transaction icon */}
                    <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        }}
                    >
                        <Image source={transaction.icon} className="w-7 h-7" />
                    </View>

                    {/* Transaction details */}
                    <View className="flex-1">
                        <Text
                            className="text-lg font-semibold mb-1"
                            style={{ color: Colors.light.whiteFfffff }}
                        >
                            {transaction.title}
                        </Text>
                        <Text
                            className="text-sm mb-1"
                            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            numberOfLines={1}
                        >
                            {transaction.description}
                        </Text>

                        {/* ADDED: Date and time display */}
                        <Text
                            className="text-xs"
                            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                        >
                            {formatDateTime(transaction.date)}
                        </Text>
                    </View>
                </View>

                {/* Transaction amount */}
                <View className="flex-row items-center ml-2">
                    <Text
                        className="text-sm mr-1 font-bold"
                        style={{
                            color: transaction.type === 'Withdraw'
                                ? "#FF6B6B"
                                : Colors.light.bgGreen
                        }}
                    >
                        {transaction.type === 'Withdraw' ? '-' : '+'}
                    </Text>
                    <Image source={icons.maincoin} className="w-5 h-5" />
                    <Text
                        className="text-lg font-bold pl-1"
                        style={{
                            color: transaction.type === 'Withdraw'
                                ? "#FF6B6B"
                                : Colors.light.bgGreen
                        }}
                    >
                        {transaction.amount}
                    </Text>
                </View>
            </View>

            {/* Additional transaction info */}
            {transaction.taskUrl && transaction.type === 'Mirago Rewards' && (
                <Text
                    className="text-xs mt-2 px-2 py-1 rounded"
                    style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                    numberOfLines={1}
                >
                    Task: {transaction.taskUrl}
                </Text>
            )}
            {transaction.taskId && transaction.type === 'Withdraw' && (
                <Text
                    className="text-xs mt-2 px-2 py-1 rounded"
                    style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                    numberOfLines={1}
                >
                    Transaction ID: {transaction.taskId}
                </Text>
            )}
        </View>
    );

    // Handler to close no transactions modal
    const handleCloseModal = () => {
        setShowNoTransactionModal(false);
    };

    // Clear search function
    const clearSearch = () => {
        setSearchQuery("");
        setSearchVisible(false);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <View className="relative h-32">
                {/* Background image */}
                <Image source={bg2} resizeMode="cover" className="w-full h-full absolute" />

                {/* Header overlay content with navigation and search */}
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
                            className="text-3xl font-medium"
                        >
                            Transactions
                        </Text>

                        {/* Search button */}
                        <TouchableOpacity
                            onPress={() => setSearchVisible(!searchVisible)}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <Image
                                source={icons.search}
                                className="h-5 w-5"
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

            {/* =================== SEARCH INPUT SECTION =================== */}
            {searchVisible && (
                <View style={{ backgroundColor: Colors.light.blackPrimary, borderColor: Colors.light.backlight2 }} className="px-4 py-3 border-b">
                    <View className="relative">
                        {/* Search input field */}
                        <TextInput
                            style={{ backgroundColor: Colors.light.backlight2, color: Colors.light.whiteFefefe }}
                            className="px-4 py-3 pr-12 rounded-[10px] text-base"
                            placeholder="Search transactions..."
                            placeholderTextColor={Colors.light.placeholderColorOp70}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={true}
                        />
                        {/* Clear search button */}
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                className="absolute right-3 top-0 bottom-0 w-8 flex items-center justify-center"
                                onPress={() => setSearchQuery("")}
                            >
                                <Text style={{ color: Colors.light.placeholderColorOp70 }} className="text-xl font-bold">×</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.light.bgBlueBtn]}
                        tintColor={Colors.light.bgBlueBtn}
                    />
                }
            >
                {/* =================== FILTER BUTTONS SECTION =================== */}
                <View className="flex-row flex-wrap px-4 py-4 pt-5">
                    {filterOptions.map(renderFilterButton)}
                </View>

                {/* =================== LOADING STATE =================== */}
                {loading && (
                    <View className="items-center justify-center py-10">
                        <Text className="text-lg" style={{ color: Colors.light.whiteFfffff }}>
                            Loading transactions...
                        </Text>
                    </View>
                )}

                {/* =================== SEARCH RESULTS HEADER =================== */}
                {!loading && searchQuery.trim() && (
                    <View className="px-4 pb-3">
                        <Text
                            className="text-lg font-semibold"
                            style={{ color: Colors.light.whiteFefefe }}
                        >
                            Search Results ({filteredTransactions.length})
                            {activeFilter !== 'All' && ` in ${activeFilter}`}
                        </Text>
                        {searchQuery.trim() && (
                            <Text
                                className="text-sm mt-1"
                                style={{ color: Colors.light.placeholderColorOp70 }}
                            >
                                Showing results for "{searchQuery}"
                            </Text>
                        )}
                    </View>
                )}

                {/* =================== TRANSACTION LIST SECTION (GROUPED BY MONTH) =================== */}
                {!loading && hasTransactions ? (
                    searchQuery.trim() ? (
                        // Show ungrouped search results
                        <View>
                            {filteredTransactions.map(renderTransactionItem)}
                        </View>
                    ) : (
                        // Show grouped transactions by month (similar to TaskPage)
                        <View>
                            {sortedMonthKeys.map((monthYear) => (
                                <View key={monthYear} className="mb-6">
                                    <View className="px-4 pb-4">
                                        <Text
                                            className="text-xl font-semibold"
                                            style={{ color: Colors.light.whiteFfffff }}
                                        >
                                            {monthYear}
                                        </Text>
                                        <View
                                            className="mt-2 h-[1px] w-full"
                                            style={{
                                                backgroundColor: Colors.light.placeholderColorOp70,
                                                opacity: 0.3
                                            }}
                                        />
                                    </View>
                                    {groupedTransactions[monthYear].map(renderTransactionItem)}
                                </View>
                            ))}
                        </View>
                    )
                ) : !loading ? (
                    /* =================== EMPTY STATE SECTION =================== */
                    <View className="items-center justify-center py-10">
                        <View
                            className="w-20 h-20 rounded-full items-center justify-center mb-6"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                            <Image
                                source={icons.wallet || icons.coin}
                                className="w-10 h-10"
                                style={{ opacity: 0.5 }}
                            />
                        </View>
                        <Text
                            className="text-2xl font-bold text-center mb-3"
                            style={{ color: Colors.light.whiteFfffff }}
                        >
                            {searchQuery.trim() ? 'No Results Found' : 'No Transactions Yet'}
                        </Text>
                        <Text
                            className="text-base text-center px-8"
                            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                            {searchQuery.trim()
                                ? `No transactions found for "${searchQuery}"`
                                : 'Complete and get approved tasks to see your reward transactions here'
                            }
                        </Text>
                        {searchQuery.trim() && (
                            <TouchableOpacity onPress={clearSearch} className="mt-4">
                                <Text style={{ color: Colors.light.bgBlueBtn }} className="text-base">
                                    Clear Search
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : null}
            </ScrollView>

            {/* =================== NO TRANSACTIONS MODAL =================== */}
            <NoTransactionsModal
                visible={showNoTransactionModal}
                onClose={handleCloseModal}
                activeFilter={activeFilter}
            />
        </View>
    );
};

export default TransactionsPage;
