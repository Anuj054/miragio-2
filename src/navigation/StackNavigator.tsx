import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../Screens/HomeScreen';
import DetailsScreen from '../Screens/DetailsScreen';
import type { HomeStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#3B82F6', // Tailwind blue-500
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 18,
                },
                headerShadowVisible: true,
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{ title: 'Home' }}
            />
            <Stack.Screen
                name="Details"
                component={DetailsScreen}
                options={{
                    title: 'Details',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
};

export default HomeStackNavigator;