import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";

import type { MainStackParamList } from "../../../navigation/types";
import { useTranslation } from "../../../context/TranslationContext";

type Props = NativeStackScreenProps<MainStackParamList, "TermsOfUse">;

const { width, height } = Dimensions.get("window");

const TermsOfUse = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === "hi";

    const handleBackPress = () => navigation.goBack();

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" className="absolute w-full h-full" />
                <View className="flex-1 px-4" style={{ paddingTop: height * 0.05, paddingBottom: height * 0.02 }}>
                    <View className="flex-row items-center justify-between" style={{ height: height * 0.08 }}>
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="items-center justify-center"
                            style={{ width: width * 0.1, height: width * 0.1 }}
                        >
                            <Image source={icons.back} style={{ width: width * 0.04, height: width * 0.06 }} />
                        </TouchableOpacity>

                        <View className="flex-1 items-center">
                            <Text className="text-white text-xl font-semibold">
                                {isHi ? "उपयोग की शर्तें" : "Terms of Use"}
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


                <Text className="text-white text-lg font-semibold mt-4 mb-2">1. Eligibility</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Users must be 18 years or older. Users must provide accurate and up-to-date information during
                    registration. Accounts created with false, misleading, or fraudulent information may be suspended or terminated.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">2. Account Responsibility</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Each user is responsible for the security of their account (username, password, and linked social media
                    accounts). Users must not share login credentials with third parties. Misuse of the account, including
                    fraudulent activity, may result in suspension or termination.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">3. Task Rules & Campaign Participation</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Tasks are limited to posting reels on assigned social media accounts with specific hashtags and tags.
                    Users must keep the reels public for verification. Reels must not violate any third-party platform rules or
                    local laws. Users may not delete, edit, or remove content before verification is complete. Any task
                    submitted incorrectly or incompletely may be rejected, and no payment will be issued.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">4. Payment & Withdrawals</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Payments are credited to the Miragio wallet after successful verification of tasks. Users may withdraw
                    funds via UPI, bank transfer, or wallet services linked to their account. Miragio does not guarantee instant
                    payouts; processing may take 2–5 business days. Pending tasks or flagged activities may delay or
                    withhold payments.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">5. Prohibited Activities</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Users must not: Use fake, automated, or manipulated social media accounts. Post plagiarized,
                    offensive, or illegal content. Attempt to manipulate the app, campaigns, or payment systems. Share
                    confidential campaign information externally. Engage in actions that may harm Miragio, other users, or
                    advertisers. Miragio reserves the right to block or suspend accounts engaging in prohibited activities.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">6. Intellectual Property</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    All trademarks, logos, content, and app features are owned by Virtual App Studios. Users may not copy,
                    reproduce, distribute, or exploit any part of the app without written consent.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">7. Privacy & Data Usage</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    User data is collected and processed as per the Miragio App Privacy Policy. Users consent to the use of
                    personal information for task verification, payment processing, fraud prevention, and legal compliance.
                    Miragio may send notifications, updates, or promotional content; users can opt-out where permitted.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">8. Taxes & Compliance</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Earnings may be subject to TDS and other applicable taxes. Users are responsible for declaring their
                    income and complying with applicable laws. Miragio will provide TDS certificates or relevant financial
                    documents as required.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">9. Security & Fraud Prevention</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Users are responsible for keeping their devices secure and preventing unauthorized access. Miragio
                    reserves the right to investigate suspicious activity, including multiple account abuse or fraudulent
                    submissions. Violations may result in immediate suspension or forfeiture of pending earnings.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">10. Liability Limitation</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Miragio App does not guarantee continuous, uninterrupted, or error-free service. We are not liable for
                    losses caused by downtime, third-party platform changes, user errors, or delayed payments. Use of the
                    app and participation in campaigns is at the user's own risk.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">11. Termination & Suspension</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Miragio may suspend or terminate accounts that violate terms, participate in fraudulent activity, or
                    engage in prohibited actions. Users may request account deletion at any time; pending payments will
                    be processed as per policy.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">12. Amendments</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    Miragio may update these Terms & Conditions periodically. Users will be notified in-app or via email;
                    continued use constitutes acceptance of the revised terms.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">13. Governing Law & Jurisdiction</Text>
                <Text className="text-gray-300 text-base leading-6 mb-4">
                    These terms are governed by the laws of India. Disputes are subject to the jurisdiction of courts in
                    Gurugram, Haryana, India.
                </Text>

                <Text className="text-white text-lg font-semibold mt-4 mb-2">14. Contact Information</Text>
                <Text className="text-gray-300 text-base leading-6 mb-10">
                    Email: info@miragiofintech.com{"\n"}
                    Company: Virtual App Studios{"\n"}
                    Address: Catriona Apartments, Ambience Island, Gurugram, Haryana, India
                </Text>
            </ScrollView>
        </View>
    );
};

export default TermsOfUse;
