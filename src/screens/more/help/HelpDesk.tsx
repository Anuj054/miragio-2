import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";
import { Colors } from "../../../constants/Colors";
import type { MainStackParamList } from "../../../navigation/types";

// ✅ Translation
import { useTranslation } from "../../../context/TranslationContext";
import { useUser } from "../../../context/UserContext"; // assuming you have user_id here

type Props = NativeStackScreenProps<MainStackParamList, "HelpDesk">;

const { width, height } = Dimensions.get("window");

const HelpDesk: React.FC<Props> = ({ navigation }) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === "hi";

    // ✅ If you store user_id in context
    const { user } = useUser();
    const userId = user?.id ?? 0;

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleBackPress = (): void => navigation.goBack();

    const submitTicket = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert(
                isHi ? "त्रुटि" : "Error",
                isHi
                    ? "कृपया विषय और संदेश दोनों दर्ज करें।"
                    : "Please enter both subject and message."
            );
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                "https://netinnovatus.tech/miragio_task/api/api.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "add_supportticket",
                        user_id: userId,
                        subject,
                        message,
                    }),
                }
            );
            const data = await res.json();
            if (data.status === "success") {
                Alert.alert(
                    isHi ? "सफल" : "Success",
                    isHi
                        ? "सपोर्ट टिकट सफलतापूर्वक बनाया गया!"
                        : "Support ticket created successfully!"
                );
                setSubject("");
                setMessage("");
            } else {
                Alert.alert(
                    isHi ? "त्रुटि" : "Error",
                    data.message || (isHi ? "कुछ गलत हुआ।" : "Something went wrong.")
                );
            }
        } catch (err) {
            Alert.alert(
                isHi ? "त्रुटि" : "Error",
                isHi ? "नेटवर्क त्रुटि, पुनः प्रयास करें।" : "Network error. Please try again."
            );
        } finally {
            setLoading(false);
        }
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
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="items-center justify-center"
                            style={{ width: width * 0.1, height: width * 0.1 }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.04, height: width * 0.06 }} />
                        </TouchableOpacity>

                        <View className="flex-1 items-center">
                            <Text
                                style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.075 }}
                                className="font-medium"
                            >
                                {isHi ? "सहायता डेस्क" : "Help Desk"}
                            </Text>
                        </View>

                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full bg-white" style={{ height: 1 }} />
            </View>

            {/* ===== Form ===== */}
            <ScrollView
                className="flex-1 px-5 py-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
            >
                <Text className="text-white text-base mb-2">
                    {isHi
                        ? "कृपया अपनी समस्या या प्रश्न के बारे में विवरण प्रदान करें।"
                        : "Please provide details about your issue or query."}
                </Text>

                {/* Subject */}
                <TextInput
                    className="bg-gray-800 text-white rounded-md px-4 py-3 mb-4"
                    placeholder={isHi ? "विषय दर्ज करें" : "Enter Subject"}
                    placeholderTextColor="#999"
                    value={subject}
                    onChangeText={setSubject}
                />

                {/* Message */}
                <TextInput
                    className="bg-gray-800 text-white rounded-md px-4 py-3 mb-4"
                    placeholder={isHi ? "अपना संदेश लिखें" : "Enter Message"}
                    placeholderTextColor="#999"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={6}
                    style={{ textAlignVertical: "top" }}
                />

                <TouchableOpacity
                    onPress={submitTicket}
                    disabled={loading}
                    className="bg-[#078FCA] rounded-md py-4 items-center"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">
                            {isHi ? "टिकट सबमिट करें" : "Submit Ticket"}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default HelpDesk;
