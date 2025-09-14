// src/Navigation/MainNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Import profile screens
import UserProfile from '../Screens/profile/UserProfile';
import EditProfile from '../Screens/profile/EditProfile';

// ADDED: Import all More/Settings screens
import MorePageScreen from '../Screens/more/MorePageScreen';

// Updates folder screens
import PlayMusicSettings from '../Screens/more/updates/PlayMusicSettings';
import AccountSecurity from '../Screens/more/updates/AccountSecurity';
import NewUpdates from '../Screens/more/updates/NewUpdates';

// Help folder screens
import ReferFriends from '../Screens/more/help/ReferFriends';
import HowToPlay from '../Screens/more/help/HowToPlay';
import ResponsibleGaming from '../Screens/more/help/ResponsibleGaming';
import FairPlay from '../Screens/more/help/FairPlay';
import HelpDesk from '../Screens/more/help/HelpDesk';
import SystemStatus from '../Screens/more/help/SystemStatus';

// System folder screens
import PrivacyPolicy from '../Screens/more/system/PrivacyPolicy';
import RNGCertification from '../Screens/more/system/RNGCertification';
import Careers from '../Screens/more/system/Careers';
import AboutUs from '../Screens/more/system/AboutUs';
import TermsOfUse from '../Screens/more/system/TermsOfUse';
import Legality from '../Screens/more/system/Legality';

import type { MainStackParamList } from './types';

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
            <Stack.Screen name="MorePagesScreen" component={MorePageScreen} />

            {/* Updates folder screens */}
            <Stack.Screen name="PlayMusicSettings" component={PlayMusicSettings} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurity} />
            <Stack.Screen name="NewUpdates" component={NewUpdates} />

            {/* Help folder screens */}
            <Stack.Screen name="ReferFriends" component={ReferFriends} />
            <Stack.Screen name="HowToPlay" component={HowToPlay} />
            <Stack.Screen name="ResponsibleGaming" component={ResponsibleGaming} />
            <Stack.Screen name="FairPlay" component={FairPlay} />
            <Stack.Screen name="HelpDesk" component={HelpDesk} />
            <Stack.Screen name="SystemStatus" component={SystemStatus} />

            {/* System folder screens */}
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen name="RNGCertification" component={RNGCertification} />
            <Stack.Screen name="Careers" component={Careers} />
            <Stack.Screen name="AboutUs" component={AboutUs} />
            <Stack.Screen name="TermsOfUse" component={TermsOfUse} />
            <Stack.Screen name="Legality" component={Legality} />
        </Stack.Navigator>
    );
};

export default MainNavigator;
