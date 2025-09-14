import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profilephoto from "../../assets/images/profilephoto.png";
import profileimg from "../../assets/images/profileimg.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../Navigation/types";

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
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <ActivityIndicator size="large" color={Colors.light.whiteFfffff} />
                <Text style={{ color: Colors.light.whiteFfffff }} className="mt-4 text-lg">
                    Loading profile...
                </Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-lg">
                    No user data available
                </Text>
                <TouchableOpacity
                    onPress={handleBackPress}
                    className="mt-4 px-6 py-3 rounded-lg"
                    style={{ backgroundColor: Colors.light.bgBlueBtn }}
                >
                    <Text style={{ color: Colors.light.whiteFfffff }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <View className="relative">
                {/* Background image */}
                <Image source={bg2} resizeMode="cover" className="w-full h-full" />

                {/* Header overlay content with navigation and profile */}
                <View className="absolute inset-0 flex items-center top-[70px]">
                    {/* Back button */}
                    <TouchableOpacity
                        className="absolute left-[10px]"
                        onPress={handleBackPress}
                    >
                        {icons && (
                            <Image source={icons.back} className="w-[25px] h-[30px] mx-4" />
                        )}
                    </TouchableOpacity>

                    {/* Page title */}
                    <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-semibold">
                        User Profile
                    </Text>

                    {/* Profile photo button */}
                    <TouchableOpacity style={{ backgroundColor: Colors.light.whiteFfffff }} className="absolute right-[15px] -top-[5px] w-[45px] h-[45px] rounded-full">
                        <Image
                            source={profilephoto}
                            className="h-[45px] w-[45px] rounded-full"
                        />
                    </TouchableOpacity>
                </View>

                {/* =================== SCROLLABLE CONTENT SECTION =================== */}
                <ScrollView
                    style={{ backgroundColor: Colors.light.blackPrimary }}
                    className="flex-1 absolute top-[130px] h-full w-full"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 250 }}
                >
                    <View className="px-5">
                        {/* =================== USER PROFILE CARD =================== */}
                        <View style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }} className="rounded-[10px] p-2 border-l-4 mt-10">
                            <View className="flex flex-row">
                                {/* Profile image */}
                                <View className="mr-2">
                                    <Image
                                        source={profileimg}
                                        className="h-[90px] w-[90px]"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* User info section */}
                                <View className="flex-1">
                                    {/* Username and level display */}
                                    <View className="flex flex-row justify-between">
                                        <View className="ml-5 flex-1">
                                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-3xl font-bold mt-4">
                                                {user.username || 'Username'}
                                            </Text>
                                            <Text style={{ color: Colors.light.placeholderColorOp70 }} className="w-full mt-2 text-lg">
                                                Level 1
                                            </Text>
                                        </View>
                                        {/* Arrow navigation icon */}
                                        <TouchableOpacity className="w-[40px] h-[90px] flex items-center justify-center">
                                            <Image source={icons.go} className="w-[12px] h-[12px]" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Wallet and task count */}
                        <View style={{ backgroundColor: Colors.light.backlight2 }} className="p-4 mt-4 rounded-lg">
                            <View className="flex-row justify-between px-3 my-3">
                                {/* Wallet Balance */}
                                <View className="items-center flex-1">
                                    <Text
                                        className="text-lg font-semibold"
                                        style={{ color: Colors.light.whiteFefefe }}
                                    >
                                        {walletBalance || "0"}
                                    </Text>
                                    <Text
                                        className="text-sm"
                                        style={{ color: Colors.light.placeholderColorOp70 }}
                                    >
                                        Wallet Balance
                                    </Text>
                                </View>

                                {/* Completed Tasks */}
                                <View className="items-center flex-1">
                                    <Text
                                        className="text-lg font-semibold"
                                        style={{ color: Colors.light.whiteFefefe }}
                                    >
                                        {loadingTasks ? "..." : completedTasks}
                                    </Text>
                                    <Text
                                        className="text-sm"
                                        style={{ color: Colors.light.placeholderColorOp70 }}
                                    >
                                        Tasks Completed
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* =================== TOTAL WINNING TITLE SECTION =================== */}
                        <View className="flex justify-center items-center py-8">
                            <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-medium">Total Winning</Text>
                        </View>

                        {/* Total winnings summary row */}
                        <View className="flex justify-between flex-row pb-2">
                            <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-medium">
                                Total Winnings
                            </Text>
                            <View className="flex flex-row items-center">
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-medium">Total </Text>
                                <Image source={icons.maincoin} className="w-[16px] h-[16px] mx-1" />
                                <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-medium">500</Text>
                            </View>
                        </View>

                        {/* =================== FIRST STATISTICS BLOCK =================== */}
                        <View className="flex">
                            {/* Stats header with icon and title */}
                            <View style={{ backgroundColor: Colors.light.backlight2 }} className="flex flex-row rounded-t-[10px] p-3 items-center">
                                <Image source={profileimg} className="w-[30px] h-[30px]" />
                                <View className="flex flex-row items-center justify-between flex-1 ml-3">
                                    <Text style={{ color: Colors.light.whiteFfffff }} className="font-bold text-xl">Games Played</Text>
                                    <View className="flex flex-row items-center">
                                        <Image source={icons.maincoin} className="h-[25px] w-[25px]" />
                                        <Text style={{ color: Colors.light.whiteFfffff }} className="font-bold text-xl ml-2">5,009</Text>
                                    </View>
                                </View>
                            </View>
                            {/* Stats content with achievements and games data */}
                            <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="px-5 py-2 rounded-b-[10px]">
                                <View className="flex flex-row justify-between">
                                    <View>
                                        <Text style={{ color: Colors.light.backlight2 }} className="font-bold text-2xl">745</Text>
                                        <Text style={{ color: Colors.light.backlight2 }} className="text-2xl">Achievements</Text>
                                    </View>
                                    <View className="flex items-end">
                                        <Text style={{ color: Colors.light.backlight2 }} className="font-bold text-2xl">750</Text>
                                        <Text style={{ color: Colors.light.backlight2 }} className="text-2xl">Games Played</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* =================== SECOND STATISTICS BLOCK =================== */}
                        <View className="flex pt-8">
                            {/* Stats header with icon and title */}
                            <View style={{ backgroundColor: Colors.light.backlight2 }} className="flex flex-row rounded-t-[10px] p-3 items-center">
                                <Image source={profileimg} className="w-[30px] h-[30px]" />
                                <View className="flex flex-row items-center justify-between flex-1 ml-3">
                                    <Text style={{ color: Colors.light.whiteFfffff }} className="font-bold text-xl">Achievements</Text>
                                    <View className="flex flex-row items-center">
                                        <Image source={icons.maincoin} className="h-[25px] w-[25px]" />
                                        <Text style={{ color: Colors.light.whiteFfffff }} className="font-bold text-xl ml-2">5,009</Text>
                                    </View>
                                </View>
                            </View>
                            {/* Stats content with games played data */}
                            <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="px-5 py-2 rounded-b-[10px]">
                                <View className="flex flex-row justify-between">
                                    <View>
                                        <Text style={{ color: Colors.light.backlight2 }} className="font-bold text-2xl">120</Text>
                                        <Text style={{ color: Colors.light.backlight2 }} className="text-2xl">Games Played</Text>
                                    </View>
                                    <View className="flex items-end">
                                        <Text style={{ color: Colors.light.backlight2 }} className="font-bold text-2xl">1234</Text>
                                        <Text style={{ color: Colors.light.backlight2 }} className="text-2xl">Played</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* =================== THIRD STATISTICS BLOCK =================== */}
                        <View className="flex pt-8">
                            {/* Stats header with icon and title */}
                            <View style={{ backgroundColor: Colors.light.backlight2 }} className="flex flex-row rounded-t-[10px] p-3 items-center">
                                <Image source={profileimg} className="w-[30px] h-[30px]" />
                                <View className="flex flex-row items-center justify-between flex-1 ml-3">
                                    <Text style={{ color: Colors.light.whiteFfffff }} className="font-bold text-xl">Achievements</Text>
                                    <View className="flex flex-row items-center">
                                        <Image source={icons.maincoin} className="h-[25px] w-[25px]" />
                                        <Text style={{ color: Colors.light.whiteFfffff }} className="font-bold text-xl ml-2">5,009</Text>
                                    </View>
                                </View>
                            </View>
                            {/* Stats content with games played data */}
                            <View style={{ backgroundColor: Colors.light.whiteFfffff }} className="px-5 py-2 rounded-b-[10px]">
                                <View className="flex flex-row justify-between">
                                    <View>
                                        <Text style={{ color: Colors.light.backlight2 }} className="font-bold text-2xl">120</Text>
                                        <Text style={{ color: Colors.light.backlight2 }} className="text-2xl">Games Played</Text>
                                    </View>
                                    <View className="flex items-end">
                                        <Text style={{ color: Colors.light.backlight2 }} className="font-bold text-2xl">1234</Text>
                                        <Text style={{ color: Colors.light.backlight2 }} className="text-2xl">Played</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* =================== BOTTOM ACTION BUTTONS =================== */}
                        <View className="flex flex-row mt-14 justify-between">
                            {/* FIXED: Edit Profile Button */}
                            <CustomGradientButton
                                text="Edit Profile"
                                width={180}
                                height={50}
                                borderRadius={10}
                                fontSize={18}
                                fontWeight="600"
                                textColor={Colors.light.whiteFfffff}
                                onPress={handleEditProfilePress}
                            />
                            {/* Game History Button */}
                            <TouchableOpacity
                                style={{ backgroundColor: Colors.light.backlight2 }}
                                className="rounded-[10px] w-[180px] h-[50px] flex items-center justify-center"
                            >
                                <Text style={{ color: Colors.light.whiteFfffff }} className="font-medium text-xl">Game History</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default UserProfile;
