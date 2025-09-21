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
import { WebView } from 'react-native-webview';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import { Colors } from "../../constants/Colors";
import { useTranslation } from '../../context/TranslationContext';

const { width, height } = Dimensions.get('window');

type NavigationProp = any;

interface InstructionStep {
    en: string;
    hi: string;
}
interface TaskInstructions {
    videoUrl: string;
    steps: InstructionStep[];
    title: { en: string; hi: string };
}

const Instructions = () => {
    const navigation = useNavigation<NavigationProp>();
    const { currentLanguage } = useTranslation();   // <-- from your TranslationContext
    const isHindi = currentLanguage === 'hi';

    const handleBackPress = () => {
        navigation.goBack();
    };

    // Convert YouTube URL to embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    };

    // Bilingual instructions
    const dummyInstructions: TaskInstructions = {
        title: {
            en: "Complete Social Media Marketing Campaign",
            hi: "सोशल मीडिया मार्केटिंग अभियान पूरा करें"
        },
        videoUrl: "https://youtu.be/UUVE5db78cc?si=y0Pwr1lHYo3nM3os",
        steps: [
            {
                en: "Start by watching the instructional video above to understand the complete process",
                hi: "पूरा प्रक्रिया समझने के लिए ऊपर दिया गया निर्देशात्मक वीडियो देखें"
            },
            {
                en: "Create a comprehensive social media strategy document outlining your target audience, content themes, and posting schedule",
                hi: "अपने लक्षित दर्शकों, सामग्री विषयों और पोस्टिंग शेड्यूल को दर्शाते हुए एक विस्तृत सोशल मीडिया रणनीति दस्तावेज़ तैयार करें"
            },
            {
                en: "Design 5 unique social media posts using Canva or similar design tools, ensuring brand consistency",
                hi: "कैनवा या समान डिज़ाइन टूल का उपयोग करके 5 अनोखे सोशल मीडिया पोस्ट डिज़ाइन करें और ब्रांड की एकरूपता सुनिश्चित करें"
            },
            {
                en: "Write engaging captions for each post, including relevant hashtags and call-to-action elements",
                hi: "प्रत्येक पोस्ट के लिए आकर्षक कैप्शन लिखें, जिनमें उपयुक्त हैशटैग और कॉल-टू-एक्शन तत्व शामिल हों"
            },
            {
                en: "Schedule your posts across at least 3 different social media platforms (Facebook, Instagram, Twitter)",
                hi: "अपनी पोस्ट को कम से कम 3 अलग-अलग सोशल मीडिया प्लेटफार्म (फेसबुक, इंस्टाग्राम, ट्विटर) पर शेड्यूल करें"
            },
            {
                en: "Create a content calendar showing when each post will go live over the next 2 weeks",
                hi: "अगले दो हफ्तों में प्रत्येक पोस्ट कब लाइव होगी यह दिखाने वाला एक कंटेंट कैलेंडर तैयार करें"
            },
            {
                en: "Take screenshots of your scheduled posts and design work as proof of completion",
                hi: "निर्धारित पोस्ट और डिज़ाइन कार्य के स्क्रीनशॉट लें, ताकि कार्य पूरा होने का प्रमाण प्रस्तुत कर सकें"
            },
            {
                en: "Compile all materials (strategy document, designs, captions, calendar) into a single PDF report",
                hi: "सभी सामग्रियों (रणनीति दस्तावेज़, डिज़ाइन, कैप्शन, कैलेंडर) को एक ही पीडीएफ रिपोर्ट में संकलित करें"
            },
            {
                en: "Upload your completed work using the 'Upload Photo' option or provide a link to your shared document",
                hi: "‘अपलोड फोटो’ विकल्प का उपयोग करके अपना तैयार कार्य अपलोड करें या साझा किए गए दस्तावेज़ का लिंक प्रदान करें"
            },
            {
                en: "Include a brief reflection (100–200 words) on what you learned during this process",
                hi: "इस प्रक्रिया के दौरान आपने क्या सीखा, उस पर 100–200 शब्दों का संक्षिप्त विवरण लिखें"
            },
            {
                en: "Submit your work by clicking 'Mark as Complete' and wait for admin review",
                hi: "‘मार्क ऐज़ कम्प्लीट’ पर क्लिक करके अपना कार्य सबमिट करें और एडमिन समीक्षा की प्रतीक्षा करें"
            },
            {
                en: "Be prepared to make revisions if feedback is provided during the review process",
                hi: "समीक्षा प्रक्रिया के दौरान यदि प्रतिक्रिया दी जाती है तो संशोधन करने के लिए तैयार रहें"
            }
        ]
    };

    const embedUrl = getEmbedUrl(dummyInstructions.videoUrl);

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* HEADER */}
            <View style={{ height: height * 0.14 }}>
                <ImageBackground source={bg2} resizeMode="cover" className="w-full h-full absolute" />
                <View className="flex-1" style={{ paddingTop: height * 0.05, paddingHorizontal: width * 0.04 }}>
                    <View className="flex-row items-center justify-between" style={{ height: height * 0.08 }}>
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{ width: width * 0.1, height: width * 0.1, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.06, height: width * 0.08 }} />
                        </TouchableOpacity>
                        <View className="flex-1 items-center">
                            <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.06 }} className="font-medium">
                                {isHindi ? "निर्देश" : "Instructions"}
                            </Text>
                        </View>
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full" style={{ backgroundColor: Colors.light.whiteFfffff, height: 1 }} />
            </View>

            {/* CONTENT */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12, paddingHorizontal: width * 0.04 }}>

                {/* TITLE */}
                <View style={{ paddingVertical: height * 0.03 }}>
                    <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.055, textAlign: 'center' }} className="font-semibold">
                        {isHindi ? dummyInstructions.title.hi : dummyInstructions.title.en}
                    </Text>
                </View>

                {/* VIDEO */}
                {embedUrl && (
                    <View style={{ marginBottom: height * 0.03 }}>
                        <View style={{ width: '100%', height: height * 0.23, backgroundColor: Colors.light.backlight2, borderRadius: 12 }} className="overflow-hidden">
                            <WebView source={{ uri: embedUrl }} style={{ flex: 1 }} />
                        </View>
                    </View>
                )}

                {/* STEPS */}
                <View style={{ marginBottom: height * 0.03 }}>
                    <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.05, marginBottom: height * 0.02 }} className="font-semibold">
                        {isHindi ? "पूरा करने के चरण:" : "Steps to Complete:"}
                    </Text>
                    {dummyInstructions.steps.map((step, index) => (
                        <View key={index}
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                borderLeftColor: Colors.light.bgBlueBtn,
                                borderLeftWidth: 4,
                                borderRadius: 12,
                                marginBottom: height * 0.012,
                                padding: width * 0.04
                            }}
                        >
                            <View className="flex-row items-start">
                                <View style={{
                                    backgroundColor: Colors.light.bgBlueBtn,
                                    width: width * 0.08,
                                    height: width * 0.08,
                                    borderRadius: (width * 0.08) / 2,
                                    marginRight: width * 0.03
                                }} className="items-center justify-center">
                                    <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.035 }} className="font-bold">
                                        {index + 1}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.04, lineHeight: width * 0.06 }}>
                                        {isHindi ? step.hi : step.en}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* SUBMISSION REQUIREMENTS */}
                <View style={{ marginBottom: height * 0.03 }}>
                    <View style={{ backgroundColor: Colors.light.backlight2, borderRadius: 12, padding: width * 0.04 }}>
                        <Text style={{ color: Colors.light.bgBlueBtn, fontSize: width * 0.04, marginBottom: height * 0.01 }} className="font-semibold">
                            {isHindi ? "📤 सबमिशन आवश्यकताएँ:" : "📤 Submission Requirements:"}
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.035, lineHeight: width * 0.06 }}>
                            • {isHindi ? "सभी घटकों के साथ पीडीएफ रिपोर्ट" : "PDF report with all components"}
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.035, lineHeight: width * 0.06 }}>
                            • {isHindi ? "निर्धारित पोस्ट के स्क्रीनशॉट" : "Screenshots of scheduled posts"}
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.035, lineHeight: width * 0.06 }}>
                            • {isHindi ? "कंटेंट कैलेंडर (Excel/Google Sheets)" : "Content calendar (Excel/Google Sheets)"}
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.035, lineHeight: width * 0.06 }}>
                            • {isHindi ? "रिफ्लेक्शन दस्तावेज़ (100-200 शब्द)" : "Reflection document (100-200 words)"}
                        </Text>
                    </View>
                </View>

                {/* ACTION BUTTON */}
                <View style={{ marginBottom: height * 0.02 }}>
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.light.bgBlueBtn, height: height * 0.055, borderRadius: 12 }}
                        className="items-center justify-center"
                        onPress={handleBackPress}
                    >
                        <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.05 }} className="font-semibold">
                            {isHindi ? "समझ गया, शुरू करें!" : "Got It, Let's Start!"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default Instructions;
