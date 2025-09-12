import React, { useState } from "react";
import {
    Image,
    ScrollView,
    Text,

    TouchableOpacity,
    View,
    StatusBar,
    ImageBackground
} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import { Colors } from "../../constants/Colors";

// Navigation types
type NavigationProp = any;
type RouteProp = any;

// Type definitions for task instructions
interface TaskInstructions {
    videoUrl: string;
    steps: string[];
    title: string;
}

const Instructions = () => {
    // Get navigation and route
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp>();

    // Get taskId from route params
    const taskId = route.params?.taskId;

    // State management
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Navigation handlers
    const handleBackPress = () => {
        navigation.goBack();
    };

    // Convert YouTube URL to embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';

        // Handle different YouTube URL formats
        let videoId = 'https://youtu.be/UUVE5db78cc?si=y0Pwr1lHYo3nM3os';

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }

        // If no videoId found, use default
        if (!videoId) {
            videoId = 'UUVE5db78cc'; // Default from your original code
        }

        return `https://www.youtube.com/embed/${videoId}`;
    };

    // Dummy instructions data
    const dummyInstructions: TaskInstructions = {
        title: "Complete Social Media Marketing Campaign",
        videoUrl: "https://youtu.be/UUVE5db78cc?si=y0Pwr1lHYo3nM3os", // Example YouTube video
        steps: [
            "Start by watching the instructional video above to understand the complete process",
            "Create a comprehensive social media strategy document outlining your target audience, content themes, and posting schedule",
            "Design 5 unique social media posts using Canva or similar design tools, ensuring brand consistency",
            "Write engaging captions for each post, including relevant hashtags and call-to-action elements",
            "Schedule your posts across at least 3 different social media platforms (Facebook, Instagram, Twitter)",
            "Create a content calendar showing when each post will go live over the next 2 weeks",
            "Take screenshots of your scheduled posts and design work as proof of completion",
            "Compile all materials (strategy document, designs, captions, calendar) into a single PDF report",
            "Upload your completed work using the 'Upload Photo' option or provide a link to your shared document",
            "Include a brief reflection (100-200 words) on what you learned during this process",
            "Submit your work by clicking 'Mark as Complete' and wait for admin review",
            "Be prepared to make revisions if feedback is provided during the review process"
        ]
    };

    const embedUrl = getEmbedUrl(dummyInstructions.videoUrl);

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
                        <View className="flex-1 items-center">
                            <Text
                                style={{ color: Colors.light.whiteFfffff }}
                                className="text-2xl font-semibold"
                            >
                                Instructions
                            </Text>
                        </View>

                        {/* Right spacer to balance layout */}
                        <View className="w-10 h-10" />
                    </View>
                </View>

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </ImageBackground>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
            >
                {/* =================== TASK TITLE SECTION =================== */}
                <View className="py-6">
                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-2xl font-semibold text-center">
                        {dummyInstructions.title}
                    </Text>
                </View>

                {/* =================== VIDEO SECTION =================== */}
                {embedUrl && (
                    <View className="mb-6">
                        <View
                            className="w-full rounded-lg overflow-hidden"
                            style={{
                                height: 220,
                                backgroundColor: Colors.light.backlight2
                            }}
                        >
                            <WebView
                                source={{ uri: embedUrl }}
                                style={{ flex: 1 }}
                                allowsInlineMediaPlayback={true}
                                mediaPlaybackRequiresUserAction={false}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View className="flex-1 items-center justify-center" style={{ backgroundColor: Colors.light.backlight2 }}>
                                        <Text style={{ color: Colors.light.placeholderColorOp70 }}>
                                            Loading video...
                                        </Text>
                                    </View>
                                )}
                                onError={(syntheticEvent) => {
                                    const { nativeEvent } = syntheticEvent;
                                    console.warn('WebView error: ', nativeEvent);
                                }}
                            />
                        </View>
                    </View>
                )}

                {/* =================== INSTRUCTIONS STEPS SECTION =================== */}
                <View className="mb-6">
                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-semibold mb-4">
                        Steps to Complete:
                    </Text>

                    {dummyInstructions.steps.map((step, index) => (
                        <View
                            key={index}
                            style={{ backgroundColor: Colors.light.backlight2, borderLeftColor: Colors.light.bgBlueBtn }}
                            className="w-full rounded-lg border-l-4 mb-3 p-4"
                        >
                            <View className="flex-row items-start">
                                <View
                                    className="w-8 h-8 rounded-full mr-3 items-center justify-center"
                                    style={{ backgroundColor: Colors.light.bgBlueBtn }}
                                >
                                    <Text style={{ color: Colors.light.whiteFefefe }} className="font-bold">
                                        {index + 1}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-base leading-6">
                                        {step}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* =================== SUBMISSION REQUIREMENTS =================== */}
                <View className="mb-6">
                    <View
                        style={{ backgroundColor: Colors.light.backlight2 }}
                        className="w-full rounded-lg p-4"
                    >
                        <Text style={{ color: Colors.light.bgBlueBtn }} className="text-lg font-semibold mb-2">
                            📤 Submission Requirements:
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-base leading-6 mb-1">
                            • PDF report with all components
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-base leading-6 mb-1">
                            • Screenshots of scheduled posts
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-base leading-6 mb-1">
                            • Content calendar (Excel/Google Sheets)
                        </Text>
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-base leading-6">
                            • Reflection document (100-200 words)
                        </Text>
                    </View>
                </View>

                {/* =================== ACTION BUTTON =================== */}
                <View className="mb-4">
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.light.bgBlueBtn }}
                        className="w-full h-14 items-center justify-center rounded-lg"
                        onPress={handleBackPress}
                    >
                        <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl font-semibold">
                            Got It, Let's Start!
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default Instructions;
