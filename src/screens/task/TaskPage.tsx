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
    StatusBar
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

const TaskPage = ({ navigation }: Props) => { // FIXED: Added navigation prop
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

    // FIXED: Navigation handlers
    const handleTaskNavigation = (task: Task) => {
        if (task.status === 'completed') {
            // FIXED: Use type assertion if needed
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

        navigation.getParent()?.navigate('UserProfile', { from: 'taskpage' });
    };


    const handleProfilePress = () => {
        // FIXED: Navigate to UserProfile in Main Stack
        navigation.getParent()?.navigate('UserProfile', { from: 'taskpage' });
    };

    // Render functions
    const renderFilterButton = (option: FilterOption, index: number) => (
        <TouchableOpacity
            key={option}
            onPress={() => {
                setActiveFilter(option);
            }}
            className={`px-4 py-2 rounded-full ${index < filterOptions.length - 1 ? 'mr-3' : ''
                } ${activeFilter === option ? 'border-0' : 'border'}`}
            style={{
                backgroundColor: activeFilter === option ? Colors.light.bgBlueBtn : 'transparent',
                borderColor: activeFilter === option ? 'transparent' : Colors.light.secondaryText,
                minWidth: 80,
            }}
        >
            <Text
                className={`text-center text-sm ${activeFilter === option ? 'font-bold' : 'font-normal'
                    }`}
                style={{
                    color: Colors.light.whiteFefefe,
                }}
            >
                {option}
            </Text>
        </TouchableOpacity>
    );

    const renderLoadingState = () => (
        <View className="items-center justify-center py-10">
            <Text
                className="text-xl font-medium"
                style={{ color: Colors.light.placeholderColorOp70 }}
            >
                Loading tasks...
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View className="items-center justify-center py-10 px-4">
            <Text
                className="text-xl font-medium text-center mb-4"
                style={{ color: Colors.light.placeholderColorOp70 }}
            >
                {error}
            </Text>
            <TouchableOpacity
                onPress={refreshTasks}
                className="px-6 py-3 rounded-lg"
                style={{ backgroundColor: Colors.light.bgBlueBtn }}
            >
                <Text
                    className="text-base font-semibold"
                    style={{ color: Colors.light.whiteFefefe }}
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
                marginHorizontal: 16,
                marginBottom: 16
            }}
            className="w-auto rounded-xl p-4 border-l-4 "
        >
            {/* Header section with icon, title and arrow */}
            <View className="flex-row items-center mb-3">
                {/* Task Icon */}
                <View className="mr-4">
                    <Image
                        source={task.icon}
                        className="h-12 w-12"
                        resizeMode="contain"
                        style={{ opacity: task.status === 'rejected' ? 0.5 : 1 }}
                    />
                </View>

                {/* Title and Description Container */}
                <View className="flex-1 mr-3">
                    <Text
                        style={{
                            color: task.status === 'rejected'
                                ? Colors.light.placeholderColorOp70
                                : Colors.light.whiteFefefe
                        }}
                        className="text-lg mb-1 font-normal"
                    >
                        {task.title}
                    </Text>
                    <Text
                        style={{ color: Colors.light.placeholderColorOp70 }}
                        className="text-sm leading-5"
                    >
                        {task.description}
                    </Text>
                </View>

                {/* Arrow Icon */}
                <TouchableOpacity onPress={() => handleTaskNavigation(task)}>
                    <Image
                        source={icons.go}
                        className="w-[12px] h-[12px] mt-1"
                        style={{
                            opacity: task.status === 'rejected' ? 0.5 : 1
                        }}
                    />
                </TouchableOpacity>
            </View>

            {/* Button and Coin Section */}
            <View className="flex-row items-center justify-between">
                {/* Status Button Container */}
                <View className="flex-1 mr-4">
                    {task.status === 'rejected' && (
                        <CustomRedGradientButton
                            text="Rejected"
                            width={260}
                            height={35}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={16}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                            disabled={true}
                        />
                    )}

                    {task.status === 'pending' && (
                        <CustomOrangeGradientButton
                            text="Pending Review"
                            width={260}
                            height={35}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={16}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                            disabled={true}
                        />
                    )}

                    {task.status === 'completed' && (
                        <CustomGreenGradientButton
                            text="Completed"
                            width={260}
                            height={35}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={16}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                        />
                    )}

                    {task.status === 'upcoming' && (
                        <CustomGradientButton
                            text="Do It Now"
                            width={260}
                            height={35}
                            fontWeight={600}
                            borderRadius={10}
                            fontSize={16}
                            textColor="white"
                            onPress={() => handleTaskNavigation(task)}
                        />
                    )}
                </View>

                {/* Coin and Reward Display */}
                <View className=" flex flex-row items-center ml-3">
                    <Image
                        source={icons.maincoin}
                        className="w-[25px] h-[25px] "
                        style={{ opacity: task.status === 'rejected' ? 0.5 : 1 }}
                    />
                    <Text
                        style={{
                            color: task.status === 'rejected'
                                ? Colors.light.placeholderColorOp70
                                : Colors.light.whiteFefefe
                        }}
                        className="text-base font-semibold pl-1"
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

            {/* =================== FIXED HEADER SECTION =================== */}
            <View className="relative h-32">
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header Content with proper flexbox layout */}
                <View className="flex-1 pt-12 pb-4 px-4">
                    {/* Header row with proper spacing */}
                    <View className="flex-row items-center justify-between h-16">
                        {/* Back button */}
                        <TouchableOpacity

                            className="w-10 h-10 items-center justify-center"
                        >

                        </TouchableOpacity>

                        {/* Centered title */}
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-3xl font-medium pt-1"
                        >
                            Tasks
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

                {/* Bottom border */}
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
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        paddingTop: 20,
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
                                {groupedTasks[monthYear].map((task) => renderTaskItem(task))}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="items-center justify-center py-10">
                        <Text
                            className="text-2xl font-medium text-center"
                            style={{ color: Colors.light.placeholderColorOp70 }}
                        >
                            No Tasks Available
                        </Text>
                        <Text
                            className="text-base mt-2 text-center"
                            style={{ color: Colors.light.placeholderColorOp70 }}
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
