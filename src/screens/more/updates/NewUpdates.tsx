import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar } from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../../assets/images/bg2.png";
import { icons } from "../../../constants/index";
import { Colors } from "../../../constants/Colors";
import type { MainStackParamList } from "../../../navigation/types";

type Props = NativeStackScreenProps<MainStackParamList, 'NewUpdates'>;

const NewUpdates = ({ navigation }: Props) => {
    const handleBackPress = (): void => {
        navigation.goBack();
    };



    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View className="relative h-32">
                <Image source={bg2} resizeMode="cover" className="w-full h-full absolute" />
                <View className="flex-1 pt-12 pb-4 px-4">
                    <View className="flex-row items-center justify-between h-16">
                        <TouchableOpacity onPress={handleBackPress} className="w-10 h-10 items-center justify-center">
                            <Image source={icons.back} className="w-4 h-6" />
                        </TouchableOpacity>
                        <Text style={{ color: Colors.light.whiteFfffff }} className="text-3xl font-medium mt-1">
                            New Updates
                        </Text>
                        <View className="w-10 h-10" />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full h-[1px]" style={{ backgroundColor: Colors.light.whiteFfffff }} />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

            </ScrollView>
        </View>
    );
};

export default NewUpdates;
