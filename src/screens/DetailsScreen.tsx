import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DetailsScreenProps } from '../types/navigation';

const DetailsScreen: React.FC<DetailsScreenProps> = ({ route, navigation }) => {
    const { message } = route.params || {};

    const handleGoBack = (): void => {
        navigation.goBack();
    };

    const handleNavigateToHome = (): void => {
        navigation.navigate('HomeMain');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center px-5">
                <Text className="text-3xl font-bold text-gray-800 mb-5 text-center">
                    Details Screen
                </Text>
                <Text className="text-base text-gray-600 text-center mb-6 leading-6">
                    This is a details screen reached via stack navigation.
                </Text>

                {message && (
                    <View className="bg-blue-50 p-4 rounded-lg mb-6 w-full">
                        <Text className="text-blue-700 font-semibold text-center">
                            Message: {message}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    className="bg-blue-500 px-6 py-3 rounded-lg mb-3 w-full"
                    onPress={handleGoBack}
                >
                    <Text className="text-white text-base font-semibold text-center">
                        Go Back
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-green-500 px-6 py-3 rounded-lg w-full"
                    onPress={handleNavigateToHome}
                >
                    <Text className="text-white text-base font-semibold text-center">
                        Back to Home
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default DetailsScreen;