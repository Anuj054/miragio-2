import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";
import { Colors } from "../../../constants/Colors";
import type { MainStackParamList } from "../../../navigation/types";

// ✅ Translation
import { useTranslation } from '../../../context/TranslationContext';

type Props = NativeStackScreenProps<MainStackParamList, 'HelpDesk'>;

const { width, height } = Dimensions.get('window');

const HelpDesk = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const handleBackPress = (): void => {
        navigation.goBack();
    };


    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" className="w-full h-full absolute" />
                <View
                    className="flex-1"
                    style={{
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04
                    }}
                >
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
                                    width: width * 0.04,
                                    height: width * 0.06
                                }}
                            />
                        </TouchableOpacity>

                        {/* Centered title with translation */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.075
                                }}
                                className="font-medium"
                            >
                                {isHi ? 'सहायता डेस्क' : 'Help Desk'}
                            </Text>
                        </View>


                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full" style={{ backgroundColor: Colors.light.whiteFfffff, height: 1 }} />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: height * 0.12 }}>
                {/* Content goes here */}
                <View className="items-center justify-center" style={{ paddingVertical: height * 0.1 }}>
                    <Text style={{ color: Colors.light.placeholderColorOp70, fontSize: width * 0.045 }} className="text-center">
                        {isHi ? 'सहायता और समर्थन यहाँ दिखाया जाएगा' : 'Help and support will be displayed here'}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default HelpDesk;