import React from "react";
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants";
import { Colors } from "../../constants/Colors";

import { useTranslation } from "../../context/TranslationContext";
import { TranslatedText } from "../../components/TranslatedText";
import type { WalletStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<WalletStackParamList, "FAQ">;

const { width, height } = Dimensions.get("window");

const FAQ: React.FC<Props> = ({ navigation }) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === "hi";

    const handleBackPress = () => navigation.goBack();

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
                    <View
                        className="flex-row items-center justify-between"
                        style={{ height: height * 0.08 }}
                    >
                        {/* Back button */}
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

                        {/* Centered title */}
                        <View className="flex-1 items-center">
                            <TranslatedText
                                style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.075 }}
                                className="font-medium"
                            >
                                {isHi ? "सामान्य प्रश्न" : "FAQs"}
                            </TranslatedText>
                        </View>

                        {/* Spacer */}
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full bg-white" style={{ height: 1 }} />
            </View>

            {/* ===== Content ===== */}
            <ScrollView
                className="flex-1 px-5 py-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
            >
                {faqData.map((item, idx) => (
                    <View key={idx} className="mb-6">
                        <TranslatedText
                            className="text-white text-lg font-semibold mb-2"
                            style={{ lineHeight: 22 }}
                        >
                            {isHi ? item.q_hi : item.q}
                        </TranslatedText>
                        <TranslatedText
                            className="text-gray-300 text-base leading-6"
                            style={{ lineHeight: 22 }}
                        >
                            {isHi ? item.a_hi : item.a}
                        </TranslatedText>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

// ===== FAQ Data with Hindi translations =====
const faqData = [
    {
        q: "What is the Miragio App?",
        q_hi: "मिराजियो ऐप क्या है?",
        a: "Miragio App is a platform where you can earn real money by uploading reels on your social media accounts (Instagram, Facebook, YouTube Shorts, etc.) using the hashtags and tags assigned in each task.",
        a_hi:
            "मिराजियो ऐप एक ऐसा प्लेटफ़ॉर्म है जहाँ आप अपने सोशल मीडिया अकाउंट्स (Instagram, Facebook, YouTube Shorts आदि) पर दिए गए हैशटैग और टैग के साथ रील अपलोड करके वास्तविक पैसे कमा सकते हैं।",
    },
    {
        q: "How does Miragio work?",
        q_hi: "मिराजियो कैसे काम करता है?",
        a: "1. Download and register on the Miragio App.\n2. Accept a reel task from the app.\n3. Upload the reel on your social media account with the required hashtags and tags.\n4. Submit the reel link or screenshot inside Miragio.\n5. Your reel will be verified within 8–9 days.\n6. Once approved, your earnings are added to your Miragio wallet.",
        a_hi:
            "1. मिराजियो ऐप डाउनलोड करें और पंजीकरण करें।\n2. ऐप से एक रील टास्क स्वीकार करें।\n3. आवश्यक हैशटैग और टैग के साथ अपनी सोशल मीडिया अकाउंट पर रील अपलोड करें।\n4. मिराजियो में रील लिंक या स्क्रीनशॉट सबमिट करें।\n5. आपकी रील 8–9 दिनों में सत्यापित होगी।\n6. स्वीकृत होने पर, आपकी कमाई आपके मिराजियो वॉलेट में जोड़ दी जाएगी।",
    },
    {
        q: "Which social media platforms are supported?",
        q_hi: "कौन से सोशल मीडिया प्लेटफ़ॉर्म समर्थित हैं?",
        a: "Currently, Miragio supports Instagram, Facebook, and YouTube Shorts.",
        a_hi: "वर्तमान में, मिराजियो Instagram, Facebook और YouTube Shorts को सपोर्ट करता है।",
    },
    {
        q: "Do I need followers to earn money on Miragio?",
        q_hi: "क्या मिराजियो पर पैसे कमाने के लिए फॉलोअर्स की आवश्यकता है?",
        a: "No, you don’t need followers. However, accounts with higher reach and engagement may get access to more or higher-paying tasks.",
        a_hi:
            "नहीं, आपको फॉलोअर्स की आवश्यकता नहीं है। हालांकि, अधिक पहुंच और एंगेजमेंट वाले खातों को अधिक या उच्च भुगतान वाले कार्य मिल सकते हैं।",
    },
    {
        q: "How much can I earn per reel?",
        q_hi: "मैं प्रति रील कितना कमा सकता हूं?",
        a: "Earnings depend on the brand campaign. The payment amount is always displayed before you accept a task.",
        a_hi:
            "कमाई ब्रांड अभियान पर निर्भर करती है। किसी टास्क को स्वीकार करने से पहले भुगतान राशि हमेशा दिखाई जाती है।",
    },
    {
        q: "How do I withdraw my earnings?",
        q_hi: "मैं अपनी कमाई कैसे निकालूं?",
        a: "You can transfer your earnings from your Miragio wallet to UPI, Paytm, or Bank account.",
        a_hi:
            "आप अपनी कमाई को अपने मिराजियो वॉलेट से UPI, Paytm या बैंक खाते में ट्रांसफर कर सकते हैं।",
    },
    {
        q: "What is the minimum withdrawal amount?",
        q_hi: "न्यूनतम निकासी राशि क्या है?",
        a: "The minimum withdrawal amount is shown in the app. Typically, it ranges between ₹100 – ₹500.",
        a_hi:
            "न्यूनतम निकासी राशि ऐप में दिखाई जाती है। आमतौर पर यह ₹100 – ₹500 के बीच होती है।",
    },
    {
        q: "How long does reel verification take?",
        q_hi: "रील सत्यापन में कितना समय लगता है?",
        a: "Every reel is checked by our moderation team. Verification usually takes 8–9 days.",
        a_hi:
            "हर रील को हमारी मॉडरेशन टीम द्वारा जांचा जाता है। सत्यापन आमतौर पर 8–9 दिनों में होता है।",
    },
    {
        q: "Can I delete my reel after uploading?",
        q_hi: "क्या मैं अपलोड करने के बाद अपनी रील हटा सकता हूं?",
        a: "No. Reels must stay live for the required duration (usually 7–30 days). Deleting early may cancel your payment.",
        a_hi:
            "नहीं। रील को आवश्यक अवधि (आमतौर पर 7–30 दिन) तक लाइव रहना चाहिए। जल्दी हटाने से आपका भुगतान रद्द हो सकता है।",
    },
    {
        q: "Can I use multiple accounts?",
        q_hi: "क्या मैं कई खाते उपयोग कर सकता हूं?",
        a: "Yes, you can link multiple verified social media accounts. However, fake or spam accounts are not allowed.",
        a_hi:
            "हाँ, आप कई सत्यापित सोशल मीडिया खातों को लिंक कर सकते हैं। हालांकि, नकली या स्पैम खाते अनुमति नहीं हैं।",
    },
    {
        q: "What happens if I miss a hashtag or tag?",
        q_hi: "यदि मैं कोई हैशटैग या टैग छोड़ दूं तो क्या होगा?",
        a: "If the required hashtags or tags are missing, the reel will be rejected and no payment will be given.",
        a_hi:
            "यदि आवश्यक हैशटैग या टैग छूट जाते हैं, तो रील को अस्वीकार कर दिया जाएगा और कोई भुगतान नहीं दिया जाएगा।",
    },
    {
        q: "What happens if my reel is rejected?",
        q_hi: "अगर मेरी रील अस्वीकार हो जाए तो क्या होगा?",
        a: "If your reel is deleted, set to private, or does not follow the task rules, it will be marked as failed and you won’t receive payment.",
        a_hi:
            "यदि आपकी रील हटा दी जाती है, निजी कर दी जाती है, या कार्य नियमों का पालन नहीं करती है, तो इसे असफल चिह्नित किया जाएगा और आपको भुगतान नहीं मिलेगा।",
    },
    {
        q: "Can I re-upload a rejected reel?",
        q_hi: "क्या मैं अस्वीकार की गई रील को दोबारा अपलोड कर सकता हूं?",
        a: "Yes, but only if the campaign is still active and you correctly follow the hashtags and tags.",
        a_hi:
            "हाँ, लेकिन केवल तभी जब अभियान अभी भी सक्रिय हो और आप सही तरीके से हैशटैग और टैग का पालन करें।",
    },
    {
        q: "How often are new tasks added?",
        q_hi: "नए कार्य कितनी बार जोड़े जाते हैं?",
        a: "New tasks are updated regularly based on brand campaigns. Check Miragio daily to find fresh opportunities.",
        a_hi:
            "ब्रांड अभियानों के आधार पर नए कार्य नियमित रूप से अपडेट किए जाते हैं। नए अवसरों के लिए रोज़ाना मिराजियो देखें।",
    },
    {
        q: "Do I need to keep my account public?",
        q_hi: "क्या मुझे अपना अकाउंट पब्लिक रखना होगा?",
        a: "Yes, your account must be public so the Miragio team and brand can verify your reel.",
        a_hi:
            "हाँ, आपका खाता सार्वजनिक होना चाहिए ताकि मिराजियो टीम और ब्रांड आपकी रील को सत्यापित कर सके।",
    },
    {
        q: "Does Miragio charge a joining fee?",
        q_hi: "क्या मिराजियो कोई जॉइनिंग शुल्क लेता है?",
        a: "No. Miragio App is completely free to download and use.",
        a_hi:
            "नहीं। मिराजियो ऐप को डाउनलोड और उपयोग करना पूरी तरह निःशुल्क है।",
    },
    {
        q: "How long does withdrawal take?",
        q_hi: "निकासी में कितना समय लगता है?",
        a: "Withdrawals are usually processed within 2–3 working days after approval. In rare cases, it may take longer due to bank or wallet delays.",
        a_hi:
            "निकासी आमतौर पर अनुमोदन के बाद 2–3 कार्य दिवसों के भीतर संसाधित की जाती है। दुर्लभ मामलों में, बैंक या वॉलेट देरी के कारण अधिक समय लग सकता है।",
    },
    {
        q: "Can I invite friends to Miragio?",
        q_hi: "क्या मैं दोस्तों को मिराजियो में आमंत्रित कर सकता हूं?",
        a: "Yes! Miragio offers referral rewards (when available). You can check referral bonuses directly in the app.",
        a_hi:
            "हाँ! मिराजियो रेफ़रल रिवार्ड्स प्रदान करता है (जब उपलब्ध हो)। आप ऐप में सीधे रेफ़रल बोनस देख सकते हैं।",
    },
    {
        q: "How can I get more reel tasks?",
        q_hi: "मैं अधिक रील कार्य कैसे प्राप्त कर सकता हूँ?",
        a: "Stay active and complete existing tasks on time. Keep your reels public. Grow your social media engagement. Avoid rule violations (deleted reels, missing hashtags, etc.).",
        a_hi:
            "सक्रिय रहें और मौजूदा कार्यों को समय पर पूरा करें। अपनी रील्स को सार्वजनिक रखें। अपने सोशल मीडिया एंगेजमेंट को बढ़ाएं। नियम उल्लंघन (रील हटाना, हैशटैग छोड़ना आदि) से बचें।",
    },
    {
        q: "Who verifies my reels?",
        q_hi: "मेरी रील्स को कौन सत्यापित करता है?",
        a: "Miragio’s moderation team manually checks every reel to ensure it includes the required hashtags and tags, is public and live, and follows campaign instructions.",
        a_hi:
            "मिराजियो की मॉडरेशन टीम हर रील को मैन्युअल रूप से जांचती है ताकि यह सुनिश्चित किया जा सके कि इसमें आवश्यक हैशटैग और टैग शामिल हैं, यह सार्वजनिक और लाइव है और अभियान निर्देशों का पालन करती है।",
    },
];

export default FAQ;
