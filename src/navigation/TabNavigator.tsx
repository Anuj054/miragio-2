import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your tab screens
import TaskPageScreen from '../Screens/task/TaskPage';
import TaskDetailsScreen from '../Screens/task/TaskDetails';
import TaskSuccessfulScreen from '../Screens/task/TaskSuccessfull';
import InstructionsScreen from '../Screens/task/Instructions';

import ProfileScreen from '../Screens/profile/UserProfile';
import EditProfileScreen from '../Screens/profile/EditProfile';

import WalletPageScreen from '../Screens/wallet/WalletPage';
import TransactionsScreen from '../Screens/wallet/Transactions';
import WithdrawScreen from '../Screens/wallet/Withdraw';

import MorePageScreen from '../Screens/MorePageScreen';

// You can import your custom tab bar icons here
// import TabBarIcon from '../components/ui/TabBarIcon';

const Tab = createBottomTabNavigator();
const TaskStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();

// Task Stack Navigator
const TaskStackNavigator = () => (
    <TaskStack.Navigator screenOptions={{ headerShown: false }}>
        <TaskStack.Screen name="TaskPage" component={TaskPageScreen} />
        <TaskStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <TaskStack.Screen name="TaskSuccessful" component={TaskSuccessfulScreen} />
        <TaskStack.Screen name="Instructions" component={InstructionsScreen} />
    </TaskStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="UserProfile" component={ProfileScreen} />
        <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
);

// Wallet Stack Navigator
const WalletStackNavigator = () => (
    <WalletStack.Navigator screenOptions={{ headerShown: false }}>
        <WalletStack.Screen name="WalletPage" component={WalletPageScreen} />
        <WalletStack.Screen name="Transactions" component={TransactionsScreen} />
        <WalletStack.Screen name="Withdraw" component={WithdrawScreen} />
    </WalletStack.Navigator>
);

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000', // Adjust to match your theme
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 60,
                },
                tabBarActiveTintColor: '#4CAF50', // Your active color
                tabBarInactiveTintColor: '#666666', // Your inactive color
            }}
        >
            <Tab.Screen
                name="TaskTab"
                component={TaskStackNavigator}
                options={{
                    tabBarLabel: 'Tasks',
                    // tabBarIcon: ({ focused, color, size }) => (
                    //   <TabBarIcon name="tasks" focused={focused} color={color} size={size} />
                    // ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: 'Profile',
                    // tabBarIcon: ({ focused, color, size }) => (
                    //   <TabBarIcon name="profile" focused={focused} color={color} size={size} />
                    // ),
                }}
            />
            <Tab.Screen
                name="WalletTab"
                component={WalletStackNavigator}
                options={{
                    tabBarLabel: 'Wallet',
                    // tabBarIcon: ({ focused, color, size }) => (
                    //   <TabBarIcon name="wallet" focused={focused} color={color} size={size} />
                    // ),
                }}
            />
            <Tab.Screen
                name="MoreTab"
                component={MorePageScreen}
                options={{
                    tabBarLabel: 'More',
                    // tabBarIcon: ({ focused, color, size }) => (
                    //   <TabBarIcon name="more" focused={focused} color={color} size={size} />
                    // ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
