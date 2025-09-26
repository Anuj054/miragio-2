import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";

import type { MainStackParamList } from "../../../navigation/types";
import { useTranslation } from '../../../context/TranslationContext';

type Props = NativeStackScreenProps<MainStackParamList, 'PrivacyPolicy'>;

const { width, height } = Dimensions.get('window');

const PrivacyPolicy = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const handleBackPress = (): void => {
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" className="absolute w-full h-full" />
                <View
                    className="flex-1 px-4"
                    style={{ paddingTop: height * 0.05, paddingBottom: height * 0.02 }}
                >
                    <View className="flex-row items-center justify-between" style={{ height: height * 0.08 }}>
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="items-center justify-center"
                            style={{ width: width * 0.1, height: width * 0.1 }}
                        >
                            <Image
                                source={icons.back}
                                style={{ width: width * 0.04, height: width * 0.06 }}
                            />
                        </TouchableOpacity>

                        <View className="flex-1 items-center">
                            <Text className="text-white text-xl font-semibold">
                                {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
                            </Text>
                        </View>
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full bg-white" style={{ height: 1 }} />
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-5 py-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
            >


                <Text className="text-white text-lg font-semibold mt-4 mb-2"> Scope of This Policy</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    This policy applies to all users of Miragio App, including registered members, referred
                    users, and visitors who interact with our platform. It covers data collected during
                    registration, login, and use of the app; data shared while performing reel-based earning
                    tasks; financial and transactional information for withdrawals and payouts; and
                    communication through support and promotional channels.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2"> Information We Collect</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    a) Personal Information: Name, email, phone, identity proof, and payment details
                    (UPI/bank/wallets).{'\n'}
                    b) Social Media Information: Linked social profiles, reel links, hashtags, and tags.{'\n'}
                    c) Device & Technical Information: Device model, OS, IP address, analytics, and location
                    (for fraud detection).{'\n'}
                    d) Transaction Information: Earnings, withdrawal requests, and history.
                </Text>

                {/* ...continue the same pattern for all other sections... */}

                <Text className="text-white text-lg font-semibold mt-4 mb-2"> Contact Us</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Email: info@miragiofintech.com{'\n'}
                    Company: Virtual App Studios{'\n'}
                    Address: Catriona Apartments, Ambience Island, Gurugram, Haryana, India
                </Text>
            </ScrollView>
        </View>
    );
};

export default PrivacyPolicy;
