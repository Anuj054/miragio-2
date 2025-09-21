import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Colors } from "../constants/Colors";
import { icons } from "../constants/index";

interface WithdrawalSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    transactionData: {
        transaction_id: string;
        amount: string;
        coins: string;
        status: string;
        payment_method: string;
    } | null;
}

const WithdrawalSuccessModal: React.FC<WithdrawalSuccessModalProps> = ({
    visible,
    onClose,
    transactionData
}) => {
    if (!transactionData) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-center items-center px-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            >
                <View
                    className="rounded-lg p-4 w-full max-w-sm"
                    style={{
                        backgroundColor: Colors.light.blackPrimary || '#1F2937',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    {/* Success Icon - Smaller */}
                    <View className="items-center mb-4">
                        <View
                            className="rounded-full p-3 mb-3 items-center justify-center"
                            style={{
                                backgroundColor: '#10B981',
                                width: 60,
                                height: 60
                            }}
                        >
                            <Text className="text-white text-2xl font-bold">✓</Text>
                        </View>
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-lg font-bold text-center"
                        >
                            Withdrawal Submitted!
                        </Text>
                        <Text
                            className="text-center mt-2 text-xs leading-4"
                            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            Your withdrawal request has been created successfully
                        </Text>
                    </View>

                    {/* Transaction Details - Smaller */}
                    <View
                        className="rounded-lg p-3 mb-4"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                    >
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-base font-bold mb-3"
                        >
                            Transaction Details
                        </Text>

                        <View className="space-y-2">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs">
                                    Transaction ID:
                                </Text>
                                <Text
                                    style={{ color: Colors.light.whiteFfffff }}
                                    className="font-medium text-xs"
                                >
                                    {transactionData.transaction_id}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs">
                                    Coins Withdrawn:
                                </Text>
                                <View className="flex-row items-center">
                                    <Image source={icons.maincoin} className="w-3 h-3 mr-1" />
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="font-medium text-xs"
                                    >
                                        {transactionData.coins}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs">
                                    Amount:
                                </Text>
                                <Text className="text-green-500 font-bold text-sm">
                                    ₹{transactionData.amount}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs">
                                    Status:
                                </Text>
                                <View
                                    className="px-2 py-1 rounded-full"
                                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}
                                >
                                    <Text className="text-yellow-500 text-xs font-medium capitalize">
                                        {transactionData.status}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs">
                                    Method:
                                </Text>
                                <Text
                                    style={{ color: Colors.light.whiteFfffff }}
                                    className="font-medium capitalize text-xs"
                                >
                                    {transactionData.payment_method.replace('_', ' ')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Processing Time Info - Smaller */}
                    <View
                        className="rounded-lg p-3 mb-4"
                        style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        <View className="flex-row items-center mb-2">
                            <Text className="text-blue-400 text-sm mr-2">ℹ️</Text>
                            <Text className="text-blue-400 font-bold text-sm">Processing Time</Text>
                        </View>
                        <Text
                            className="text-xs leading-4"
                            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        >
                            Your withdrawal will be processed within 24-48 hours.
                            You'll receive the amount in your selected payment method.
                        </Text>
                    </View>

                    {/* Close Button - Smaller */}
                    <TouchableOpacity
                        onPress={onClose}
                        className="rounded-lg py-3 items-center"
                        style={{ backgroundColor: Colors.light.bgBlueBtn || '#3B82F6' }}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-base font-bold"
                        >
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default WithdrawalSuccessModal;