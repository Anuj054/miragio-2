import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { HomeScreenProps } from '../types/navigation';

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const handleNavigateToDetails = (): void => {
        navigation.navigate('Details', {
            message: 'Hello from Home Screen!'
        });
    };

    const handleNavigateToProfile = (): void => {
        // Navigate to Profile tab
        navigation.getParent()?.navigate('Profile');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center px-5">
                <Text className="text-3xl font-bold text-gray-800 mb-5 text-center">
                    Home Screen
                </Text>
                <Text className="text-base text-gray-600 text-center mb-8 leading-6">
                    Welcome to the home screen! This is the main landing page of your app.
                </Text>

                <TouchableOpacity
                    className="bg-blue-500 px-6 py-3 rounded-lg mb-3 w-full"
                    onPress={handleNavigateToDetails}
                >
                    <Text className="text-white text-base font-semibold text-center">
                        Go to Details
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-green-500 px-6 py-3 rounded-lg mb-3 w-full"
                    onPress={handleNavigateToProfile}
                >
                    <Text className="text-white text-base font-semibold text-center">
                        View Profile
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;