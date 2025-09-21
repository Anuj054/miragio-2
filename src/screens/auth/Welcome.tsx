// src/screens/Welcome.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Modal,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import Swiper from 'react-native-swiper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../constants/Colors';
import { onboarding } from '../../constants';
import type { AuthStackParamList } from '../../navigation/types';
import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const Welcome = ({ navigation }: Props) => {
    const swiperRef = useRef<Swiper>(null);
    const [, setActiveIndex] = useState<number>(0);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [isFirstTime, setIsFirstTime] = useState(true);

    const { currentLanguage, changeLanguage, isLoading } = useTranslation();

    // Check if user has selected language before
    useEffect(() => {
        checkFirstTimeUser();
    }, []);

    const checkFirstTimeUser = async () => {
        try {
            const hasSelectedLanguage = await AsyncStorage.getItem('hasSelectedLanguage');
            if (!hasSelectedLanguage) {
                setIsFirstTime(true);
                setShowLanguageModal(true);
            } else {
                setIsFirstTime(false);
            }
        } catch (error) {
            console.error('Error checking first time user:', error);
        }
    };

    const handleLanguageSelect = async (languageCode: 'en' | 'hi') => {
        await changeLanguage(languageCode);
        await AsyncStorage.setItem('hasSelectedLanguage', 'true');
        setShowLanguageModal(false);
        setIsFirstTime(false);
    };

    const handleSignUpPress = () => {
        navigation.replace('SignUp');
    };

    const handleSignInPress = () => {
        navigation.replace('SignIn');
    };

    const openLanguageModal = () => {
        setShowLanguageModal(true);
    };

    return (
        <View className="flex-1 bg-black">
            <Swiper
                ref={swiperRef}
                loop={false}
                dot={
                    <View
                        className="w-8 h-1 mx-1 rounded-full"
                        style={{ backgroundColor: Colors.light.secondaryText }}
                    />
                }
                activeDot={
                    <View
                        className="w-8 h-1 mx-1 rounded-full"
                        style={{ backgroundColor: Colors.light.blueTheme }}
                    />
                }
                onIndexChanged={(index: number) => setActiveIndex(index)}
            >
                {onboarding.map((item) => (
                    <View key={item.id} className="flex-1 items-center justify-center">
                        <Image
                            source={item.image}
                            className="w-full h-full"
                            resizeMode="cover"
                            style={{ width, height }}
                        />
                    </View>
                ))}
            </Swiper>

            {/* Language selector - now clickable and shows current language */}
            <View
                className="absolute"
                style={{
                    top: height * 0.05,
                    right: width * 0.04
                }}
            >
                <TouchableOpacity
                    className="py-2 px-3 bg-black bg-opacity-50 rounded-full"
                    onPress={openLanguageModal}
                >
                    <Text
                        className="font-medium text-white"
                        style={{ fontSize: width * 0.035 }}
                    >
                        {currentLanguage === 'hi' ? 'भाषा' : 'Language'} ({currentLanguage.toUpperCase()})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bottom content with translated text */}
            <View
                className="absolute left-0 right-0 items-center"
                style={{
                    bottom: height * 0.08,
                    paddingHorizontal: width * 0.06
                }}
            >
                <View
                    className="items-center"
                    style={{
                        marginBottom: height * 0.04,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    <View className="flex-row items-center justify-center flex-wrap">
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.065,
                                lineHeight: width * 0.097

                            }}
                            className="font-bold text-center"
                        >
                            Claim Your
                        </TranslatedText>

                        <TranslatedText
                            style={{
                                color: Colors.light.blueBgOnboarding,
                                fontSize: width * 0.06,
                                lineHeight: width * 0.097,
                                paddingtop: height * 0.01

                            }}
                            className="font-bold"
                        >
                            Bonus
                        </TranslatedText>
                    </View>
                    <TranslatedText
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.06,
                            lineHeight: width * 0.07,

                        }}
                        className="font-semibold text-center"
                    >
                        Instantly Upon Signup!
                    </TranslatedText>
                </View>

                {/* Buttons with translated text */}
                <View
                    className="w-full items-center"
                    style={{
                        maxWidth: width * 0.85,
                        paddingHorizontal: width * 0.02
                    }}
                >
                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn,
                            width: '100%',
                            height: height * 0.06,
                            borderRadius: 16,
                            marginBottom: height * 0.02
                        }}
                        className="flex justify-center items-center"
                        onPress={handleSignUpPress}
                    >
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.055
                            }}
                            className="font-semibold"
                        >
                            Sign Up
                        </TranslatedText>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.blackPrimary,
                            width: '100%',
                            height: height * 0.06,
                            borderRadius: 16
                        }}
                        className="flex justify-center items-center"
                        onPress={handleSignInPress}
                    >
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.055
                            }}
                            className="font-semibold"
                        >
                            Login
                        </TranslatedText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Language Selection Modal */}
            <Modal
                visible={showLanguageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !isFirstTime && setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {isFirstTime ? 'Welcome! Choose Your Language' : 'Select Language'}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    स्वागत है! अपनी भाषा चुनें
                                </Text>
                            </View>

                            {/* Language Options */}
                            <View style={styles.languageOptions}>
                                {/* English Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        currentLanguage === 'en' && styles.selectedOption
                                    ]}
                                    onPress={() => handleLanguageSelect('en')}
                                    disabled={isLoading}
                                >
                                    <View style={styles.languageInfo}>
                                        <Text style={styles.languageFlag}>🇺🇸</Text>
                                        <View style={styles.languageText}>
                                            <Text style={[
                                                styles.languageName,
                                                currentLanguage === 'en' && styles.selectedText
                                            ]}>
                                                English
                                            </Text>
                                            <Text style={styles.languageNative}>
                                                English
                                            </Text>
                                        </View>
                                    </View>
                                    {currentLanguage === 'en' && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </TouchableOpacity>

                                {/* Hindi Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        currentLanguage === 'hi' && styles.selectedOption
                                    ]}
                                    onPress={() => handleLanguageSelect('hi')}
                                    disabled={isLoading}
                                >
                                    <View style={styles.languageInfo}>
                                        <Text style={styles.languageFlag}>🇮🇳</Text>
                                        <View style={styles.languageText}>
                                            <Text style={[
                                                styles.languageName,
                                                currentLanguage === 'hi' && styles.selectedText
                                            ]}>
                                                Hindi
                                            </Text>
                                            <Text style={styles.languageNative}>
                                                हिन्दी
                                            </Text>
                                        </View>
                                    </View>
                                    {currentLanguage === 'hi' && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Continue Button (only for first time) */}
                            {isFirstTime && (
                                <TouchableOpacity
                                    style={[
                                        styles.continueButton,
                                        isLoading && styles.disabledButton
                                    ]}
                                    onPress={() => handleLanguageSelect(currentLanguage)}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.continueButtonText}>
                                        {isLoading ? 'Please wait...' : 'Continue / जारी रखें'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Close button for non-first time users */}
                            {!isFirstTime && (
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowLanguageModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close / बंद करें</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    languageOptions: {
        marginBottom: 24,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#f0f0f0',
        marginBottom: 12,
        backgroundColor: '#fafafa',
    },
    selectedOption: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f7ff',
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageFlag: {
        fontSize: 28,
        marginRight: 12,
    },
    languageText: {
        flex: 1,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    selectedText: {
        color: '#007AFF',
    },
    languageNative: {
        fontSize: 16,
        color: '#666',
    },
    checkMark: {
        fontSize: 20,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    continueButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    closeButtonText: {
        color: '#666',
        fontSize: 16,
    },
});

export default Welcome;