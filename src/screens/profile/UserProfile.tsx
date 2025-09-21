import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, StatusBar, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";

import profileimg from "../../assets/images/profileimg.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../navigation/types";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<MainStackParamList, 'UserProfile'>;

const UserProfile = ({ navigation, route }: Props) => {
    const { from } = route.params || {};

    const { user, isLoading: userLoading, refreshUserData } = useUser();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { getUserId, getUserWallet } = useUser();
    const [completedTasks, setCompletedTasks] = useState(0);
    const [loadingTasks, setLoadingTasks] = useState(true);

    const walletBalance = getUserWallet();

    // Fetch completed tasks
    const fetchCompletedTasks = async () => {
        try {
            setLoadingTasks(true);
            const userId = getUserId();
            if (!userId) {
                console.warn("⚠️ No userId available for fetching tasks.");
                return;
            }

            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "get_user_tasksby_id",
                    user_id: userId,
                }),
            });

            const data = await response.json();

            let tasks: any[] = [];

            if (data.status === "success") {
                if (Array.isArray(data.data)) {
                    tasks = data.data;
                } else if (Array.isArray(data.data?.tasks)) {
                    tasks = data.data.tasks;
                }
            }

            const completed = tasks.filter((t: any) => t.task_status === "completed").length;
            setCompletedTasks(completed);
        } catch (err) {
            console.error('Error fetching completed tasks:', err);
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
                    Loading profile...
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
                    No user data available
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
                    <Text style={{ color: Colors.light.whiteFfffff }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== FIXED HEADER SECTION MATCHING OTHER PAGES =================== */}
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
                            User Profile
                        </Text>

                        {/* Empty space for symmetry */}
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
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
                                                marginTop: height * 0.01
                                            }}
                                        >
                                            Level 1
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
                                    Wallet Balance
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
                                    {loadingTasks ? "..." : completedTasks}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035
                                    }}
                                >
                                    Tasks Completed
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* =================== TOTAL WINNING TITLE SECTION =================== */}
                    <View
                        className="flex justify-center items-center"
                        style={{ paddingVertical: height * 0.04 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.075
                            }}
                            className="font-medium"
                        >
                            Total Winning
                        </Text>
                    </View>

                    {/* Total winnings summary row */}
                    <View
                        className="flex justify-between flex-row"
                        style={{ paddingBottom: height * 0.01 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.05
                            }}
                            className="font-medium"
                        >
                            Total Winnings
                        </Text>
                        <View className="flex flex-row items-center">
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05
                                }}
                                className="font-medium"
                            >
                                Total
                            </Text>
                            <Image
                                source={icons.maincoin}
                                style={{
                                    width: width * 0.04,
                                    height: width * 0.04,
                                    marginHorizontal: width * 0.01
                                }}
                            />
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05
                                }}
                                className="font-medium"
                            >
                                500
                            </Text>
                        </View>
                    </View>

                    {/* =================== FIRST STATISTICS BLOCK =================== */}
                    <View className="flex">
                        {/* Stats header with icon and title */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                padding: width * 0.03
                            }}
                            className="flex flex-row items-center"
                        >
                            <Image
                                source={profileimg}
                                style={{
                                    width: width * 0.075,
                                    height: width * 0.075
                                }}
                            />
                            <View
                                className="flex flex-row items-center justify-between flex-1"
                                style={{ marginLeft: width * 0.03 }}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.05
                                    }}
                                    className="font-bold"
                                >
                                    Games Played
                                </Text>
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={icons.maincoin}
                                        style={{
                                            height: width * 0.063,
                                            width: width * 0.063
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.05,
                                            marginLeft: width * 0.02
                                        }}
                                        className="font-bold"
                                    >
                                        5,009
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {/* Stats content with achievements and games data */}
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                paddingHorizontal: width * 0.05,
                                paddingVertical: height * 0.01,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                            }}
                        >
                            <View className="flex flex-row justify-between">
                                <View>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                        className="font-bold"
                                    >
                                        745
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                    >
                                        Achievements
                                    </Text>
                                </View>
                                <View className="flex items-end">
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                        className="font-bold"
                                    >
                                        750
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                    >
                                        Games Played
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* =================== SECOND STATISTICS BLOCK =================== */}
                    <View
                        className="flex"
                        style={{ paddingTop: height * 0.04 }}
                    >
                        {/* Stats header with icon and title */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                padding: width * 0.03
                            }}
                            className="flex flex-row items-center"
                        >
                            <Image
                                source={profileimg}
                                style={{
                                    width: width * 0.075,
                                    height: width * 0.075
                                }}
                            />
                            <View
                                className="flex flex-row items-center justify-between flex-1"
                                style={{ marginLeft: width * 0.03 }}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.05
                                    }}
                                    className="font-bold"
                                >
                                    Achievements
                                </Text>
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={icons.maincoin}
                                        style={{
                                            height: width * 0.063,
                                            width: width * 0.063
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.05,
                                            marginLeft: width * 0.02
                                        }}
                                        className="font-bold"
                                    >
                                        5,009
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {/* Stats content with games played data */}
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                paddingHorizontal: width * 0.05,
                                paddingVertical: height * 0.01,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                            }}
                        >
                            <View className="flex flex-row justify-between">
                                <View>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                        className="font-bold"
                                    >
                                        120
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                    >
                                        Games Played
                                    </Text>
                                </View>
                                <View className="flex items-end">
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                        className="font-bold"
                                    >
                                        1234
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                    >
                                        Played
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* =================== THIRD STATISTICS BLOCK =================== */}
                    <View
                        className="flex"
                        style={{ paddingTop: height * 0.04 }}
                    >
                        {/* Stats header with icon and title */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                padding: width * 0.03
                            }}
                            className="flex flex-row items-center"
                        >
                            <Image
                                source={profileimg}
                                style={{
                                    width: width * 0.075,
                                    height: width * 0.075
                                }}
                            />
                            <View
                                className="flex flex-row items-center justify-between flex-1"
                                style={{ marginLeft: width * 0.03 }}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.05
                                    }}
                                    className="font-bold"
                                >
                                    Achievements
                                </Text>
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={icons.maincoin}
                                        style={{
                                            height: width * 0.063,
                                            width: width * 0.063
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.05,
                                            marginLeft: width * 0.02
                                        }}
                                        className="font-bold"
                                    >
                                        5,009
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {/* Stats content with games played data */}
                        <View
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                paddingHorizontal: width * 0.05,
                                paddingVertical: height * 0.01,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                            }}
                        >
                            <View className="flex flex-row justify-between">
                                <View>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                        className="font-bold"
                                    >
                                        120
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                    >
                                        Games Played
                                    </Text>
                                </View>
                                <View className="flex items-end">
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                        className="font-bold"
                                    >
                                        1234
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.backlight2,
                                            fontSize: width * 0.06
                                        }}
                                    >
                                        Played
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* =================== BOTTOM ACTION BUTTONS =================== */}
                    <View
                        className="flex flex-row justify-between"
                        style={{ marginTop: height * 0.07 }}
                    >
                        {/* Edit Profile Button */}
                        <CustomGradientButton
                            text="Edit Profile"
                            width={width * 0.43}
                            height={height * 0.055}
                            borderRadius={10}
                            fontSize={width * 0.045}
                            fontWeight="600"
                            textColor={Colors.light.whiteFfffff}
                            onPress={handleEditProfilePress}
                        />
                        {/* Game History Button */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderRadius: 10,
                                width: width * 0.43,
                                height: height * 0.055
                            }}
                            className="flex items-center justify-center"
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.05
                                }}
                                className="font-medium"
                            >
                                Game History
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default UserProfile;