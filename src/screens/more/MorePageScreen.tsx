import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, StatusBar, Dimensions } from "react-native";
import { useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";

// Settings category icons imports
import accountsecurity from "../../assets/images/accountsecurity.png"
import newupdate from "../../assets/images/newupdate.png"
import music from "../../assets/images/music.png"
import refer from "../../assets/images/refer.png"
import howtoplay from "../../assets/images/howtoplay.png"
import responsible from "../../assets/images/responsiblegaming.png"
import fairplay from "../../assets/images/fairplay.png"
import helpdesk from "../../assets/images/helpdesk.png"
import systemstatus from "../../assets/images/systemstatus.png"
import securityandprivacy from "../../assets/images/securityandprivacy.png"
import Rngcerti from "../../assets/images/Rngcerti.png"
import careers from "../../assets/images/careers.png"
import aboutus from "../../assets/images/aboutus.png"
import terms from "../../assets/images/terms.png"
import legality from "../../assets/images/legality.png"

import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../navigation/types";

// Define props type for React Navigation
type Props = NativeStackScreenProps<MainStackParamList, 'MorePagesScreen'>;

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

const MorePagesScreen = ({ navigation }: Props) => {
    // State for search functionality
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Get user context for logout functionality
    const { logout } = useUser();

    // Logout handler with confirmation
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await logout();
                            console.log('Logout successful');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert("Error", "Failed to logout. Please try again.");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Handle navigation to different settings pages with proper typing
    const handleSettingsNavigation = (route: keyof MainStackParamList, title: string) => {
        if (route && !isLoading) {
            try {
                // Type-safe navigation based on route
                switch (route) {
                    case 'PlayMusicSettings':
                        navigation.navigate('PlayMusicSettings');
                        break;
                    case 'AccountSecurity':
                        navigation.navigate('AccountSecurity');
                        break;
                    case 'NewUpdates':
                        navigation.navigate('NewUpdates');
                        break;
                    case 'ReferFriends':
                        navigation.navigate('ReferFriends');
                        break;
                    case 'HowToPlay':
                        navigation.navigate('HowToPlay');
                        break;
                    case 'ResponsibleGaming':
                        navigation.navigate('ResponsibleGaming');
                        break;
                    case 'FairPlay':
                        navigation.navigate('FairPlay');
                        break;
                    case 'HelpDesk':
                        navigation.navigate('HelpDesk');
                        break;
                    case 'SystemStatus':
                        navigation.navigate('SystemStatus');
                        break;
                    case 'PrivacyPolicy':
                        navigation.navigate('PrivacyPolicy');
                        break;
                    case 'RNGCertification':
                        navigation.navigate('RNGCertification');
                        break;
                    case 'Careers':
                        navigation.navigate('Careers');
                        break;
                    case 'AboutUs':
                        navigation.navigate('AboutUs');
                        break;
                    case 'TermsOfUse':
                        navigation.navigate('TermsOfUse');
                        break;
                    case 'Legality':
                        navigation.navigate('Legality');
                        break;
                    default:
                        Alert.alert("Coming Soon", `${title} feature will be available soon!`);
                        break;
                }
            } catch (error) {
                console.error(`Navigation error to ${title}:`, error);
                Alert.alert("Coming Soon", `${title} feature will be available soon!`);
            }
        }
    };

    // Handle back navigation
    const handleBackPress = () => {
        if (!isLoading) {
            navigation.goBack();
        }
    };

    // Define settings items based on your folder structure
    const settingsItems = [
        // Updates folder screens
        {
            id: 1,
            title: "Play Music on App Launch",
            icon: music,
            category: "Updates",
            hasBottomBorder: true,
            route: "PlayMusicSettings" as keyof MainStackParamList,
            description: "Control app music preferences"
        },
        {
            id: 2,
            title: "Account Security",
            icon: accountsecurity,
            category: "Updates",
            hasBottomBorder: true,
            route: "AccountSecurity" as keyof MainStackParamList,
            description: "Manage your account security settings"
        },
        {
            id: 3,
            title: "New Updates",
            icon: newupdate,
            category: "Updates",
            hasBottomBorder: false,
            route: "NewUpdates" as keyof MainStackParamList,
            description: "Check latest app updates"
        },

        // Help folder screens
        {
            id: 4,
            title: "Refer Friends, Earn Money",
            icon: refer,
            category: "Help",
            hasBottomBorder: true,
            route: "ReferFriends" as keyof MainStackParamList,
            description: "Invite friends and earn rewards"
        },
        {
            id: 5,
            title: "How To Play Games",
            icon: howtoplay,
            category: "Help",
            hasBottomBorder: true,
            route: "HowToPlay" as keyof MainStackParamList,
            description: "Learn how to play games"
        },
        {
            id: 6,
            title: "Responsible Gaming",
            icon: responsible,
            category: "Help",
            hasBottomBorder: true,
            route: "ResponsibleGaming" as keyof MainStackParamList,
            description: "Gaming responsibility guidelines"
        },
        {
            id: 7,
            title: "Fair Play",
            icon: fairplay,
            category: "Help",
            hasBottomBorder: true,
            route: "FairPlay" as keyof MainStackParamList,
            description: "Fair play policies and rules"
        },
        {
            id: 8,
            title: "Help Desk",
            icon: helpdesk,
            category: "Help",
            hasBottomBorder: true,
            route: "HelpDesk" as keyof MainStackParamList,
            description: "Get help and support"
        },
        {
            id: 9,
            title: "System Status",
            icon: systemstatus,
            category: "Help",
            hasBottomBorder: false,
            route: "SystemStatus" as keyof MainStackParamList,
            description: "Check system status and uptime"
        },

        // System folder screens
        {
            id: 10,
            title: "Security & Privacy Policy",
            icon: securityandprivacy,
            category: "System",
            hasBottomBorder: true,
            route: "PrivacyPolicy" as keyof MainStackParamList,
            description: "Read our privacy policy"
        },
        {
            id: 11,
            title: "RNG Certification",
            icon: Rngcerti,
            category: "System",
            hasBottomBorder: true,
            route: "RNGCertification" as keyof MainStackParamList,
            description: "Random number generation certification"
        },
        {
            id: 12,
            title: "Careers",
            icon: careers,
            category: "System",
            hasBottomBorder: true,
            route: "Careers" as keyof MainStackParamList,
            description: "Join our team"
        },
        {
            id: 13,
            title: "About Us (Miragio Games)",
            icon: aboutus,
            category: "System",
            hasBottomBorder: true,
            route: "AboutUs" as keyof MainStackParamList,
            description: "Learn about Miragio Games"
        },
        {
            id: 14,
            title: "Terms of Use",
            icon: terms,
            category: "System",
            hasBottomBorder: true,
            route: "TermsOfUse" as keyof MainStackParamList,
            description: "Terms and conditions"
        },
        {
            id: 15,
            title: "Legality",
            icon: legality,
            category: "System",
            hasBottomBorder: false,
            route: "Legality" as keyof MainStackParamList,
            description: "Legal compliance information"
        }
    ];

    // Filter settings based on search query
    const filteredSettings = settingsItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered settings by category
    const groupedSettings = filteredSettings.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof settingsItems>);

    // Render settings item with responsive styling
    const renderSettingsItem = (item: typeof settingsItems[0]) => (
        <TouchableOpacity
            key={item.id}
            style={{
                backgroundColor: Colors.light.backlight2,
                minHeight: height * 0.075,
                paddingHorizontal: width * 0.04,
                paddingVertical: height * 0.015
            }}
            className="flex flex-row items-center justify-between"
            onPress={() => handleSettingsNavigation(item.route, item.title)}
            activeOpacity={0.7}
            disabled={isLoading}
        >
            {/* Settings item icon */}
            <View
                style={{
                    backgroundColor: Colors.light.whiteFefefe,
                    width: width * 0.1,
                    height: width * 0.1,
                    borderRadius: width * 0.03,
                    marginRight: width * 0.04
                }}
                className="flex items-center justify-center"
            >
                <Image
                    source={item.icon}
                    style={{
                        height: width * 0.06,
                        width: width * 0.06
                    }}
                />
            </View>

            {/* Settings item content */}
            <View className="flex-1">
                <View
                    style={{
                        borderColor: Colors.light.placeholderColorOp70,
                        paddingBottom: item.hasBottomBorder ? height * 0.015 : 0
                    }}
                    className={`flex-row justify-between items-center ${item.hasBottomBorder ? 'border-b' : ''}`}
                >
                    <View
                        className="flex-1"
                        style={{ marginRight: width * 0.03 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.045,
                                marginBottom: height * 0.005
                            }}
                            className="font-semibold"
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.placeholderColorOp70,
                                fontSize: width * 0.035
                            }}
                        >
                            {item.description}
                        </Text>
                    </View>

                    {/* Navigation arrow */}
                    <View className="flex items-center justify-center">
                        <Image
                            source={icons.go}
                            style={{
                                height: width * 0.035,
                                width: width * 0.035
                            }}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Clear search function
    const clearSearch = () => {
        setSearchQuery("");
        setSearchVisible(false);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== HEADER SECTION MATCHING TASKPAGE =================== */}
            <View style={{ height: height * 0.14 }}>
                {/* Background image */}
                <Image
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />

                {/* Header Content with proper flexbox layout */}
                <View
                    className="flex-1"
                    style={{
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    {/* Header row with proper spacing */}
                    <View
                        className="flex-row items-center justify-between"
                        style={{ height: height * 0.08 }}
                    >
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{
                                width: width * 0.1,
                                height: width * 0.1
                            }}
                            className="items-center justify-center"
                            disabled={isLoading}
                        >
                            <Image
                                source={icons.back}
                                style={{
                                    width: width * 0.04,
                                    height: width * 0.06
                                }}
                            />
                        </TouchableOpacity>

                        {/* Centered title */}
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.075
                            }}
                            className="font-medium"
                        >
                            Settings
                        </Text>

                        {/* Search toggle button */}
                        <TouchableOpacity
                            onPress={() => setSearchVisible(!searchVisible)}
                            style={{
                                width: width * 0.1,
                                height: width * 0.1
                            }}
                            className="items-center justify-center"
                            disabled={isLoading}
                        >
                            <Image
                                source={icons.search}
                                style={{
                                    height: width * 0.05,
                                    width: width * 0.05
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom border */}
                <View
                    className="absolute bottom-0 w-full"
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        height: 1
                    }}
                />
            </View>

            {/* =================== SEARCH INPUT SECTION =================== */}
            {searchVisible && (
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        borderColor: Colors.light.backlight2,
                        paddingHorizontal: width * 0.04,
                        paddingVertical: height * 0.015
                    }}
                    className="border-b"
                >
                    <View className="relative">
                        {/* Search input field */}
                        <TextInput
                            style={{
                                backgroundColor: Colors.light.backlight2,
                                color: Colors.light.whiteFefefe,
                                paddingHorizontal: width * 0.04,
                                paddingVertical: height * 0.015,
                                paddingRight: width * 0.12,
                                borderRadius: width * 0.025,
                                fontSize: width * 0.04
                            }}
                            placeholder="Search settings..."
                            placeholderTextColor={Colors.light.placeholderColorOp70}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={true}
                        />
                        {/* Clear search button */}
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: width * 0.03,
                                    top: 0,
                                    bottom: 0,
                                    width: width * 0.08,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => setSearchQuery("")}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.05
                                    }}
                                    className="font-bold"
                                >
                                    ×
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.15 }}
            >
                <View className="flex justify-center w-full">
                    {searchQuery.length > 0 ? (
                        // Search results display
                        filteredSettings.length > 0 ? (
                            <View>
                                {/* Search results header */}
                                <View
                                    style={{
                                        paddingHorizontal: width * 0.05,
                                        paddingTop: height * 0.025,
                                        paddingBottom: height * 0.01
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFefefe,
                                            fontSize: width * 0.045
                                        }}
                                        className="font-semibold"
                                    >
                                        Search Results ({filteredSettings.length})
                                    </Text>
                                </View>
                                {/* Render filtered settings items */}
                                <View
                                    style={{
                                        marginHorizontal: width * 0.03,
                                        borderRadius: width * 0.04,
                                        backgroundColor: Colors.light.backlight2
                                    }}
                                    className="overflow-hidden"
                                >
                                    {filteredSettings.map(renderSettingsItem)}
                                </View>
                            </View>
                        ) : (

                            <View
                                className="flex items-center justify-center"
                                style={{ paddingVertical: height * 0.1 }}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.045
                                    }}
                                    className="text-center"
                                >
                                    No settings found for "{searchQuery}"
                                </Text>
                                <TouchableOpacity
                                    onPress={clearSearch}
                                    style={{ marginTop: height * 0.02 }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.blueTheme,
                                            fontSize: width * 0.04
                                        }}
                                    >
                                        Clear Search
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        // Default grouped view by category (matching your folder structure)
                        <>
                            {/* Updates Section */}
                            {groupedSettings.Updates && (
                                <View style={{ marginBottom: height * 0.03 }}>
                                    <View
                                        style={{
                                            paddingHorizontal: width * 0.05,
                                            paddingTop: height * 0.025,
                                            paddingBottom: height * 0.01
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.045
                                            }}
                                            className="font-semibold"
                                        >
                                            Updates
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            marginHorizontal: width * 0.03,
                                            borderRadius: width * 0.04,
                                            backgroundColor: Colors.light.backlight2
                                        }}
                                        className="overflow-hidden"
                                    >
                                        {groupedSettings.Updates.map(renderSettingsItem)}
                                    </View>
                                </View>
                            )}

                            {/* Help Section */}
                            {groupedSettings.Help && (
                                <View style={{ marginBottom: height * 0.03 }}>
                                    <View
                                        style={{
                                            paddingHorizontal: width * 0.05,
                                            paddingTop: height * 0.025,
                                            paddingBottom: height * 0.01
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.045
                                            }}
                                            className="font-semibold"
                                        >
                                            Help
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            marginHorizontal: width * 0.03,
                                            borderRadius: width * 0.04,
                                            backgroundColor: Colors.light.backlight2
                                        }}
                                        className="overflow-hidden"
                                    >
                                        {groupedSettings.Help.map(renderSettingsItem)}
                                    </View>
                                </View>
                            )}

                            {/* System Section */}
                            {groupedSettings.System && (
                                <View style={{ marginBottom: height * 0.03 }}>
                                    <View
                                        style={{
                                            paddingHorizontal: width * 0.05,
                                            paddingTop: height * 0.025,
                                            paddingBottom: height * 0.01
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.045
                                            }}
                                            className="font-semibold"
                                        >
                                            System
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            marginHorizontal: width * 0.03,
                                            borderRadius: width * 0.04,
                                            backgroundColor: Colors.light.backlight2
                                        }}
                                        className="overflow-hidden"
                                    >
                                        {groupedSettings.System.map(renderSettingsItem)}
                                    </View>
                                </View>
                            )}
                        </>
                    )}

                    {/* =================== LOGOUT BUTTON SECTION =================== */}
                    <View
                        style={{
                            paddingHorizontal: width * 0.03,
                            marginTop: height * 0.03,
                            marginBottom: height * 0.02
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.bgBlueBtn,
                                height: height * 0.06,
                                borderRadius: width * 0.04
                            }}
                            className="flex items-center justify-center flex-row"
                            onPress={handleLogout}
                            disabled={isLoading}
                        >
                            <Image
                                source={icons.logout}
                                style={{
                                    height: width * 0.05,
                                    width: width * 0.05,
                                    marginRight: width * 0.03
                                }}
                            />
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05
                                }}
                                className="font-bold"
                            >
                                {isLoading ? 'Logging out...' : 'Logout'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default MorePagesScreen;