import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './StackNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { TabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#3B82F6', // Tailwind blue-500
                tabBarInactiveTintColor: '#6B7280', // Tailwind gray-500
                tabBarStyle: {
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB', // Tailwind gray-200
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false, // Hide header for stack navigator screens
            }}
        >
            <Tab.Screen
                name="HomeStack"
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Home',
                    // Add icon here if you have react-native-vector-icons
                    // tabBarIcon: ({ color, size }) => (
                    //   <Icon name="home" color={color} size={size} />
                    // ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#3B82F6', // Tailwind blue-500
                        shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 5,
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                    },
                    // tabBarIcon: ({ color, size }) => (
                    //   <Icon name="person" color={color} size={size} />
                    // ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#3B82F6', // Tailwind blue-500
                        shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 5,
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                    },
                    // tabBarIcon: ({ color, size }) => (
                    //   <Icon name="settings" color={color} size={size} />
                    // ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;