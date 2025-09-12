import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Home Stack Navigator Types
export type HomeStackParamList = {
    HomeMain: undefined;
    Details: {
        message?: string;
    };
};

// Tab Navigator Types
export type TabParamList = {
    HomeStack: undefined;
    Profile: undefined;
    Settings: undefined;
};

// Screen Props Types for Stack Navigator
export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
    NativeStackScreenProps<HomeStackParamList, T>;

// Screen Props Types for Tab Navigator
export type TabScreenProps<T extends keyof TabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<TabParamList, T>,
        NativeStackScreenProps<HomeStackParamList>
    >;

// Individual Screen Props - these should match exactly what React Navigation expects
export type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;
export type DetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'Details'>;
export type ProfileScreenProps = BottomTabScreenProps<TabParamList, 'Profile'>;
export type SettingsScreenProps = BottomTabScreenProps<TabParamList, 'Settings'>;

// Declare global navigation types
declare global {
    namespace ReactNavigation {
        interface RootParamList extends TabParamList { }
    }
}