import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    ImageBackground,
    Dimensions
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

// Import your assets
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";
import { Colors } from "../../constants/Colors";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Navigation types
type NavigationProp = any;

// Type definitions for task instructions
interface TaskInstructions {
    videoUrl: string;
    steps: string[];
    title: string;
}

const Instructions = () => {
    // Get navigation and route
    const navigation = useNavigation<NavigationProp>();

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
            <View style={{ height: height * 0.14 }}>
                <ImageBackground
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />
                <View
                    className="flex-1"
                    style={{
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    {/* Header row with proper spacing */}
                    <View
                        className="flex-row items-center justify-between"
                        style={{ height: height * 0.08 }}
                    >
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{
                                width: width * 0.1,
                                height: width * 0.1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Image
                                source={icons.back}
                                style={{
                                    width: width * 0.06,
                                    height: width * 0.08
                                }}
                            />
                        </TouchableOpacity>

                        {/* Centered title */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.06
                                }}
                                className="font-medium"
                            >
                                Instructions
                            </Text>
                        </View>

                        {/* Right spacer to balance layout */}
                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full"
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        height: 1
                    }}
                />
            </View>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: height * 0.12,
                    paddingHorizontal: width * 0.04
                }}
            >
                {/* =================== TASK TITLE SECTION =================== */}
                <View style={{ paddingVertical: height * 0.03 }}>
                    <Text
                        style={{
                            color: Colors.light.whiteFefefe,
                            fontSize: width * 0.055,
                            textAlign: 'center'
                        }}
                        className="font-semibold"
                    >
                        {dummyInstructions.title}
                    </Text>
                </View>

                {/* =================== VIDEO SECTION =================== */}
                {embedUrl && (
                    <View style={{ marginBottom: height * 0.03 }}>
                        <View
                            style={{
                                width: '100%',
                                height: height * 0.23,
                                backgroundColor: Colors.light.backlight2,
                                borderRadius: 12
                            }}
                            className="overflow-hidden"
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
                                    <View
                                        className="flex-1 items-center justify-center"
                                        style={{ backgroundColor: Colors.light.backlight2 }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.placeholderColorOp70,
                                                fontSize: width * 0.04
                                            }}
                                        >
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
                <View style={{ marginBottom: height * 0.03 }}>
                    <Text
                        style={{
                            color: Colors.light.whiteFefefe,
                            fontSize: width * 0.05,
                            marginBottom: height * 0.02
                        }}
                        className="font-semibold"
                    >
                        Steps to Complete:
                    </Text>

                    {dummyInstructions.steps.map((step, index) => (
                        <View
                            key={index}
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
                                <View
                                    style={{
                                        backgroundColor: Colors.light.bgBlueBtn,
                                        width: width * 0.08,
                                        height: width * 0.08,
                                        borderRadius: (width * 0.08) / 2,
                                        marginRight: width * 0.03
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFefefe,
                                            fontSize: width * 0.035
                                        }}
                                        className="font-bold"
                                    >
                                        {index + 1}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFefefe,
                                            fontSize: width * 0.04,
                                            lineHeight: width * 0.06
                                        }}
                                    >
                                        {step}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* =================== SUBMISSION REQUIREMENTS =================== */}
                <View style={{ marginBottom: height * 0.03 }}>
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderRadius: 12,
                            padding: width * 0.04
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.light.bgBlueBtn,
                                fontSize: width * 0.04,
                                marginBottom: height * 0.01
                            }}
                            className="font-semibold"
                        >
                            📤 Submission Requirements:
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.035,
                                lineHeight: width * 0.06,
                                marginBottom: height * 0.005
                            }}
                        >
                            • PDF report with all components
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.035,
                                lineHeight: width * 0.06,
                                marginBottom: height * 0.005
                            }}
                        >
                            • Screenshots of scheduled posts
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.035,
                                lineHeight: width * 0.06,
                                marginBottom: height * 0.005
                            }}
                        >
                            • Content calendar (Excel/Google Sheets)
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.035,
                                lineHeight: width * 0.06
                            }}
                        >
                            • Reflection document (100-200 words)
                        </Text>
                    </View>
                </View>

                {/* =================== ACTION BUTTON =================== */}
                <View style={{ marginBottom: height * 0.02 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn,
                            height: height * 0.055,
                            borderRadius: 12
                        }}
                        className="items-center justify-center"
                        onPress={handleBackPress}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.05
                            }}
                            className="font-semibold"
                        >
                            Got It, Let's Start!
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default Instructions;