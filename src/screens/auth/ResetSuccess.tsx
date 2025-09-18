import { Image, Text, View, Dimensions } from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import tick from "../../assets/images/tick.png";
import CustomGradientButton from "../../components/CustomGradientButton";
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetSuccess'>;

const { width, height } = Dimensions.get('window');

const ResetSuccess = ({ navigation }: Props) => {

    // Handle login button press
    const handleLoginPress = () => {
        // Navigate to SignIn screen
        navigation.navigate('SignIn');
    };

    return (
        <View className="flex-1 items-center">

            {/* Background Image */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full absolute"
                style={{ width, height }}
            />

            {/* Success Icon Section - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.19  // 18% from top
                }}
            >
                <Image
                    source={tick}
                    style={{
                        width: Math.min(width * 0.9, 350),  // 80% of width, max 320px
                        height: Math.min(width * 0.9, 350), // Keep square aspect ratio
                        resizeMode: 'contain'
                    }}
                />
            </View>

            {/* Success Message Section - responsive */}
            <View
                className="absolute flex justify-center items-center"
                style={{
                    top: height * 0.66,  // 58% from top
                    width: width * 0.85,
                    paddingHorizontal: width * 0.04
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFefefe,
                        fontSize: width * 0.069,
                        lineHeight: width * 0.075
                    }}
                    className="font-bold text-center"
                >
                    Password Successfully Changed
                </Text>
                <Text
                    style={{
                        color: Colors.light.whiteFefefe,
                        fontSize: width * 0.049,
                        lineHeight: width * 0.055,
                        marginTop: height * 0.02
                    }}
                    className="text-center"
                >
                    You'll redirect to Login Page
                </Text>
            </View>

            {/* Login Button Section - responsive */}
            <View
                className="absolute items-center"
                style={{
                    top: height * 0.84,  // 72% from top
                    width: '100%',
                    paddingHorizontal: width * 0.02
                }}
            >
                <CustomGradientButton
                    text="Login"
                    width={Math.min(width * 0.9, 500)}
                    height={Math.max(48, height * 0.06)}
                    fontWeight={600}
                    borderRadius={15}
                    fontSize={Math.min(18, width * 0.045)}
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleLoginPress}
                />
            </View>

            {/* Footer Brand Name - responsive */}
            <View
                className="absolute items-center"
                style={{
                    bottom: height * 0.034  // 4% from bottom
                }}
            >
                <Text
                    style={{
                        color: Colors.light.whiteFfffff,
                        fontSize: width * 0.07
                    }}
                    className="font-bold"
                >
                    MIRAGIO
                </Text>
            </View>

        </View >
    )
};

export default ResetSuccess;