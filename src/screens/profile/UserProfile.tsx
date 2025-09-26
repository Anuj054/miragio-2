import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, StatusBar, Dimensions, Modal, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profileimg from "../../assets/images/profileimg.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../navigation/types";
import { useTranslation } from "../../context/TranslationContext";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<MainStackParamList, 'UserProfile'>;

// Add interfaces for task-related data (similar to TaskPage)
interface AssignedUser {
    id: string;
    username: string;
    email: string;
    task_status: string | null;
}

interface ApiTask {
    task_id?: string;
    id: string;
    task_name: string;
    task_description: string;
    task_reward: string;
    task_status: string;
    task_starttime: string;
    task_endtime: string;
    created_at: string;
    status: string;
    assigned_users: AssignedUser[];
}

interface ApiResponse {
    status: string;
    message: string;
    data: ApiTask[];
}

const UserProfile = ({ navigation, route }: Props) => {
    const { from } = route.params || {};
    const { currentLanguage, changeLanguage, isLoading: translationLoading } = useTranslation();
    const isHindi = currentLanguage === 'hi';
    const { user, isLoading: userLoading, refreshUserData, logout } = useUser();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const { getUserId, getUserWallet } = useUser();
    const [completedTasks, setCompletedTasks] = useState(0);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [totalTasks, setTotalTasks] = useState(0);
    const walletBalance = getUserWallet();

    const t = {
        loadingProfile: isHindi ? "प्रोफ़ाइल लोड हो रही है..." : "Loading profile...",
        noUserData: isHindi ? "कोई उपयोगकर्ता डेटा उपलब्ध नहीं" : "No user data available",
        goBack: isHindi ? "वापस जाएं" : "Go Back",
        tasksCompleted: isHindi ? "पूरे किए गए कार्य" : "Tasks Completed",
        walletBalance: isHindi ? "वॉलेट बैलेंस" : "Wallet Balance",
        deleteAccount: isHindi ? "खाता हटाएं" : "Delete Account",
        deleteConfirmTitle: isHindi ? "खाता हटाने की पुष्टि" : "Confirm Account Deletion",
        deleteConfirmMessage: isHindi ? "क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।" : "Are you sure you want to delete your account? This action cannot be undone.",
        deleteSuccess: isHindi ? "खाता सफलतापूर्वक हटा दिया गया" : "Account deleted successfully",
        deleteError: isHindi ? "खाता हटाने में त्रुटि" : "Error deleting account",
        cancel: isHindi ? "रद्द करें" : "Cancel",
        delete: isHindi ? "हटाएं" : "Delete",
        deleting: isHindi ? "हटाया जा रहा है..." : "Deleting...",
    };

    // Language selection handler
    const handleLanguageSelect = async (languageCode: 'en' | 'hi') => {
        await changeLanguage(languageCode);
        setShowLanguageModal(false);
    };

    const openLanguageModal = () => {
        setShowLanguageModal(true);
    };

    // Helper function to get user task status (from TaskPage)
    const getUserTaskStatus = (assignedUsers: AssignedUser[], userId: string): string | null => {
        const currentUser = assignedUsers.find(user => String(user.id) === String(userId));
        return currentUser?.task_status || null;
    };

    // Fetch completed tasks using the same logic as TaskPage
    const fetchCompletedTasks = async () => {
        try {
            setLoadingTasks(true);
            const userId = getUserId();
            if (!userId) {
                console.warn("⚠️ No userId available for fetching tasks.");
                return;
            }

            const response = await fetch("https://miragiofintech.org/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "get_tasks", // Use the same action as TaskPage
                }),
            });

            const data: ApiResponse = await response.json();

            if (data.status === "success") {
                // Filter tasks assigned to the current user (same logic as TaskPage)
                const userTasks = data.data.filter(task =>
                    task.assigned_users.some(user => String(user.id) === String(userId))
                );

                // Count completed tasks using the same logic as TaskPage
                const completed = userTasks.filter(task => {
                    const userStatus = getUserTaskStatus(task.assigned_users, userId);
                    return userStatus === 'approved'; // 'approved' maps to 'completed' status
                }).length;

                setCompletedTasks(completed);
                setTotalTasks(userTasks.length);
            } else {
                setCompletedTasks(0);
                setTotalTasks(0);
            }
        } catch (err) {
            console.error('Error fetching completed tasks:', err);
            setCompletedTasks(0);
            setTotalTasks(0);
        } finally {
            setLoadingTasks(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchCompletedTasks();
        }
    }, [user?.id]);

    useEffect(() => {
        const loadUserData = async () => {
            if (user?.id) {
                setIsRefreshing(true);
                try {
                    await refreshUserData();
                } catch (error) {
                    console.error('Error refreshing user data:', error);
                } finally {
                    setIsRefreshing(false);
                }
            }
        };

        loadUserData();
    }, []);

    const handleBackPress = () => {
        if (from === 'taskpage') {
            navigation.navigate('Tabs', {
                screen: 'TaskTab',
                params: { screen: 'TaskPage' }
            });
        } else {
            navigation.goBack();
        }
    };

    const handleEditProfilePress = () => {
        navigation.navigate('EditProfile', { from: 'userprofile' });
    };

    // Delete user account function
    const handleDeleteAccount = async () => {
        try {
            const userId = getUserId();

            if (!userId) {
                Alert.alert(
                    t.deleteError,
                    isHindi ? "उपयोगकर्ता ID नहीं मिला" : "User ID not found"
                );
                return;
            }

            const response = await fetch("https://miragiofintech.org/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "delete_user",
                    id: userId,
                }),
            });
            console.log(JSON.stringify({
                action: "delete_user",
                id: userId,
            }), 'body>>>>>>>');
            console.log(userId, 'userId>>>>>>>');
            console.log(response, 'response>>>>>>>');
            const data = await response.json();

            if (data.status === "success") {
                console.log('Account deleted successfully');
                await logout();
            } else {
                console.error('Error deleting account:', data.message);
               
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    if (userLoading || isRefreshing) {
        return (
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: Colors.light.blackPrimary }}
            >
                <ActivityIndicator size="large" color={Colors.light.whiteFfffff} />
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.045,
                        marginTop: height * 0.02
                    }}
                >
                    {t.loadingProfile}
                </Text>
            </View>
        );
    }

    if (!user) {
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
                    {t.noUserData}
                </Text>
                <TouchableOpacity
                    onPress={handleBackPress}
                    style={{
                        backgroundColor: Colors.light.bgBlueBtn,
                        marginTop: height * 0.02,
                        paddingHorizontal: width * 0.06,
                        paddingVertical: height * 0.015,
                        borderRadius: 8
                    }}
                >
                    <Text style={{ color: Colors.light.whiteFfffff }}> {t.goBack}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== FIXED HEADER SECTION WITH LANGUAGE TOGGLE =================== */}
            <View style={{ height: height * 0.14 }}>
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header Content with proper flexbox layout */}
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

                        {/* Centered title */}
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.075
                            }}
                            className="font-medium"
                        >
                            {isHindi ? 'उपयोगकर्ता प्रोफ़ाइल' : 'User Profile'}
                        </Text>

                        {/* Language Toggle Button - Updated to match Welcome page style */}
                        <TouchableOpacity
                            className="py-2 px-3 bg-black bg-opacity-50 rounded-full"
                            onPress={openLanguageModal}
                        >
                            <Text
                                className="font-medium text-white"
                                style={{ fontSize: width * 0.035 }}
                            >
                                {currentLanguage === 'hi' ? 'भाषा' : 'Language'} ({currentLanguage.toUpperCase()})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom border */}
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
                contentContainerStyle={{
                    paddingBottom: height * 0.06
                }}
            >
                <View style={{ paddingHorizontal: width * 0.05, paddingTop: height * 0.025 }}>
                    {/* =================== USER PROFILE CARD =================== */}
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            borderLeftWidth: 4,
                            borderRadius: 10,
                            padding: width * 0.02,
                            marginTop: height * 0.025
                        }}
                    >
                        <View className="flex flex-row">
                            {/* Profile image */}
                            <View style={{ marginRight: width * 0.02 }}>
                                <Image
                                    source={profileimg}
                                    style={{
                                        height: width * 0.23,
                                        width: width * 0.23
                                    }}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* User info section */}
                            <View className="flex-1">
                                {/* Username and level display */}
                                <View className="flex flex-row justify-between">
                                    <View
                                        className="flex-1"
                                        style={{ marginLeft: width * 0.05 }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.075,
                                                marginTop: height * 0.02
                                            }}
                                            className="font-bold"
                                        >
                                            {user.username || 'Username'}
                                        </Text>
                                        <Text
                                            style={{
                                                color: Colors.light.placeholderColorOp70,
                                                fontSize: width * 0.045,

                                            }}
                                        >
                                            {isHindi ? 'स्तर 1' : 'Level 1'}
                                        </Text>
                                    </View>
                                    {/* Arrow navigation icon */}
                                    <TouchableOpacity
                                        style={{
                                            width: width * 0.1,
                                            height: width * 0.23
                                        }}
                                        className="flex items-center justify-center"
                                    >
                                        <Image
                                            source={icons.go}
                                            style={{
                                                width: width * 0.03,
                                                height: width * 0.03
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Wallet and task count */}
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            padding: width * 0.04,
                            marginTop: height * 0.02,
                            borderRadius: 12
                        }}
                    >
                        <View
                            className="flex-row justify-between"
                            style={{
                                paddingHorizontal: width * 0.03,
                                marginVertical: height * 0.015
                            }}
                        >
                            {/* Wallet Balance */}
                            <View className="items-center flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.045
                                    }}
                                    className="font-semibold"
                                >
                                    {walletBalance || "0"}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035
                                    }}
                                >
                                    {isHindi ? 'वॉलेट बैलेंस' : 'Wallet Balance'}
                                </Text>
                            </View>

                            {/* Completed Tasks */}
                            <View className="items-center flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.045
                                    }}
                                    className="font-semibold"
                                >
                                    {loadingTasks ? "..." : `${completedTasks}/${totalTasks}`}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035
                                    }}
                                >
                                    {isHindi ? 'पूरे किए गए कार्य' : 'Tasks Completed'}
                                </Text>
                            </View>
                        </View>
                    </View>



                    {/* =================== BOTTOM ACTION BUTTONS =================== */}
                    <View
                        className="flex flex-row justify-between"
                        style={{ marginTop: height * 0.4 }}
                    >
                        {/* Edit Profile Button */}
                        <CustomGradientButton
                            text={isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
                            width={width * 0.9}
                            height={height * 0.055}
                            borderRadius={10}
                            fontSize={width * 0.045}
                            fontWeight="600"
                            textColor={Colors.light.whiteFfffff}
                            onPress={handleEditProfilePress}
                        />

                    </View>
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn,
                            opacity: 1,
                            height: 52,
                            marginVertical: 20,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => { handleDeleteAccount() }}
                        activeOpacity={0.8}
                    >
                        <Text style={{
                            color: Colors.light.whiteFefefe,
                            fontSize: 20,
                            fontWeight: 'bold',
                            paddingHorizontal: 8,
                            marginLeft: 0
                        }}>
                            {t.deleteAccount}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Language Selection Modal - Same as Welcome page */}
            <Modal
                visible={showLanguageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    Select Language
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    भाषा चुनें
                                </Text>
                            </View>

                            {/* Language Options */}
                            <View style={styles.languageOptions}>
                                {/* English Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        currentLanguage === 'en' && styles.selectedOption
                                    ]}
                                    onPress={() => handleLanguageSelect('en')}
                                    disabled={translationLoading}
                                >
                                    <View style={styles.languageInfo}>
                                        <Text style={styles.languageFlag}>🇺🇸</Text>
                                        <View style={styles.languageText}>
                                            <Text style={[
                                                styles.languageName,
                                                currentLanguage === 'en' && styles.selectedText
                                            ]}>
                                                English
                                            </Text>
                                            <Text style={styles.languageNative}>
                                                English
                                            </Text>
                                        </View>
                                    </View>
                                    {currentLanguage === 'en' && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </TouchableOpacity>

                                {/* Hindi Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        currentLanguage === 'hi' && styles.selectedOption
                                    ]}
                                    onPress={() => handleLanguageSelect('hi')}
                                    disabled={translationLoading}
                                >
                                    <View style={styles.languageInfo}>
                                        <Text style={styles.languageFlag}>🇮🇳</Text>
                                        <View style={styles.languageText}>
                                            <Text style={[
                                                styles.languageName,
                                                currentLanguage === 'hi' && styles.selectedText
                                            ]}>
                                                Hindi
                                            </Text>
                                            <Text style={styles.languageNative}>
                                                हिन्दी
                                            </Text>
                                        </View>
                                    </View>
                                    {currentLanguage === 'hi' && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Close button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowLanguageModal(false)}
                            >
                                <Text style={styles.closeButtonText}>Close / बंद करें</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    languageOptions: {
        marginBottom: 24,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#f0f0f0',
        marginBottom: 12,
        backgroundColor: '#fafafa',
    },
    selectedOption: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f7ff',
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageFlag: {
        fontSize: 28,
        marginRight: 12,
    },
    languageText: {
        flex: 1,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    selectedText: {
        color: '#007AFF',
    },
    languageNative: {
        fontSize: 16,
        color: '#666',
    },
    checkMark: {
        fontSize: 20,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    closeButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    closeButtonText: {
        color: '#666',
        fontSize: 16,
    },
});

export default UserProfile;