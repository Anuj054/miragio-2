import React from "react";
import { Image, Text, View, Dimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import bg from "../../assets/images/bg.png";
import tick from "../../assets/images/tick.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from "../../navigation/types";

// ✅ Translation
import { useTranslation } from "../../context/TranslationContext";
import { TranslatedText } from "../../components/TranslatedText";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetSuccess">;

const { width, height } = Dimensions.get("window");

const ResetSuccess = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === "hi";

    const handleLoginPress = () => {
        navigation.navigate("SignIn");
    };

    return (
        <View className="flex-1 items-center">
            {/* Background Image */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000', // Fallback color
            }}>
                <Image
                    source={bg}
                    style={{
                        width: '100%',
                        height: '100%',
                        minWidth: width,
                        minHeight: height,
                    }}
                    resizeMode="cover"
                />
            </View>

            {/* Success Icon Section */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.19,
                }}
            >
                <Image
                    source={tick}
                    style={{
                        width: Math.min(width * 0.9, 350),
                        height: Math.min(width * 0.9, 350),
                        resizeMode: "contain",
                    }}
                />
            </View>

            {/* Success Message Section */}
            <View
                className="absolute flex justify-center items-center"
                style={{
                    top: height * 0.66,
                    width: width * 0.85,
                    paddingHorizontal: width * 0.04,
                }}
            >
                <TranslatedText
                    className="font-bold text-center"
                    style={{
                        color: Colors.light.whiteFefefe,
                        fontSize: width * 0.069,
                        lineHeight: width * 0.09,
                    }}
                >
                    {isHi ? "पासवर्ड सफलतापूर्वक बदला गया" : "Password Successfully Changed"}
                </TranslatedText>

                <TranslatedText
                    className="text-center"
                    style={{
                        color: Colors.light.whiteFefefe,
                        fontSize: width * 0.049,
                        lineHeight: width * 0.06,
                        marginTop: height * 0.02,
                    }}
                >
                    {isHi
                        ? "आप लॉगिन पेज पर रीडायरेक्ट हो जाएंगे"
                        : "You'll redirect to Login Page"}
                </TranslatedText>
            </View>

            {/* Login Button */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.84,
                    width: "100%",
                    paddingHorizontal: width * 0.02,
                }}
            >
                <CustomGradientButton
                    text={isHi ? "लॉगिन" : "Login"}
                    width={Math.min(width * 0.9, 500)}
                    height={Math.max(48, height * 0.06)}
                    fontWeight={600}
                    borderRadius={15}
                    fontSize={Math.min(18, width * 0.045)}
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleLoginPress}
                />
            </View>

            {/* Footer Brand Name */}
            <View
                className="absolute items-center"
                style={{
                    bottom: height * 0.034,
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.07,
                    }}
                    className="font-bold"
                >
                    MIRAGIO
                </Text>
            </View>
        </View>
    );
};

export default ResetSuccess;
