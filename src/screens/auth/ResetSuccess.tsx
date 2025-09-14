import { Image, Text, View } from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg from "../../assets/images/bg.png";
import tick from "../../assets/images/tick.png";
import CustomGradientButton from "../../components/CustomGradientButton"; // Updated import
import { Colors } from "../../constants/Colors";
import type { AuthStackParamList } from '../../Navigation/types';

// FIXED: Proper TypeScript props for React Native CLI
type Props = NativeStackScreenProps<AuthStackParamList, 'ResetSuccess'>;

const ResetSuccess = ({ navigation }: Props) => { // Changed component name

    // FIXED: Handle login button press for React Native CLI
    const handleLoginPress = () => {
        // Navigate to SignIn screen
        navigation.navigate('SignIn');
    };

    return (
        <View className="flex items-center ">

            {/* =================== BACKGROUND IMAGE =================== */}
            <Image
                source={bg}
                resizeMode="cover"
                className="w-full h-full"
            />

            {/* =================== SUCCESS ICON SECTION =================== */}
            <View className=" absolute top-[200px]">
                <Image source={tick} className="w-[360px] h-[360px]" />
            </View>

            {/* =================== SUCCESS MESSAGE SECTION =================== */}
            <View className=" absolute top-[600px] w-[300px] flex justify-center items-center">
                <Text style={{ color: Colors.light.whiteFefefe }} className="text-3xl font-bold flex justify-center text-center ">Password Successful Changed</Text>
                <Text style={{ color: Colors.light.whiteFefefe }} className="text-xl pt-5">You'll redirect to Login Page</Text>
            </View>

            {/* =================== LOGIN BUTTON SECTION =================== */}
            <View className="absolute top-[780px]" >
                <CustomGradientButton
                    text="Login"
                    width={370}
                    height={56}
                    fontWeight={600}
                    borderRadius={15}
                    fontSize={18}
                    textColor={Colors.light.whiteFfffff}
                    onPress={handleLoginPress} // FIXED: Only the navigation function changed
                />
            </View>

            {/* =================== FOOTER BRAND NAME =================== */}
            <View className="absolute bottom-8">
                <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-bold">MIRAGIO</Text>
            </View>

        </View >
    )
};

export default ResetSuccess; // FIXED: Component name matches navigator registration
