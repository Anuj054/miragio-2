import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
// Import other root screens if needed

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Tabs"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Tabs" component={TabNavigator} />
            {/* Add other screens that should be accessible from the root */}
        </Stack.Navigator>
    );
};

export default RootNavigator;
