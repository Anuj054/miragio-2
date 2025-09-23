import React, { useState, useEffect, useCallback } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
    Alert,
    RefreshControl,
    StatusBar,
    Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import bg2 from '../../assets/images/bg2.png';
import patternbg from '../../assets/images/patternbg.png';
import { icons } from '../../constants/index';
import profilephoto from '../../assets/images/profilephoto.png';
import task1 from '../../assets/images/task1.png';
import task2 from '../../assets/images/task2.png';
import task3 from '../../assets/images/task3.png';
import task4 from '../../assets/images/task4.png';

import { Colors } from '../../constants/Colors';
import CustomGradientButton from '../../components/CustomGradientButton';
import CustomRedGradientButton from '../../components/CustomRedGradientButton';
import CustomOrangeGradientButton from '../../components/CustomOrangeGradientButton';
import CustomGreenGradientButton from '../../components/CustomGreenGradientButton';
import { useUser } from '../../context/UserContext';

// ✅ Translation
import { useTranslation } from '../../context/TranslationContext';

import type { TaskStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskPage'>;

const { width, height } = Dimensions.get('window');

interface AssignedUser {
    id: string;
    username: string;
    email: string;
    task_status: string | null;
}

interface Task {
    id: string | number;
    title: string;
    description: string;
    reward: number;
    status: 'upcoming' | 'completed' | 'pending' | 'rejected' | 'active' | 'expired';
    icon: any;
    hasCheckmarks: boolean;
    completedSteps: number;
    totalSteps: number;
    type: string;
    created_at?: string;
    updated_at?: string;
    deadline?: string;
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

interface GroupedTasks {
    [monthYear: string]: Task[];
}

type MainTab = 'pending' | 'completed';
type PendingFilter = 'active' | 'expired';
type CompletedFilter = 'completed' | 'pendingReview';

const TaskPage = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const [activeMainTab, setActiveMainTab] = useState<MainTab>('pending');
    const [activePendingFilter, setActivePendingFilter] = useState<PendingFilter>('active');
    const [activeCompletedFilter, setActiveCompletedFilter] = useState<CompletedFilter>('completed');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const { getUserId } = useUser();
    const USER_ID = getUserId();

    const taskIcons = [task1, task2, task3, task4];

    const getUserTaskStatus = (assignedUsers: AssignedUser[], userId: string): string | null => {
        const currentUser = assignedUsers.find(user => String(user.id) === String(userId));
        return currentUser?.task_status || null;
    };

    const isTaskExpired = (deadlineString: string): boolean => {
        if (!deadlineString) return false;
        const deadline = new Date(deadlineString);
        const now = new Date();
        return deadline < now;
    };

    const mapUserTaskStatus = (userStatus: string | null, deadline?: string): Task['status'] => {
        if (!userStatus) {
            // Check if task is expired for upcoming tasks
            if (deadline && isTaskExpired(deadline)) {
                return 'expired';
            }
            return 'active'; // Changed from 'upcoming' to 'active'
        }

        const normalized = userStatus.toLowerCase().trim();
        switch (normalized) {
            case 'approved': return 'completed';
            case 'rejected': return 'rejected';
            case 'pending': return 'pending';
            default:
                if (deadline && isTaskExpired(deadline)) {
                    return 'expired';
                }
                return 'active';
        }
    };

    const formatMonthYear = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return isHi ? 'अज्ञात तिथि' : 'Unknown Date';
            return date.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { month: 'long', year: 'numeric' });
        } catch {
            return isHi ? 'अज्ञात तिथि' : 'Unknown Date';
        }
    };

    const groupTasksByMonth = (tasksToGroup: Task[]): GroupedTasks => {
        const grouped: GroupedTasks = {};
        tasksToGroup.forEach(task => {
            const monthYear = formatMonthYear(task.created_at || new Date().toISOString());
            if (!grouped[monthYear]) grouped[monthYear] = [];
            grouped[monthYear].push(task);
        });
        return grouped;
    };

    const fetchUserTasks = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError(null);
            if (!USER_ID) {
                setError(isHi ? 'उपयोगकर्ता लॉग इन नहीं है।' : 'User not logged in. Please login again.');
                return;
            }
            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_tasks' }),
            });
            const data: ApiResponse = await response.json();
            if (data.status === 'success') {
                const userTasks: Task[] = data.data
                    .filter(t => t.assigned_users.some(u => String(u.id) === String(USER_ID)))
                    .map((t, i) => {
                        const userStatus = getUserTaskStatus(t.assigned_users, USER_ID);
                        const mappedStatus = mapUserTaskStatus(userStatus, t.task_endtime);

                        return {
                            id: t.task_id || t.id,
                            title: t.task_name,
                            description: t.task_description,
                            reward: parseInt(t.task_reward) || 0,
                            status: mappedStatus,
                            icon: taskIcons[i % taskIcons.length],
                            hasCheckmarks: false,
                            completedSteps: ['completed', 'rejected'].includes(mappedStatus) ? 1 : 0,
                            totalSteps: 1,
                            type: 'general',
                            created_at: t.created_at,
                            deadline: t.task_endtime,
                        };
                    });

                setTasks(userTasks);
            } else {
                setError(data.message || (isHi ? 'कार्य प्राप्त करने में विफल' : 'Failed to fetch tasks'));
            }
        } catch {
            setError(isHi ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' : 'Network error. Please check your connection.');
        } finally {
            if (showLoader) setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchUserTasks(); }, [USER_ID]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserTasks(false);
    }, []);

    // Filter tasks based on active tab and sub-filters
    const getFilteredTasks = (): Task[] => {
        if (activeMainTab === 'pending') {
            const pendingTasks = tasks.filter(task => ['active', 'expired'].includes(task.status));
            return pendingTasks.filter(task => task.status === activePendingFilter);
        } else {
            // Completed tab
            const completedTasks = tasks.filter(task => ['completed', 'rejected', 'pending'].includes(task.status));
            if (activeCompletedFilter === 'completed') {
                return completedTasks.filter(task => ['completed', 'rejected'].includes(task.status));
            } else {
                // pendingReview
                return completedTasks.filter(task => task.status === 'pending');
            }
        }
    };

    const filteredTasks = getFilteredTasks();
    const groupedTasks = groupTasksByMonth(filteredTasks);
    const monthKeys = Object.keys(groupedTasks).sort((a, b) => {
        const aDate = new Date(groupedTasks[a][0]?.created_at || 0).getTime();
        const bDate = new Date(groupedTasks[b][0]?.created_at || 0).getTime();
        return bDate - aDate;
    });

    const getBorderColor = (status: Task['status']) => {
        switch (status) {
            case 'completed': return '#48BB78';
            case 'rejected': return '#FF6B6B';
            case 'pending': return '#FFA726';
            case 'expired': return '#757575';
            default: return Colors.light.bgBlueBtn; // active
        }
    };

    const handleTaskNavigation = (task: Task) => {
        if (task.status === 'completed') {
            navigation.navigate('TaskSuccessful', {});
            return;
        }
        if (task.status === 'rejected') {
            Alert.alert(
                isHi ? 'कार्य अस्वीकृत' : 'Task Rejected',
                isHi
                    ? 'यह कार्य अस्वीकृत कर दिया गया है। अधिक जानकारी के लिए सहायता से संपर्क करें।'
                    : 'This task has been rejected. Please contact support for more information.',
                [{ text: isHi ? 'ठीक है' : 'OK' }],
            );
            return;
        }
        if (task.status === 'expired') {
            Alert.alert(
                isHi ? 'कार्य समाप्त' : 'Task Expired',
                isHi
                    ? 'यह कार्य की समयसीमा समाप्त हो गई है।'
                    : 'This task has expired and is no longer available.',
                [{ text: isHi ? 'ठीक है' : 'OK' }],
            );
            return;
        }
        navigation.navigate('TaskDetails', { taskId: String(task.id) });
    };

    const handleProfilePress = () => {
        navigation.getParent()?.navigate('UserProfile', { from: 'taskpage' });
    };

    const renderMainTabButton = (tab: MainTab, label: string) => (
        <TouchableOpacity
            onPress={() => setActiveMainTab(tab)}
            style={{
                flex: 1,
                backgroundColor: activeMainTab === tab ? Colors.light.bgBlueBtn : 'transparent',
                borderColor: activeMainTab === tab ? 'transparent' : Colors.light.secondaryText,
                borderWidth: activeMainTab === tab ? 0 : 1,
                borderRadius: 20,
                paddingVertical: height * 0.012,
                marginHorizontal: width * 0.01,
            }}
        >
            <Text
                style={{
                    color: Colors.light.whiteFefefe,
                    fontSize: width * 0.04,
                    fontWeight: activeMainTab === tab ? 'bold' : 'normal',
                    textAlign: 'center',
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderSubFilterButton = (
        _filter: PendingFilter | CompletedFilter,
        label: string,
        isActive: boolean,
        onPress: () => void
    ) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: isActive ? Colors.light.bgBlueBtn : 'transparent',
                borderColor: isActive ? 'transparent' : Colors.light.secondaryText,
                borderWidth: isActive ? 0 : 1,
                borderRadius: 15,
                paddingHorizontal: width * 0.04,
                paddingVertical: height * 0.008,
                marginRight: width * 0.03,
            }}
        >
            <Text
                style={{
                    color: Colors.light.whiteFefefe,
                    fontSize: width * 0.035,
                    fontWeight: isActive ? 'bold' : 'normal',
                    textAlign: 'center',
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderTaskItem = (task: Task) => (
        <ImageBackground
            key={task.id}
            source={patternbg}
            resizeMode="stretch"
            style={{
                borderLeftColor: getBorderColor(task.status),
                borderLeftWidth: 4,
                borderRadius: 12,
                marginHorizontal: width * 0.04,
                marginBottom: height * 0.02,
                padding: width * 0.04,
            }}
        >
            <View className="flex-row items-center" style={{ marginBottom: height * 0.015 }}>
                <Image
                    source={task.icon}
                    style={{
                        height: width * 0.12,
                        width: width * 0.12,
                        opacity: ['rejected', 'expired'].includes(task.status) ? 0.5 : 1
                    }}
                    resizeMode="contain"
                />
                <View className="flex-1" style={{ marginHorizontal: width * 0.03 }}>
                    <Text
                        style={{
                            color: ['rejected', 'expired'].includes(task.status)
                                ? Colors.light.placeholderColorOp70
                                : Colors.light.whiteFefefe,
                            fontSize: width * 0.045,
                        }}
                    >
                        {task.title}
                    </Text>
                    <Text
                        style={{
                            color: Colors.light.placeholderColorOp70,
                            fontSize: width * 0.035,
                            lineHeight: width * 0.05,
                        }}
                    >
                        {task.description}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleTaskNavigation(task)}>
                    <Image
                        source={icons.go}
                        style={{
                            width: width * 0.03,
                            height: width * 0.03,
                            opacity: ['rejected', 'expired'].includes(task.status) ? 0.5 : 1
                        }}
                    />
                </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between">
                <View className="flex-1" style={{ marginRight: width * 0.04 }}>
                    {task.status === 'rejected' && (
                        <CustomRedGradientButton
                            text={isHi ? 'अस्वीकृत' : 'Rejected'}
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            disabled
                        />
                    )}
                    {task.status === 'pending' && (
                        <CustomOrangeGradientButton
                            text={isHi ? 'समीक्षा लंबित' : 'Pending Review'}
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            disabled
                        />
                    )}
                    {task.status === 'completed' && (
                        <CustomGreenGradientButton
                            text={isHi ? 'पूर्ण' : 'Completed'}
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                        />
                    )}
                    {task.status === 'active' && (
                        <CustomGradientButton
                            text={isHi ? 'अब करें' : 'Do It Now'}
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                        />
                    )}
                    {task.status === 'expired' && (
                        <CustomRedGradientButton
                            text={isHi ? 'समाप्त' : 'Expired'}
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            disabled
                        />
                    )}
                </View>

                <View className="flex flex-row items-center" style={{ marginLeft: width * 0.03 }}>
                    <Image
                        source={icons.maincoin}
                        style={{
                            width: width * 0.06,
                            height: width * 0.06,
                            opacity: ['rejected', 'expired'].includes(task.status) ? 0.5 : 1
                        }}
                    />
                    <Text
                        style={{
                            color: ['rejected', 'expired'].includes(task.status)
                                ? Colors.light.placeholderColorOp70
                                : Colors.light.whiteFefefe,
                            fontSize: width * 0.04,
                            paddingLeft: width * 0.01,
                        }}
                    >
                        {task.reward}
                    </Text>
                </View>
            </View>
        </ImageBackground>
    );

    const getEmptyStateMessage = () => {
        if (activeMainTab === 'pending') {
            if (activePendingFilter === 'active') {
                return {
                    title: isHi ? 'कोई सक्रिय कार्य नहीं' : 'No Active Tasks',
                    subtitle: isHi ? 'नए कार्यों के लिए बाद में जाँच करें!' : 'Check back later for new tasks!'
                };
            } else {
                return {
                    title: isHi ? 'कोई समाप्त कार्य नहीं' : 'No Expired Tasks',
                    subtitle: isHi ? 'कोई समाप्त कार्य नहीं मिला।' : 'No expired tasks found.'
                };
            }
        } else {
            if (activeCompletedFilter === 'completed') {
                return {
                    title: isHi ? 'कोई पूर्ण कार्य नहीं' : 'No Completed Tasks',
                    subtitle: isHi ? 'कोई पूर्ण या अस्वीकृत कार्य नहीं मिला।' : 'No completed or rejected tasks found.'
                };
            } else {
                return {
                    title: isHi ? 'कोई समीक्षाधीन कार्य नहीं' : 'No Pending Review Tasks',
                    subtitle: isHi ? 'कोई समीक्षाधीन कार्य नहीं मिला।' : 'No tasks pending review found.'
                };
            }
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" className="w-full h-full absolute" />
                <View className="flex-1" style={{ paddingTop: height * 0.05, paddingBottom: height * 0.02, paddingHorizontal: width * 0.04 }}>
                    <View className="flex-row items-center justify-between" style={{ height: height * 0.08 }}>
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.075 }} className="font-medium">
                            {isHi ? 'कार्य' : 'Tasks'}
                        </Text>
                        <TouchableOpacity
                            onPress={handleProfilePress}
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                width: width * 0.11,
                                height: width * 0.11,
                                borderRadius: (width * 0.11) / 2,
                            }}
                            className="items-center justify-center"
                        >
                            <Image
                                source={profilephoto}
                                style={{ height: width * 0.11, width: width * 0.11, borderRadius: (width * 0.11) / 2 }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="absolute bottom-0 w-full" style={{ backgroundColor: Colors.light.whiteFfffff, height: 1 }} />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.light.whiteFefefe}
                        colors={[Colors.light.bgBlueBtn]}
                    />
                }
            >
                {/* Main Tabs */}
                <View style={{
                    paddingHorizontal: width * 0.04,
                    paddingTop: height * 0.025,
                    paddingBottom: height * 0.02,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 30,
                    marginHorizontal: width * 0.03,
                    marginTop: height * 0.01,
                }}>
                    <View className="flex-row" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 28,
                        padding: 4,
                    }}>
                        {renderMainTabButton('pending', isHi ? 'लंबित कार्य' : 'Pending Tasks')}
                        {renderMainTabButton('completed', isHi ? 'पूर्ण कार्य' : 'Completed Tasks')}
                    </View>
                </View>

                {/* Sub Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: width * 0.04,
                        paddingBottom: height * 0.025,
                        paddingTop: height * 0.01,
                    }}
                    className="flex-grow-0"
                >
                    <View className="flex-row" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 22,
                        paddingHorizontal: width * 0.03,
                        paddingVertical: height * 0.01,
                    }}>
                        {activeMainTab === 'pending' ? (
                            <>
                                {renderSubFilterButton(
                                    'active',
                                    isHi ? 'सक्रिय' : 'Active',
                                    activePendingFilter === 'active',
                                    () => setActivePendingFilter('active')
                                )}
                                {renderSubFilterButton(
                                    'expired',
                                    isHi ? 'समाप्त' : 'Expired',
                                    activePendingFilter === 'expired',
                                    () => setActivePendingFilter('expired')
                                )}
                            </>
                        ) : (
                            <>
                                {renderSubFilterButton(
                                    'completed',
                                    isHi ? 'पूर्ण' : 'Completed',
                                    activeCompletedFilter === 'completed',
                                    () => setActiveCompletedFilter('completed')
                                )}
                                {renderSubFilterButton(
                                    'pendingReview',
                                    isHi ? 'समीक्षाधीन' : 'Pending Review',
                                    activeCompletedFilter === 'pendingReview',
                                    () => setActiveCompletedFilter('pendingReview')
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>

                {/* Main Content */}
                {loading ? (
                    <View className="items-center justify-center" style={{ paddingVertical: height * 0.1 }}>
                        <Text style={{ color: Colors.light.placeholderColorOp70, fontSize: width * 0.05 }}>
                            {isHi ? 'कार्य लोड हो रहे हैं...' : 'Loading tasks...'}
                        </Text>
                    </View>
                ) : error ? (
                    <View className="items-center justify-center" style={{ paddingVertical: height * 0.1, paddingHorizontal: width * 0.04 }}>
                        <Text style={{ color: Colors.light.placeholderColorOp70, fontSize: width * 0.05, marginBottom: height * 0.02 }} className="text-center">
                            {error}
                        </Text>
                        <TouchableOpacity
                            onPress={() => fetchUserTasks()}
                            style={{ backgroundColor: Colors.light.bgBlueBtn, paddingHorizontal: width * 0.06, paddingVertical: height * 0.015, borderRadius: 8 }}
                        >
                            <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.04 }} className="font-semibold">
                                {isHi ? 'पुनः प्रयास करें' : 'Retry'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredTasks.length > 0 ? (
                    <View>
                        {monthKeys.map(monthYear => (
                            <View key={monthYear} style={{ marginBottom: height * 0.03 }}>
                                <View
                                    style={{
                                        paddingHorizontal: width * 0.04,
                                        paddingBottom: height * 0.02,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.05,
                                        }}
                                        className="font-semibold"
                                    >
                                        {monthYear}
                                    </Text>
                                    <View
                                        style={{
                                            marginTop: height * 0.01,
                                            height: 1,
                                            width: '100%',
                                            backgroundColor: Colors.light.placeholderColorOp70,
                                            opacity: 0.3,
                                        }}
                                    />
                                </View>
                                {groupedTasks[monthYear].map(task => renderTaskItem(task))}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View
                        className="items-center justify-center"
                        style={{ paddingVertical: height * 0.1 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.placeholderColorOp70,
                                fontSize: width * 0.055,
                            }}
                            className="font-medium text-center"
                        >
                            {getEmptyStateMessage().title}
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.placeholderColorOp70,
                                fontSize: width * 0.04,
                                marginTop: height * 0.01,
                            }}
                            className="text-center"
                        >
                            {getEmptyStateMessage().subtitle}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default TaskPage;