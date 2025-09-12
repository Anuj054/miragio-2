import React from 'react';
import { Image, Text, TouchableOpacity, View, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { icons } from '../constants/index';
import { Colors } from '../constants/Colors';
import CustomGradientButtonwithicon from './GradientButtonWithIcon';

// Navigation types
type NavigationProp = any;

// TypeScript interface for component props
interface NoTransactionsModalProps {
    visible: boolean;
    onClose: () => void;
    activeFilter: string;
}

const NoTransactionsModal: React.FC<NoTransactionsModalProps> = ({
    visible,
    onClose,
    activeFilter
}) => {
    // Navigation for React Native CLI
    const navigation = useNavigation<NavigationProp>();

    // Handle start game button press with navigation
    const handleStartGame = () => {
        onClose();
        // Small delay to ensure modal closes before navigation
        setTimeout(() => {
            navigation.replace("TaskPage");
        }, 100);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* =================== MODAL OVERLAY BACKGROUND =================== */}
            <TouchableOpacity
                activeOpacity={1}
                className="flex-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                onPress={onClose}
            >
                {/* =================== MODAL CONTENT CONTAINER =================== */}
                <View className="flex-1 items-center justify-center px-5">
                    {/* Modal content - Prevent background tap from closing modal */}
                    <TouchableOpacity
                        activeOpacity={1}
                        className="p-8 rounded-2xl items-center w-full max-w-sm"
                        style={{
                            backgroundColor: Colors.light.whiteFfffff,
                            borderLeftWidth: 4,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* =================== WALLET ICON SECTION =================== */}
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center mb-6"
                            style={{
                                backgroundColor: 'rgba(33, 158, 188, 0.1)', // Light blue background
                            }}
                        >
                            <Image
                                source={icons.walletgif || icons.wallet || icons.coin}
                                className="w-12 h-12"
                                style={{ tintColor: Colors.light.bgBlueBtn }}
                            />
                        </View>

                        {/* =================== MODAL CONTENT SECTION =================== */}

                        {/* Dynamic title based on active filter */}
                        <Text
                            className="text-xl font-bold mb-3 text-center"
                            style={{ color: Colors.light.blackPrimary }}
                        >
                            No {activeFilter === 'All' ? 'Transactions' : activeFilter} Found
                        </Text>

                        {/* Descriptive message for user guidance */}
                        <Text
                            className="text-center font-normal mb-8 px-2 leading-6"
                            style={{
                                color: Colors.light.backlight2 || '#6B7280',
                                fontSize: 16
                            }}
                        >
                            {activeFilter === 'All'
                                ? "Start completing tasks to see your transaction history here!"
                                : `No ${activeFilter.toLowerCase()} transactions available yet. Complete tasks to earn rewards!`
                            }
                        </Text>

                        {/* =================== ACTION BUTTON SECTION =================== */}

                        {/* Enhanced button with better styling */}
                        <View className="w-full">
                            <CustomGradientButtonwithicon
                                text='Go to Tasks'
                                textColor={Colors.light.whiteFefefe}
                                icon={icons.house || icons.home1}
                                iconSize={20}
                                height={52}
                                width="100%"
                                iconPosition='left'
                                borderRadius={16}
                                fontSize={16}
                                fontWeight="700"
                                onPress={handleStartGame}
                            />
                        </View>

                        {/* =================== CLOSE BUTTON SECTION =================== */}
                        <TouchableOpacity
                            onPress={onClose}
                            className="mt-4 py-3 px-6"
                        >
                            <Text
                                className="text-center font-semibold"
                                style={{
                                    color: Colors.light.bgBlueBtn,
                                    fontSize: 16
                                }}
                            >
                                Close
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default NoTransactionsModal;
