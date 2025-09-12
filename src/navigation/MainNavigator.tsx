import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import UserProfileScreen from '../Screens/profile/UserProfile';
import EditProfileScreen from '../Screens/profile/EditProfile';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Tabs"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
    );
};

export default MainNavigator;
