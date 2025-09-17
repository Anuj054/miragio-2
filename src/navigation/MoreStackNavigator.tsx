// Navigation/MoreStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types'; // CHANGED: Use MainStackParamList instead

// Import More screen
import MorePageScreen from '../screens/more/MorePageScreen';

const MoreStack = createNativeStackNavigator<MainStackParamList>();

const MoreStackNavigator = () => (
    <MoreStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'none'
        }}
    >
        <MoreStack.Screen name="MorePagesScreen" component={MorePageScreen} />
    </MoreStack.Navigator>
);

export default MoreStackNavigator;
