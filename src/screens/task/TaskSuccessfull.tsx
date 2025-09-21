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

// Assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import profilephoto from "../../assets/images/profilephoto.png";
import tasksuccess from "../../assets/images/tasksuccess.png";
import taskcompletedots from "../../assets/images/taskcompletedots.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";

// ✅ Import translation context
import { useTranslation } from "../../context/TranslationContext";

const { width, height } = Dimensions.get('window');
type NavigationProp = any;

const TaskSuccessful = () => {
    const navigation = useNavigation<NavigationProp>();
    const { currentLanguage } = useTranslation();
    const isHindi = currentLanguage === 'hi';

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

            {/* ---------- HEADER ---------- */}
            <View style={{ height: height * 0.14 }}>
                <ImageBackground source={bg2} resizeMode="cover" className="w-full h-full absolute" />
                <View
                    className="flex-1"
                    style={{ paddingTop: height * 0.05, paddingBottom: height * 0.02, paddingHorizontal: width * 0.04 }}
                >
                    <View className="flex-row items-center justify-between" style={{ height: height * 0.08 }}>
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{ width: width * 0.1, height: width * 0.1, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.06, height: width * 0.08 }} />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text
                            style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.075 }}
                            className="font-medium"
                        >
                            {isHindi ? 'कार्य पूर्ण' : 'Task Complete'}
                        </Text>

                        {/* Profile */}
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
                                style={{ height: width * 0.11, width: width * 0.11, borderRadius: (width * 0.11) / 2 }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="absolute bottom-0 w-full" style={{ backgroundColor: Colors.light.whiteFfffff, height: 1 }} />
            </View>

            {/* ---------- MAIN CONTENT ---------- */}
            <View className="flex-1" style={{ paddingBottom: height * 0.11 }}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: width * 0.05,
                        paddingTop: height * 0.06,
                        paddingBottom: height * 0.025
                    }}
                >
                    <View className="flex items-center justify-center w-full">
                        {/* Success icon */}
                        <View className="items-center z-10" style={{ marginBottom: -(height * 0.075) }}>
                            <Image
                                source={tasksuccess}
                                style={{ height: height * 0.22, width: height * 0.22 }}
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
                                borderRadius: 12,
                                padding: width * 0.06,
                                minHeight: height * 0.39,
                                width: '100%'
                            }}
                            className="items-center justify-center"
                        >
                            <View className="items-center" style={{ marginTop: height * 0.05 }}>
                                <Text
                                    style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.06, marginBottom: height * 0.02 }}
                                    className="font-bold"
                                >
                                    {isHindi ? 'बहुत बढ़िया!' : 'Great!'}
                                </Text>

                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.045,
                                        lineHeight: width * 0.06,
                                        textAlign: 'center',
                                        marginBottom: height * 0.03,
                                        paddingHorizontal: width * 0.03
                                    }}
                                >
                                    {isHindi
                                        ? 'आपने अपना कार्य शानदार ढंग से पूरा किया है। हम जल्द ही आपको अगला कार्य प्रदान करेंगे।'
                                        : 'You have completed your task very well. We will assign you another task as soon as possible.'}
                                </Text>

                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.05,
                                        textAlign: 'center',
                                        marginBottom: height * 0.02
                                    }}
                                    className="font-extrabold"
                                >
                                    {isHindi ? 'कार्य सफलतापूर्वक पूरा हुआ' : 'Task Successfully Completed'}
                                </Text>

                                <Image
                                    source={taskcompletedots}
                                    style={{ height: height * 0.012, width: width * 0.095 }}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* ---------- BOTTOM BUTTON ---------- */}
            <View
                style={{
                    position: 'absolute',
                    bottom: height * 0.14,
                    left: 0,
                    right: 0,
                    backgroundColor: Colors.light.blackPrimary,
                    paddingHorizontal: width * 0.05,
                    paddingVertical: height * 0.02
                }}
            >
                <CustomGradientButton
                    text={isHindi ? 'होम पर वापस जाएँ' : 'Back to home'}
                    width={width * 0.9}
                    height={height * 0.057}
                    borderRadius={15}
                    fontSize={width * 0.055}
                    fontWeight="500"
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleBackToHome}
                />
            </View>
        </View>
    );
};

export default TaskSuccessful;
