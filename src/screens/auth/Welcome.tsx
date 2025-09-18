import React, { useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../constants/Colors';
import { onboarding } from '../../constants';
import type { AuthStackParamList } from '../../navigation/types';

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

            {/* Language selector - optimized for all screen sizes */}
            <View
                className="absolute"
                style={{
                    top: height * 0.05,  // 5% from top 
                    right: width * 0.04  // 4% from right edge
                }}
            >
                <TouchableOpacity className="py-2 px-1">
                    <Text
                        className="font-medium text-white"
                        style={{ fontSize: width * 0.04 }} // Dynamic font size
                    >
                        language/भाषा
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bottom content - optimized positioning for all screens */}
            <View
                className="absolute left-0 right-0 items-center"
                style={{
                    bottom: height * 0.08,  // 8% from bottom
                    paddingHorizontal: width * 0.06  // 6% horizontal padding
                }}
            >
                {/* Title section - dynamic sizing */}
                <View
                    className="items-center"
                    style={{
                        marginBottom: height * 0.04,  // 4% margin bottom
                        paddingHorizontal: width * 0.04
                    }}
                >
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.065,  // Dynamic font size
                            lineHeight: width * 0.075  // Dynamic line height
                        }}
                        className="font-bold text-center"
                    >
                        Claim Your{' '}
                        <Text style={{ color: Colors.light.blueBgOnboarding }} className="font-bold">
                            Bonus
                        </Text>
                    </Text>
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.06,   // Slightly smaller
                            lineHeight: width * 0.07,
                            marginTop: height * 0.01  // 1% margin top
                        }}
                        className="font-semibold text-center"
                    >
                        Instantly Upon Signup!
                    </Text>
                </View>

                {/* Buttons container - fully responsive */}
                <View
                    className="w-full items-center"
                    style={{
                        maxWidth: width * 0.85,  // Max 85% of screen width
                        paddingHorizontal: width * 0.02
                    }}
                >
                    {/* Sign Up Button - dynamic sizing */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn,
                            width: '100%',
                            height: height * 0.062,  // 6.5% of screen height
                            borderRadius: 16,
                            marginBottom: height * 0.02  // 2% margin bottom
                        }}
                        className="flex justify-center items-center"
                        onPress={handleSignUpPress}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.055  // Dynamic font size
                            }}
                            className="font-semibold"
                        >
                            Sign Up
                        </Text>
                    </TouchableOpacity>

                    {/* Login Button - dynamic sizing */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.blackPrimary,
                            width: '100%',
                            height: height * 0.062,  // 6.5% of screen height
                            borderRadius: 16
                        }}
                        className="flex justify-center items-center"
                        onPress={handleSignInPress}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.055  // Dynamic font size
                            }}
                            className="font-semibold"
                        >
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Welcome;