// src/Navigation/MainNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Import profile screens
import UserProfile from '../screens/profile/UserProfile';
import EditProfile from '../screens/profile/EditProfile';

// ADDED: Import all More/Settings screens
import MorePagesScreen from '../screens/more/MorePageScreen';

// Updates folder screens

//import AccountSecurity from '../screens/more/updates/AccountSecurity';
//import NewUpdates from '../screens/more/updates/NewUpdates';

// Help folder screens
//import ReferFriends from '../screens/more/help/ReferFriends';


import HelpDesk from '../screens/more/help/HelpDesk';
//import SystemStatus from '../screens/more/help/SystemStatus';

// System folder screens


import AboutUs from '../screens/more/system/AboutUs';
import TermsOfUse from '../screens/more/system/TermsOfUse';


import type { MainStackParamList } from './types';
import PrivacyPolicy from '../screens/more/system/PrivacyPolicy';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Tabs"
            screenOptions={{
                headerShown: false,
                animation: 'none'
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

            {/* ADDED: More/Settings screens accessible from MoreTab */}
            <Stack.Screen name="MorePagesScreen" component={MorePagesScreen} />

            {/* Updates folder screens */}

            {/*    <Stack.Screen name="AccountSecurity" component={AccountSecurity} />*/}
            {/*    <Stack.Screen name="NewUpdates" component={NewUpdates} />*/}

            {/* Help folder screens */}
            {/*    <Stack.Screen name="ReferFriends" component={ReferFriends} />*/}


            <Stack.Screen name="HelpDesk" component={HelpDesk} />
            {/*<Stack.Screen name="SystemStatus" component={SystemStatus} />*/}

            {/* System folder screens */}
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />


            <Stack.Screen name="AboutUs" component={AboutUs} />
            <Stack.Screen name="TermsOfUse" component={TermsOfUse} />

        </Stack.Navigator>
    );
};

export default MainNavigator;
