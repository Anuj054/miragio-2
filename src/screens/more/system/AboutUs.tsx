// src/screens/more/AboutUs.tsx
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Dimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";
import { Colors } from "../../../constants/Colors";
import type { MainStackParamList } from "../../../navigation/types";

// ✅ Translation hook
import { useTranslation } from "../../../context/TranslationContext";

type Props = NativeStackScreenProps<MainStackParamList, "AboutUs">;

const { width, height } = Dimensions.get("window");

const AboutUs: React.FC<Props> = ({ navigation }) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === "hi";

    const handleBackPress = (): void => {
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ===== Header ===== */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" className="absolute w-full h-full" />
                <View
                    className="flex-1 px-4"
                    style={{ paddingTop: height * 0.05, paddingBottom: height * 0.02 }}
                >
                    <View className="flex-row items-center justify-between" style={{ height: height * 0.08 }}>
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="items-center justify-center"
                            style={{ width: width * 0.1, height: width * 0.1 }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.04, height: width * 0.06 }} />
                        </TouchableOpacity>

                        {/* Centered Title */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.075 }}
                                className="font-medium"
                            >
                                {isHi ? "हमारे बारे में" : "About Us"}
                            </Text>
                        </View>

                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full bg-white" style={{ height: 1 }} />
            </View>

            {/* ===== Body Content ===== */}
            <ScrollView
                className="flex-1 px-5 py-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
            >
                {/* Intro */}
                <Text className="text-white text-lg font-semibold mb-2">
                    {isHi ? "मिराजियो ऐप के बारे में" : "About the Miragio App"}
                </Text>
                <Text className="text-gray-300 text-base leading-6 mb-6">
                    {isHi
                        ? "मिराजियो एक ऐसा प्लेटफ़ॉर्म है जहां उपयोगकर्ता सोशल मीडिया पर रील्स अपलोड करके असली पैसे कमा सकते हैं। हमारा लक्ष्य ब्रांड्स और क्रिएटर्स को जोड़कर दोनों के लिए नए अवसर पैदा करना है। हम सुरक्षित लेन-देन, तेज़ भुगतान और पारदर्शी कार्य प्रक्रिया पर विश्वास करते हैं।"
                        : "Miragio is a platform where users can earn real money by uploading short-form reels on their social media accounts. Our mission is to connect brands with creators, providing genuine earning opportunities while ensuring secure transactions, fast payouts, and a transparent workflow."}
                </Text>

                {/* Our Mission */}
                <Text className="text-white text-lg font-semibold mb-2">
                    {isHi ? "हमारा उद्देश्य" : "Our Mission"}
                </Text>
                <Text className="text-gray-300 text-base leading-6 mb-6">
                    {isHi
                        ? "हम ब्रांड्स को उच्च गुणवत्ता वाले कंटेंट क्रिएटर्स से जोड़ने और क्रिएटर्स को उनकी प्रतिभा से कमाई करने में मदद करने के लिए प्रतिबद्ध हैं।"
                        : "We are committed to bridging the gap between brands and quality content creators, empowering creators to monetize their talent and brands to reach wider audiences."}
                </Text>

                {/* Contact Information */}
                <Text className="text-white text-lg font-semibold mb-2">
                    {isHi ? "संपर्क जानकारी" : "Contact Information"}
                </Text>
                <Text className="text-gray-300 text-base leading-6 mb-10">
                    {isHi
                        ? `ईमेल: info@miragiofintech.com\nकंपनी: Virtual App Studios\nपता: कैट्रियोना अपार्टमेंट्स, एम्बिएंस आइलैंड, गुरुग्राम, हरियाणा, इंडिया`
                        : `Email: info@miragiofintech.com\nCompany: Virtual App Studios\nAddress: Catriona Apartments, Ambience Island, Gurugram, Haryana, India`}
                </Text>
            </ScrollView>
        </View>
    );
};

export default AboutUs;
