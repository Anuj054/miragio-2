import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar } from "react-native";

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";
import { Colors } from "../../../constants/Colors";

// ADDED: Import navigation types - adjust based on your navigation structure
import type { MainStackParamList } from "../../../Navigation/types"; // or your navigation types file

// ADDED: Define props type for React Navigation
type Props = NativeStackScreenProps<MainStackParamList, 'FairPlay'>;

const FairPlay = ({ navigation }: Props) => {


    // ADDED: Back button handler for React Native CLI
    const handleBackPress = (): void => {
        navigation.goBack();
    };

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <View className="relative h-32">
                {/* Background image */}
                <Image source={bg2} resizeMode="cover" className="w-full h-full absolute" />

                {/* Header overlay content with navigation */}
                <View className="flex-1 pt-12 pb-4 px-4">
                    {/* Header row with proper spacing */}
                    <View className="flex-row items-center justify-between h-16">
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="w-10 h-10 items-center justify-center"
                        >
                            {icons && (
                                <Image
                                    source={icons.back}
                                    className="w-4 h-6"
                                />
                            )}
                        </TouchableOpacity>

                        {/* Centered title */}
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-3xl font-medium pt-1"
                        >
                            Fair Play
                        </Text>

                        {/* Empty space for balance (same width as back button) */}
                        <View className="w-10 h-10" />
                    </View>
                </View>

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full h-[1px]"
                    style={{ backgroundColor: Colors.light.whiteFfffff }}
                />
            </View>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* ADD YOUR FAIR PLAY CONTENT HERE */}
                <View className="p-4">
                    <Text style={{ color: Colors.light.whiteFefefe }} className="text-lg">
                        Fair Play content goes here...
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default FairPlay;
