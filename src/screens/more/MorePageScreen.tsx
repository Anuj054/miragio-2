import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, StatusBar, Dimensions } from "react-native";
import { useState } from "react";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import bg2 from "../../assets/images/bg2.png";
import { icons } from "../../constants/index";

// Settings category icons imports
import accountsecurity from "../../assets/images/accountsecurity.png"
import newupdate from "../../assets/images/newupdate.png"

import refer from "../../assets/images/refer.png"


import helpdesk from "../../assets/images/helpdesk.png"
import systemstatus from "../../assets/images/systemstatus.png"
import securityandprivacy from "../../assets/images/securityandprivacy.png"
import Rngcerti from "../../assets/images/Rngcerti.png"
import careers from "../../assets/images/careers.png"
import aboutus from "../../assets/images/aboutus.png"
import terms from "../../assets/images/terms.png"

import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import type { MainStackParamList } from "../../navigation/types";

// Translation imports - USING CUSTOM COMPONENTS
import { TranslatedText } from '../../components/TranslatedText';
import { useTranslation } from '../../context/TranslationContext';
import { usePlaceholder } from '../../hooks/useTranslatedText';

// Define props type for React Navigation
type Props = NativeStackScreenProps<MainStackParamList, 'MorePagesScreen'>;

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

interface SettingsItem {
    id: number;
    title: string;
    titleHi: string;
    icon: any;
    category: string;
    categoryHi: string;
    hasBottomBorder: boolean;
    route: keyof MainStackParamList;
    description: string;
    descriptionHi: string;
}

const MorePagesScreen = ({ navigation }: Props) => {
    const { currentLanguage } = useTranslation();

    // State for search functionality
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Get user context for logout functionality
    const { logout } = useUser();

    // Using custom placeholder hook for search
    const searchPlaceholder = usePlaceholder('Search settings...', 'सेटिंग्स खोजें...');

    // Logout handler with confirmation
    const handleLogout = () => {
        Alert.alert(
            currentLanguage === 'hi' ? "लॉगआउट" : "Logout",
            currentLanguage === 'hi' ? "क्या आप वाकई लॉगआउट करना चाहते हैं?" : "Are you sure you want to logout?",
            [
                {
                    text: currentLanguage === 'hi' ? "रद्द करें" : "Cancel",
                    style: "cancel"
                },
                {
                    text: currentLanguage === 'hi' ? "लॉगआउट" : "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await logout();
                            console.log('Logout successful');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert(
                                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                                currentLanguage === 'hi' ? "लॉगआउट करने में असफल। कृपया फिर से कोशिश करें।" : "Failed to logout. Please try again."
                            );
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

                    case 'AccountSecurity':
                        navigation.navigate('AccountSecurity');
                        break;
                    case 'NewUpdates':
                        navigation.navigate('NewUpdates');
                        break;
                    case 'ReferFriends':
                        navigation.navigate('ReferFriends');
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

                    default:
                        Alert.alert(
                            currentLanguage === 'hi' ? "जल्द आ रहा है" : "Coming Soon",
                            currentLanguage === 'hi' ? `${title} फीचर जल्द ही उपलब्ध होगा!` : `${title} feature will be available soon!`
                        );
                        break;
                }
            } catch (error) {
                console.error(`Navigation error to ${title}:`, error);
                Alert.alert(
                    currentLanguage === 'hi' ? "जल्द आ रहा है" : "Coming Soon",
                    currentLanguage === 'hi' ? `${title} फीचर जल्द ही उपलब्ध होगा!` : `${title} feature will be available soon!`
                );
            }
        }
    };

    // Handle back navigation
    const handleBackPress = () => {
        if (!isLoading) {
            navigation.goBack();
        }
    };

    // Define settings items with Hindi translations
    const settingsItems: SettingsItem[] = [
        // Updates folder screens

        {
            id: 1,
            title: "Account Security",
            titleHi: "खाता सुरक्षा",
            icon: accountsecurity,
            category: "Updates",
            categoryHi: "अपडेट्स",
            hasBottomBorder: true,
            route: "AccountSecurity" as keyof MainStackParamList,
            description: "Manage your account security settings",
            descriptionHi: "अपनी खाता सुरक्षा सेटिंग्स प्रबंधित करें"
        },
        {
            id: 2,
            title: "New Updates",
            titleHi: "नए अपडेट्स",
            icon: newupdate,
            category: "Updates",
            categoryHi: "अपडेट्स",
            hasBottomBorder: false,
            route: "NewUpdates" as keyof MainStackParamList,
            description: "Check latest app updates",
            descriptionHi: "नवीनतम ऐप अपडेट्स जांचें"
        },

        // Help folder screens
        {
            id: 3,
            title: "Refer Friends, Earn Money",
            titleHi: "मित्रों को रेफर करें, पैसे कमाएं",
            icon: refer,
            category: "Help",
            categoryHi: "सहायता",
            hasBottomBorder: true,
            route: "ReferFriends" as keyof MainStackParamList,
            description: "Invite friends and earn rewards",
            descriptionHi: "मित्रों को आमंत्रित करें और पुरस्कार कमाएं"
        },



        {
            id: 4,
            title: "Help Desk",
            titleHi: "सहायता डेस्क",
            icon: helpdesk,
            category: "Help",
            categoryHi: "सहायता",
            hasBottomBorder: true,
            route: "HelpDesk" as keyof MainStackParamList,
            description: "Get help and support",
            descriptionHi: "सहायता और समर्थन प्राप्त करें"
        },
        {
            id: 5,
            title: "System Status",
            titleHi: "सिस्टम स्थिति",
            icon: systemstatus,
            category: "Help",
            categoryHi: "सहायता",
            hasBottomBorder: false,
            route: "SystemStatus" as keyof MainStackParamList,
            description: "Check system status and uptime",
            descriptionHi: "सिस्टम स्थिति और अपटाइम जांचें"
        },

        // System folder screens
        {
            id: 6,
            title: "Security & Privacy Policy",
            titleHi: "सुरक्षा और गोपनीयता नीति",
            icon: securityandprivacy,
            category: "System",
            categoryHi: "सिस्टम",
            hasBottomBorder: true,
            route: "PrivacyPolicy" as keyof MainStackParamList,
            description: "Read our privacy policy",
            descriptionHi: "हमारी गोपनीयता नीति पढ़ें"
        },
        {
            id: 7,
            title: "RNG Certification",
            titleHi: "RNG प्रमाणीकरण",
            icon: Rngcerti,
            category: "System",
            categoryHi: "सिस्टम",
            hasBottomBorder: true,
            route: "RNGCertification" as keyof MainStackParamList,
            description: "Random number generation certification",
            descriptionHi: "यादृच्छिक संख्या निर्माण प्रमाणीकरण"
        },
        {
            id: 8,
            title: "Careers",
            titleHi: "करियर",
            icon: careers,
            category: "System",
            categoryHi: "सिस्टम",
            hasBottomBorder: true,
            route: "Careers" as keyof MainStackParamList,
            description: "Join our team",
            descriptionHi: "हमारी टीम में शामिल हों"
        },
        {
            id: 9,
            title: "About Us (Miragio )",
            titleHi: "हमारे बारे में (मिराजियो )",
            icon: aboutus,
            category: "System",
            categoryHi: "सिस्टम",
            hasBottomBorder: true,
            route: "AboutUs" as keyof MainStackParamList,
            description: "Learn about Miragio ",
            descriptionHi: "मिराजियो  के बारे में जानें"
        },
        {
            id: 10,
            title: "Terms of Use",
            titleHi: "उपयोग की शर्तें",
            icon: terms,
            category: "System",
            categoryHi: "सिस्टम",
            hasBottomBorder: true,
            route: "TermsOfUse" as keyof MainStackParamList,
            description: "Terms and conditions",
            descriptionHi: "नियम और शर्तें"
        },

    ];

    // Helper functions to get text in current language
    const getItemTitle = (item: SettingsItem) => currentLanguage === 'hi' ? item.titleHi : item.title;
    const getItemDescription = (item: SettingsItem) => currentLanguage === 'hi' ? item.descriptionHi : item.description;
    const getItemCategory = (item: SettingsItem) => currentLanguage === 'hi' ? item.categoryHi : item.category;

    // Filter settings based on search query
    const filteredSettings = settingsItems.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
            getItemTitle(item).toLowerCase().includes(searchLower) ||
            getItemCategory(item).toLowerCase().includes(searchLower) ||
            getItemDescription(item).toLowerCase().includes(searchLower) ||
            item.title.toLowerCase().includes(searchLower) ||
            item.titleHi.toLowerCase().includes(searchLower)
        );
    });

    // Group filtered settings by category
    const groupedSettings = filteredSettings.reduce((acc, item) => {
        const categoryKey = getItemCategory(item);
        if (!acc[categoryKey]) {
            acc[categoryKey] = [];
        }
        acc[categoryKey].push(item);
        return acc;
    }, {} as Record<string, SettingsItem[]>);

    // Render settings item with responsive styling
    const renderSettingsItem = (item: SettingsItem) => (
        <TouchableOpacity
            key={item.id}
            style={{
                backgroundColor: Colors.light.backlight2,
                minHeight: height * 0.075,
                paddingHorizontal: width * 0.04,
                paddingVertical: height * 0.015
            }}
            className="flex flex-row items-center justify-between"
            onPress={() => handleSettingsNavigation(item.route, getItemTitle(item))}
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
                            {getItemTitle(item)}
                        </Text>
                        <Text
                            style={{
                                color: Colors.light.placeholderColorOp70,
                                fontSize: width * 0.035
                            }}
                        >
                            {getItemDescription(item)}
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

                        {/* Centered title with translation */}
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.075
                            }}
                            className="font-medium"
                        >
                            Settings
                        </TranslatedText>

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
                            placeholder={searchPlaceholder}
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
                                        {currentLanguage === 'hi' ?
                                            `खोज परिणाम (${filteredSettings.length})` :
                                            `Search Results (${filteredSettings.length})`}
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
                                    {currentLanguage === 'hi' ?
                                        `"${searchQuery}" के लिए कोई सेटिंग नहीं मिली` :
                                        `No settings found for "${searchQuery}"`}
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
                                        {currentLanguage === 'hi' ? 'खोज साफ़ करें' : 'Clear Search'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        // Default grouped view by category
                        <>
                            {/* Updates Section */}
                            {groupedSettings[currentLanguage === 'hi' ? 'अपडेट्स' : 'Updates'] && (
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
                                            {currentLanguage === 'hi' ? 'अपडेट्स' : 'Updates'}
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
                                        {groupedSettings[currentLanguage === 'hi' ? 'अपडेट्स' : 'Updates'].map(renderSettingsItem)}
                                    </View>
                                </View>
                            )}

                            {/* Help Section */}
                            {groupedSettings[currentLanguage === 'hi' ? 'सहायता' : 'Help'] && (
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
                                            {currentLanguage === 'hi' ? 'सहायता' : 'Help'}
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
                                        {groupedSettings[currentLanguage === 'hi' ? 'सहायता' : 'Help'].map(renderSettingsItem)}
                                    </View>
                                </View>
                            )}

                            {/* System Section */}
                            {groupedSettings[currentLanguage === 'hi' ? 'सिस्टम' : 'System'] && (
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
                                            {currentLanguage === 'hi' ? 'सिस्टम' : 'System'}
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
                                        {groupedSettings[currentLanguage === 'hi' ? 'सिस्टम' : 'System'].map(renderSettingsItem)}
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
                                {isLoading ?
                                    (currentLanguage === 'hi' ? 'लॉगआउट हो रहा है...' : 'Logging out...') :
                                    (currentLanguage === 'hi' ? 'लॉगआउट' : 'Logout')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default MorePagesScreen;