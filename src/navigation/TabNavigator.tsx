// Navigation/TabNavigator.tsx
import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, type ImageSourcePropType, View, Text, Animated } from 'react-native';

// Task screens
import TaskPageScreen from '../Screens/task/TaskPage';
import TaskDetailsScreen from '../Screens/task/TaskDetails';
import TaskSuccessfulScreen from '../Screens/task/TaskSuccessfull';
import InstructionsScreen from '../Screens/task/Instructions';

// Wallet screens
import WalletPageScreen from '../Screens/wallet/WalletPage';
import TransactionsScreen from '../Screens/wallet/Transactions';
import WithdrawScreen from '../Screens/wallet/Withdraw';

// More screen
import MorePageScreen from '../Screens/more/MorePageScreen';

// Icons
import { icons } from '../constants/index';
import type { TabParamList, TaskStackParamList, WalletStackParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();
const WalletStack = createNativeStackNavigator<WalletStackParamList>();

// Custom Tab Icon Component
const TabIcon = ({
    focused,
    activeSource,
    inactiveSource,
    label
}: {
    activeSource: ImageSourcePropType,
    inactiveSource: ImageSourcePropType,
    focused: boolean,
    label: string
}) => {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: focused ? 1 : 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacityValue, {
                toValue: focused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    }, [focused]);

    return (
        <View className="flex-1 justify-center items-center relative">
            <Animated.View
                className="absolute bottom-[15px] bg-[#078FCA] rounded-full z-10"
                style={{
                    width: 42,
                    height: 42,
                    transform: [{ scale: scaleValue }],
                    opacity: opacityValue,
                }}
            />
            <View className={`flex items-center justify-center w-12 h-16 rounded-full top-3 ${focused ? ' pb-8' : ''}`}>
                <View className="absolute">
                    <Image
                        source={focused ? activeSource : inactiveSource}
                        style={{
                            tintColor: focused ? 'white' : '#2B2B2B',
                            width: 25,
                            height: 25,
                            zIndex: 30,
                            top: focused ? -20 : 0
                        }}
                        resizeMode="contain"
                    />
                </View>
                <Image
                    source={focused ? icons.tabsbg : null}
                    className="w-[71px] h-[59.15px] top-[-6px]"
                />
            </View>
            <Text
                className={`text-lg mt-1 w-full bottom-1 ${focused ? 'text-[#078FCA] font-bold' : 'text-[#2B2B2B]'}`}
                style={{ fontSize: 11 }}
            >
                {label}
            </Text>
        </View>
    );
};

// Task Stack Navigator
const TaskStackNavigator = () => (
    <TaskStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'none' // ADDED: Remove animations
        }}
    >
        <TaskStack.Screen name="TaskPage" component={TaskPageScreen} />
        <TaskStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <TaskStack.Screen name="TaskSuccessful" component={TaskSuccessfulScreen} />
        <TaskStack.Screen name="Instructions" component={InstructionsScreen} />
    </TaskStack.Navigator>
);

// Wallet Stack Navigator
const WalletStackNavigator = () => (
    <WalletStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'none' // ADDED: Remove animations
        }}
    >
        <WalletStack.Screen name="WalletPage" component={WalletPageScreen} />
        <WalletStack.Screen name="Transactions" component={TransactionsScreen} />
        <WalletStack.Screen name="Withdraw" component={WithdrawScreen} />
    </WalletStack.Navigator>
);

const TabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="TaskTab"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 0,
                    elevation: 5,
                    height: 85,
                    paddingBottom: 10,
                    paddingTop: 10,
                    paddingHorizontal: 15,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: "#078FCA",
                tabBarInactiveTintColor: '#2B2B2B',
            }}
        >
            <Tab.Screen
                name="TaskTab"
                component={TaskStackNavigator}
                options={{
                    title: "Task",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            activeSource={icons.coin1}
                            inactiveSource={icons.coin}
                            label="Task"
                        />
                    )
                }}
            />

            <Tab.Screen
                name="WalletTab"
                component={WalletStackNavigator}
                options={{
                    title: "Wallet",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            activeSource={icons.wallet1}
                            inactiveSource={icons.wallet}
                            label="Wallet"
                        />
                    )
                }}
            />

            <Tab.Screen
                name="MoreTab"
                component={MorePageScreen}
                options={{
                    title: "More",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            activeSource={icons.app1}
                            inactiveSource={icons.app}
                            label="More"
                        />
                    )
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
