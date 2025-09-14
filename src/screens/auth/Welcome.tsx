import React, { useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../constants/Colors';
import { onboarding } from '../../constants';
import type { AuthStackParamList } from '../../Navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const Welcome = ({ navigation }: Props) => {
    const swiperRef = useRef<Swiper>(null);
    const [, setActiveIndex] = useState<number>(0);

    // FIXED: Use replace navigation to prevent navigation stack accumulation
    const handleSignUpPress = () => {
        navigation.replace('SignUp');
    };

    const handleSignInPress = () => {
        navigation.replace('SignIn');
    };

    return (
        <View className="flex-1 bg-black">
            <Swiper
                ref={swiperRef}
                loop={false}
                dot={
                    <View
                        className="w-8 h-1 mx-1 rounded-full"
                        style={{ backgroundColor: Colors.light.secondaryText }}
                    />
                }
                activeDot={
                    <View
                        className="w-8 h-1 mx-1 rounded-full"
                        style={{ backgroundColor: Colors.light.blueTheme }}
                    />
                }
                onIndexChanged={(index: number) => setActiveIndex(index)}
            >
                {onboarding.map((item) => (
                    <View key={item.id} className="flex-1 items-center justify-center">
                        <Image
                            source={item.image}
                            className="w-full h-full"
                            resizeMode="cover"
                            style={{ width, height }}
                        />
                    </View>
                ))}
            </Swiper>

            <View className="absolute top-10 right-4">
                <TouchableOpacity>
                    <Text className="text-lg font-medium text-white">
                        language/भाषा
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="absolute bottom-16 left-0 right-0 items-center px-6">
                <View className="mb-6">
                    <Text style={{ color: Colors.light.whiteFfffff }} className="text-2xl font-bold text-center mb-2">
                        Claim Your{' '}
                        <Text style={{ color: Colors.light.blueBgOnboarding }} className="font-bold">
                            Bonus
                        </Text>
                    </Text>
                    <Text style={{ color: Colors.light.whiteFfffff }} className="text-2xl font-semibold text-center">
                        Instantly Upon Signup!
                    </Text>
                </View>

                <TouchableOpacity
                    style={{ backgroundColor: Colors.light.bgBlueBtn }}
                    className="flex justify-center items-center w-[350px] h-[56px] rounded-[15px] mb-5"
                    onPress={handleSignUpPress}
                >
                    <Text
                        style={{ color: Colors.light.whiteFefefe }}
                        className="text-xl font-semibold"
                    >
                        Sign Up
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: Colors.light.blackPrimary }}
                    className="flex justify-center items-center py-1 w-[350px] h-[56px] rounded-[15px]"
                    onPress={handleSignInPress}
                >
                    <Text
                        style={{ color: Colors.light.whiteFefefe }}
                        className="text-xl font-semibold"
                    >
                        Login
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Welcome;
