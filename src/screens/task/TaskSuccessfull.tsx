import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    ImageBackground
} from "react-native";
import { useNavigation } from '@react-navigation/native';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profilephoto from "../../assets/images/profilephoto.png";
import tasksuccess from "../../assets/images/tasksuccess.png";
import taskcompletedots from "../../assets/images/taskcompletedots.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";

// Navigation types
type NavigationProp = any;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TaskSuccessful = () => {
    // Get navigation
    const navigation = useNavigation<NavigationProp>();

    // Navigation handlers
    const handleBackPress = () => {
        navigation.navigate('TaskTab', { screen: 'TaskPage' });
    };

    const handleProfilePress = () => {
        navigation.navigate('UserProfile', { from: 'task/tasksuccessful' });
    };

    const handleBackToHome = () => {
        navigation.navigate('TaskTab', { screen: 'TaskPage' });
    };

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <ImageBackground
                source={bg2}
                resizeMode="cover"
                className="h-32"
                style={{ position: 'relative' }}
            >
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
                                className="w-6 h-8"
                            />
                        </TouchableOpacity>

                        {/* Centered title */}
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-3xl font-medium"
                        >
                            Task Complete
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

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </ImageBackground>

            {/* =================== MAIN CONTENT CONTAINER =================== */}
            <View className="flex-1" style={{ paddingBottom: 90 }}>
                {/* =================== SCROLLABLE CONTENT SECTION =================== */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 50,
                        paddingBottom: 20
                    }}
                >
                    {/* Success message container */}
                    <View className="flex items-center justify-center w-full">
                        {/* Success image positioned above the card */}
                        <View className="items-center mb-[-60px] z-10">
                            <Image
                                source={tasksuccess}
                                className="h-[200px] w-[200px]"
                                resizeMode="contain"
                            />
                        </View>

                        {/* Success message card */}
                        <View
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgGreen,
                                borderLeftWidth: 4,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                            className="w-full rounded-xl p-6 min-h-[360px] items-center justify-center"
                        >
                            {/* Success message content */}
                            <View className="mt-14 items-center">
                                <Text
                                    style={{ color: Colors.light.whiteFefefe }}
                                    className="text-2xl font-bold mb-4"
                                >
                                    Great!
                                </Text>

                                <Text
                                    style={{ color: Colors.light.whiteFefefe }}
                                    className="text-center text-lg leading-6 mb-6 px-3"
                                >
                                    You done all your task very good now we will give you another task as soon as possible
                                </Text>

                                <Text
                                    style={{ color: Colors.light.whiteFefefe }}
                                    className="text-xl font-extrabold text-center mb-4"
                                >
                                    Task Successfully completed
                                </Text>

                                {/* Completion dots indicator */}
                                <Image
                                    source={taskcompletedots}
                                    className="h-[10px] w-[38px]"
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* =================== FIXED BOTTOM BUTTON =================== */}
            <View
                className="absolute bottom-28 left-0 right-0 px-5 pb-8"
                style={{
                    backgroundColor: Colors.light.blackPrimary,
                    paddingTop: 16,
                }}
            >
                {/* Back to home button */}
                <CustomGradientButton
                    text="Back to home"
                    width={screenWidth - 40}
                    height={56}
                    borderRadius={15}
                    fontSize={22}
                    fontWeight="500"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleBackToHome}
                />
            </View>
        </View>
    );
};

export default TaskSuccessful;
