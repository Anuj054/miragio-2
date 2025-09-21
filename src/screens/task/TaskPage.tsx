import React from 'react';
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
    Dimensions
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import patternbg from "../../assets/images/patternbg.png";
import { icons } from "../../constants/index";
import profilephoto from "../../assets/images/profilephoto.png";
import task1 from "../../assets/images/task1.png";
import task2 from "../../assets/images/task2.png";
import task3 from "../../assets/images/task3.png";
import task4 from "../../assets/images/task4.png";

import { Colors } from "../../constants/Colors";
import CustomGradientButton from "../../components/CustomGradientButton";
import CustomRedGradientButton from "../../components/CustomRedGradientButton";
import CustomOrangeGradientButton from "../../components/CustomOrangeGradientButton";
import CustomGreenGradientButton from "../../components/CustomGreenGradientButton";
import { useUser } from "../../context/UserContext";

// FIXED: Navigation types
import type { TaskStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskPage'>;

const { width, height } = Dimensions.get('window');

// Type definitions
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
    status: 'upcoming' | 'completed' | 'pending' | 'rejected';
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

type FilterOption = 'All' | 'Upcoming' | 'Completed' | 'Pending' | 'Rejected';

const TaskPage = ({ navigation }: Props) => {
    const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const { getUserId } = useUser();
    const USER_ID = getUserId();

    const taskIcons = [task1, task2, task3, task4];
    const filterOptions: FilterOption[] = ['All', 'Upcoming', 'Completed', 'Pending', 'Rejected'];

    // Utility functions
    const getUserTaskStatus = (assignedUsers: AssignedUser[], userId: string): string | null => {
        if (!assignedUsers || !userId) return null;
        const currentUser = assignedUsers.find(user => String(user.id) === String(userId));
        return currentUser?.task_status || null;
    };

    const mapUserTaskStatus = (userStatus: string | null): 'upcoming' | 'completed' | 'pending' | 'rejected' => {
        if (!userStatus) return 'upcoming';
        const normalizedStatus = userStatus.toLowerCase().trim();
        switch (normalizedStatus) {
            case 'approved': return 'completed';
            case 'rejected': return 'rejected';
            case 'pending': return 'pending';
            default: return 'upcoming';
        }
    };

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

    const groupTasksByMonth = (tasksToGroup: Task[]): GroupedTasks => {
        const grouped: GroupedTasks = {};
        tasksToGroup.forEach(task => {
            const dateForGrouping = task.created_at || new Date().toISOString();
            const monthYear = formatMonthYear(dateForGrouping);
            if (!grouped[monthYear]) {
                grouped[monthYear] = [];
            }
            grouped[monthYear].push(task);
        });
        Object.keys(grouped).forEach(monthYear => {
            grouped[monthYear].sort((a, b) => {
                const dateA = new Date(a.created_at || '').getTime();
                const dateB = new Date(b.created_at || '').getTime();
                return dateB - dateA;
            });
        });
        return grouped;
    };

    const getSortedMonthKeys = (groupedTasks: GroupedTasks): string[] => {
        return Object.keys(groupedTasks).sort((a, b) => {
            const firstTaskA = groupedTasks[a][0];
            const firstTaskB = groupedTasks[b][0];
            const keyA = getMonthYearKey(firstTaskA?.created_at || '');
            const keyB = getMonthYearKey(firstTaskB?.created_at || '');
            return keyB.localeCompare(keyA);
        });
    };

    // API fetch function
    const fetchUserTasks = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError(null);

            if (!USER_ID) {
                setError('User not logged in. Please login again.');
                return;
            }

            const response = await fetch('https://netinnovatus.tech/miragio_task/api/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "get_tasks" })
            });

            const data: ApiResponse = await response.json();

            if (data.status === 'success' && data.data) {
                const userTasks: Task[] = data.data
                    .filter(task => task.assigned_users.some(user => String(user.id) === String(USER_ID)))
                    .map((task: ApiTask, index: number) => {
                        const userStatus = getUserTaskStatus(task.assigned_users, USER_ID);
                        return {
                            id: task.task_id || task.id,
                            title: task.task_name,
                            description: task.task_description,
                            reward: parseInt(task.task_reward) || 0,
                            status: mapUserTaskStatus(userStatus),
                            icon: taskIcons[index % taskIcons.length],
                            hasCheckmarks: false,
                            completedSteps: userStatus === 'approved' ? 1 : 0,
                            totalSteps: 1,
                            type: 'general',
                            created_at: task.created_at,
                            deadline: task.task_endtime
                        };
                    });
                setTasks(userTasks);
            } else {
                setError(data.message || 'Failed to fetch tasks');
                setTasks([]);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Network error. Please check your connection.');
            setTasks([]);
        } finally {
            if (showLoader) setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserTasks();
    }, [USER_ID]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserTasks(false);
    }, []);

    const getFilteredTasks = () => {
        switch (activeFilter) {
            case 'All': return tasks;
            case 'Upcoming': return tasks.filter(task => task.status === 'upcoming');
            case 'Completed': return tasks.filter(task => task.status === 'completed');
            case 'Pending': return tasks.filter(task => task.status === 'pending');
            case 'Rejected': return tasks.filter(task => task.status === 'rejected');
            default: return tasks;
        }
    };

    const filteredTasks = getFilteredTasks();
    const groupedTasks = groupTasksByMonth(filteredTasks);
    const sortedMonthKeys = getSortedMonthKeys(groupedTasks);
    const hasTasks = filteredTasks.length > 0 && !loading;

    const refreshTasks = () => fetchUserTasks();

    const getBorderColor = (status: Task['status']) => {
        switch (status) {
            case 'completed': return '#48BB78';
            case 'rejected': return '#FF6B6B';
            case 'pending': return '#FFA726';
            default: return Colors.light.bgBlueBtn;
        }
    };

    // Navigation handlers
    const handleTaskNavigation = (task: Task) => {
        if (task.status === 'completed') {
            (navigation as any).navigate('TaskSuccessful');
            return;
        }

        if (task.status === 'rejected') {
            Alert.alert(
                "Task Rejected",
                "This task has been rejected. Please contact support for more information.",
                [{ text: "OK" }]
            );
            return;
        }

        if (task.status === 'upcoming' || task.status === 'pending') {
            navigation.navigate('TaskDetails', { taskId: String(task.id) });
            return;
        }
    };

    const handleProfilePress = () => {
        navigation.getParent()?.navigate('UserProfile', { from: 'taskpage' });
    };

    // Render functions
    const renderFilterButton = (option: FilterOption, index: number) => (
        <TouchableOpacity
            key={option}
            onPress={() => {
                setActiveFilter(option);
            }}
            style={{
                backgroundColor: activeFilter === option ? Colors.light.bgBlueBtn : 'transparent',
                borderColor: activeFilter === option ? 'transparent' : Colors.light.secondaryText,
                borderWidth: activeFilter === option ? 0 : 1,
                borderRadius: 20,
                paddingHorizontal: width * 0.04,
                paddingVertical: height * 0.009,
                marginRight: index < filterOptions.length - 1 ? width * 0.03 : 0,
                minWidth: width * 0.18,
            }}
        >
            <Text
                style={{
                    color: Colors.light.whiteFefefe,
                    fontSize: width * 0.035,
                    fontWeight: activeFilter === option ? 'bold' : 'normal',
                    textAlign: 'center'
                }}
            >
                {option}
            </Text>
        </TouchableOpacity>
    );

    const renderLoadingState = () => (
        <View
            className="items-center justify-center"
            style={{ paddingVertical: height * 0.1 }}
        >
            <Text
                style={{
                    color: Colors.light.placeholderColorOp70,
                    fontSize: width * 0.05
                }}
                className="font-medium"
            >
                Loading tasks...
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View
            className="items-center justify-center"
            style={{
                paddingVertical: height * 0.1,
                paddingHorizontal: width * 0.04
            }}
        >
            <Text
                style={{
                    color: Colors.light.placeholderColorOp70,
                    fontSize: width * 0.05,
                    marginBottom: height * 0.02
                }}
                className="font-medium text-center"
            >
                {error}
            </Text>
            <TouchableOpacity
                onPress={refreshTasks}
                style={{
                    backgroundColor: Colors.light.bgBlueBtn,
                    paddingHorizontal: width * 0.06,
                    paddingVertical: height * 0.015,
                    borderRadius: 8
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFefefe,
                        fontSize: width * 0.04
                    }}
                    className="font-semibold"
                >
                    Retry
                </Text>
            </TouchableOpacity>
        </View>
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
                padding: width * 0.04
            }}
        >
            {/* Header section with icon, title and arrow */}
            <View
                className="flex-row items-center"
                style={{ marginBottom: height * 0.015 }}
            >
                {/* Task Icon */}
                <View style={{ marginRight: width * 0.04 }}>
                    <Image
                        source={task.icon}
                        style={{
                            height: width * 0.12,
                            width: width * 0.12,
                            opacity: task.status === 'rejected' ? 0.5 : 1
                        }}
                        resizeMode="contain"
                    />
                </View>

                {/* Title and Description Container */}
                <View
                    className="flex-1"
                    style={{ marginRight: width * 0.03 }}
                >
                    <Text
                        style={{
                            color: task.status === 'rejected'
                                ? Colors.light.placeholderColorOp70
                                : Colors.light.whiteFefefe,
                            fontSize: width * 0.045,
                            marginBottom: height * 0.005
                        }}
                        className="font-normal"
                    >
                        {task.title}
                    </Text>
                    <Text
                        style={{
                            color: Colors.light.placeholderColorOp70,
                            fontSize: width * 0.035,
                            lineHeight: width * 0.05
                        }}
                    >
                        {task.description}
                    </Text>
                </View>

                {/* Arrow Icon */}
                <TouchableOpacity onPress={() => handleTaskNavigation(task)}>
                    <Image
                        source={icons.go}
                        style={{
                            width: width * 0.03,
                            height: width * 0.03,
                            opacity: task.status === 'rejected' ? 0.5 : 1
                        }}
                    />
                </TouchableOpacity>
            </View>

            {/* Button and Coin Section */}
            <View className="flex-row items-center justify-between">
                {/* Status Button Container */}
                <View
                    className="flex-1"
                    style={{ marginRight: width * 0.04 }}
                >
                    {task.status === 'rejected' && (
                        <CustomRedGradientButton
                            text="Rejected"
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                            disabled={true}
                        />
                    )}

                    {task.status === 'pending' && (
                        <CustomOrangeGradientButton
                            text="Pending Review"
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                            disabled={true}
                        />
                    )}

                    {task.status === 'completed' && (
                        <CustomGreenGradientButton
                            text="Completed"
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                        />
                    )}

                    {task.status === 'upcoming' && (
                        <CustomGradientButton
                            text="Do It Now"
                            width={width * 0.63}
                            height={height * 0.038}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={width * 0.04}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                        />
                    )}
                </View>

                {/* Coin and Reward Display */}
                <View
                    className="flex flex-row items-center"
                    style={{ marginLeft: width * 0.03 }}
                >
                    <Image
                        source={icons.maincoin}
                        style={{
                            width: width * 0.06,
                            height: width * 0.06,
                            opacity: task.status === 'rejected' ? 0.5 : 1
                        }}
                    />
                    <Text
                        style={{
                            color: task.status === 'rejected'
                                ? Colors.light.placeholderColorOp70
                                : Colors.light.whiteFefefe,
                            fontSize: width * 0.04,
                            paddingLeft: width * 0.01
                        }}
                        className="font-semibold"
                    >
                        {task.reward}
                    </Text>
                </View>
            </View>
        </ImageBackground>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Fixed Header Section - Responsive */}
            <View style={{ height: height * 0.14 }}>
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header Content */}
                <View
                    className="flex-1"
                    style={{
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    {/* Header row */}
                    <View
                        className="flex-row items-center justify-between"
                        style={{ height: height * 0.08 }}
                    >
                        {/* Back button (empty space for balance) */}
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />

                        {/* Centered title */}
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.075
                            }}
                            className="font-medium"
                        >
                            Tasks
                        </Text>

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

                {/* Bottom border */}
                <View
                    className="absolute bottom-0 w-full"
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        height: 1
                    }}
                />
            </View>

            {/* Scrollable Content Section */}
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
                {/* Filter Buttons */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: width * 0.04,
                        paddingVertical: height * 0.02,
                        paddingTop: height * 0.025,
                    }}
                    className="flex-grow-0"
                >
                    <View className="flex-row">
                        {filterOptions.map((option, index) => renderFilterButton(option, index))}
                    </View>
                </ScrollView>

                {/* Content Section */}
                {loading ? (
                    renderLoadingState()
                ) : error ? (
                    renderErrorState()
                ) : hasTasks ? (
                    <View>
                        {sortedMonthKeys.map((monthYear) => (
                            <View
                                key={monthYear}
                                style={{ marginBottom: height * 0.03 }}
                            >
                                <View
                                    style={{
                                        paddingHorizontal: width * 0.04,
                                        paddingBottom: height * 0.02
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.05
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
                                            opacity: 0.3
                                        }}
                                    />
                                </View>
                                {groupedTasks[monthYear].map((task) => renderTaskItem(task))}
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
                                fontSize: width * 0.055
                            }}
                            className="font-medium text-center"
                        >
                            No Tasks Available
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.placeholderColorOp70,
                                fontSize: width * 0.04,
                                marginTop: height * 0.01
                            }}
                            className="text-center"
                        >
                            {activeFilter === 'All'
                                ? 'Check back later for new tasks!'
                                : `No ${activeFilter.toLowerCase()} tasks found.`
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default TaskPage;