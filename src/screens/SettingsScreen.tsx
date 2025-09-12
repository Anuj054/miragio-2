import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SettingsScreenProps } from '../types/navigation';

interface SettingsState {
    notificationsEnabled: boolean;
    darkModeEnabled: boolean;
    locationEnabled: boolean;
    biometricsEnabled: boolean;
}

interface SettingItem {
    id: keyof SettingsState;
    label: string;
    description?: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
    const [settings, setSettings] = useState<SettingsState>({
        notificationsEnabled: true,
        darkModeEnabled: false,
        locationEnabled: true,
        biometricsEnabled: false,
    });

    const updateSetting = (key: keyof SettingsState, value: boolean): void => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const settingItems: SettingItem[] = [
        {
            id: 'notificationsEnabled',
            label: 'Push Notifications',
            description: 'Receive app notifications',
        },
        {
            id: 'darkModeEnabled',
            label: 'Dark Mode',
            description: 'Use dark theme',
        },
        {
            id: 'locationEnabled',
            label: 'Location Services',
            description: 'Allow location access',
        },
        {
            id: 'biometricsEnabled',
            label: 'Biometric Login',
            description: 'Use fingerprint/face ID',
        },
    ];

    const handleSaveSettings = (): void => {
        Alert.alert('Success', 'Settings saved!');
        // Here you would typically save to AsyncStorage or API
    };

    const handleLogout = (): void => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout', style: 'destructive', onPress: () => {
                        Alert.alert('Logged Out', 'You have been logged out!');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = (): void => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: () => {
                        Alert.alert('Account Deleted', 'Your account has been deleted!');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                <View className="flex-1 px-5 py-8">
                    <Text className="text-3xl font-bold text-gray-800 mb-3 text-center">
                        Settings Screen
                    </Text>
                    <Text className="text-base text-gray-600 text-center mb-8">
                        App settings and preferences
                    </Text>

                    <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                        <Text className="text-xl font-semibold text-gray-800 mb-4">
                            Privacy & Security
                        </Text>

                        {settingItems.map((item, index) => (
                            <View
                                key={item.id}
                                className={`flex-row justify-between items-center py-4 ${index < settingItems.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <View className="flex-1 mr-4">
                                    <Text className="text-base text-gray-700 font-medium">
                                        {item.label}
                                    </Text>
                                    {item.description && (
                                        <Text className="text-sm text-gray-500 mt-1">
                                            {item.description}
                                        </Text>
                                    )}
                                </View>
                                <Switch
                                    value={settings[item.id]}
                                    onValueChange={(value) => updateSetting(item.id, value)}
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor={settings[item.id] ? '#FFFFFF' : '#9CA3AF'}
                                />
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        className="bg-blue-500 px-8 py-4 rounded-xl mb-3"
                        onPress={handleSaveSettings}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            Save Settings
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-yellow-500 px-8 py-4 rounded-xl mb-3"
                        onPress={handleLogout}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            Logout
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-red-500 px-8 py-4 rounded-xl"
                        onPress={handleDeleteAccount}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            Delete Account
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;