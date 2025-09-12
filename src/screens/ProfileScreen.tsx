import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileScreenProps } from '../types/navigation';

interface ProfileData {
    userName: string;
    email: string;
    phone: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
    const [profileData, setProfileData] = useState<ProfileData>({
        userName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
    });

    const updateProfileField = (field: keyof ProfileData, value: string): void => {
        setProfileData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleUpdateProfile = (): void => {
        // Basic validation
        if (!profileData.userName.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        if (!profileData.email.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        Alert.alert('Success', 'Profile updated!');
    };

    const handleCancel = (): void => {
        Alert.alert('Cancelled', 'Changes discarded!');
        // Reset to original values or refetch from API
        setProfileData({
            userName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234 567 8900',
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                <View className="flex-1 justify-center items-center px-5 py-8">
                    <Text className="text-3xl font-bold text-gray-800 mb-3 text-center">
                        Profile Screen
                    </Text>
                    <Text className="text-base text-gray-600 text-center mb-8">
                        Manage your profile information
                    </Text>

                    <View className="w-full bg-white rounded-xl p-6 mb-6 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-700 mb-2">
                            Name:
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 mb-4"
                            value={profileData.userName}
                            onChangeText={(value) => updateProfileField('userName', value)}
                            placeholder="Enter your name"
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text className="text-lg font-semibold text-gray-700 mb-2">
                            Email:
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 mb-4"
                            value={profileData.email}
                            onChangeText={(value) => updateProfileField('email', value)}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                        />

                        <Text className="text-lg font-semibold text-gray-700 mb-2">
                            Phone:
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                            value={profileData.phone}
                            onChangeText={(value) => updateProfileField('phone', value)}
                            placeholder="Enter your phone"
                            keyboardType="phone-pad"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-blue-500 px-8 py-4 rounded-xl w-full mb-3"
                        onPress={handleUpdateProfile}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            Update Profile
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-500 px-8 py-4 rounded-xl w-full"
                        onPress={handleCancel}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;