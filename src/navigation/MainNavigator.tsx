// src/Navigation/MainNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Import profile screens
import UserProfile from '../Screens/profile/UserProfile';
import EditProfile from '../Screens/profile/EditProfile';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Tabs"
            screenOptions={{
                headerShown: false,
                animation: 'none' // No slide animations as requested
            }}
        >
            {/* Main Tab Navigator containing all tabs */}
            <Stack.Screen name="Tabs" component={TabNavigator} />

            {/* Profile screens accessible from anywhere */}
            <Stack.Screen
                name="UserProfile"
                component={UserProfile}
                options={{
                    presentation: 'card',
                    animation: 'none'
                }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfile}
                options={{
                    presentation: 'card',
                    animation: 'none'
                }}
            />
        </Stack.Navigator>
    );
};

export default MainNavigator;
