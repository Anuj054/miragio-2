import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Colors } from "../constants/Colors";
import { icons } from "../constants/index";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

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
                className="flex-1 justify-center items-center"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingHorizontal: width * 0.04
                }}
            >
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary || '#1F2937',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
                        borderRadius: 12,
                        padding: width * 0.04,
                        width: '100%',
                        maxWidth: width * 0.85
                    }}
                >
                    {/* Success Icon */}
                    <View
                        className="items-center"
                        style={{ marginBottom: height * 0.02 }}
                    >
                        <View
                            style={{
                                backgroundColor: '#10B981',
                                width: width * 0.15,
                                height: width * 0.15,
                                borderRadius: (width * 0.15) / 2,
                                marginBottom: height * 0.015
                            }}
                            className="items-center justify-center"
                        >
                            <Text
                                style={{
                                    color: 'white',
                                    fontSize: width * 0.06
                                }}
                                className="font-bold"
                            >
                                ✓
                            </Text>
                        </View>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045
                            }}
                            className="font-bold text-center"
                        >
                            Withdrawal Submitted!
                        </Text>
                        <Text
                            style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: width * 0.03,
                                lineHeight: width * 0.04,
                                textAlign: 'center',
                                marginTop: height * 0.01
                            }}
                        >
                            Your withdrawal request has been created successfully
                        </Text>
                    </View>

                    {/* Transaction Details */}
                    <View
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            borderRadius: 8,
                            padding: width * 0.03,
                            marginBottom: height * 0.02
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04,
                                marginBottom: height * 0.015
                            }}
                            className="font-bold"
                        >
                            Transaction Details
                        </Text>

                        <View style={{ gap: height * 0.01 }}>
                            <View className="flex-row justify-between items-center">
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Transaction ID:
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.03
                                    }}
                                    className="font-medium"
                                >
                                    {transactionData.transaction_id}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Coins Withdrawn:
                                </Text>
                                <View className="flex-row items-center">
                                    <Image
                                        source={icons.maincoin}
                                        style={{
                                            width: width * 0.03,
                                            height: width * 0.03,
                                            marginRight: width * 0.01
                                        }}
                                    />
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.03
                                        }}
                                        className="font-medium"
                                    >
                                        {transactionData.coins}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Amount:
                                </Text>
                                <Text
                                    style={{
                                        color: '#10B981',
                                        fontSize: width * 0.035
                                    }}
                                    className="font-bold"
                                >
                                    ₹{transactionData.amount}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Status:
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                        paddingHorizontal: width * 0.02,
                                        paddingVertical: height * 0.005,
                                        borderRadius: 15
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#F59E0B',
                                            fontSize: width * 0.03
                                        }}
                                        className="font-medium capitalize"
                                    >
                                        {transactionData.status}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Method:
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.03
                                    }}
                                    className="font-medium capitalize"
                                >
                                    {transactionData.payment_method.replace('_', ' ')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Processing Time Info */}
                    <View
                        style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(59, 130, 246, 0.2)',
                            borderRadius: 8,
                            padding: width * 0.03,
                            marginBottom: height * 0.02
                        }}
                    >
                        <View
                            className="flex-row items-center"
                            style={{ marginBottom: height * 0.01 }}
                        >
                            <Text
                                style={{
                                    color: '#60A5FA',
                                    fontSize: width * 0.035,
                                    marginRight: width * 0.02
                                }}
                            >
                                ℹ️
                            </Text>
                            <Text
                                style={{
                                    color: '#60A5FA',
                                    fontSize: width * 0.035
                                }}
                                className="font-bold"
                            >
                                Processing Time
                            </Text>
                        </View>
                        <Text
                            style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: width * 0.03,
                                lineHeight: width * 0.04
                            }}
                        >
                            Your withdrawal will be processed within 24-48 hours.
                            You'll receive the amount in your selected payment method.
                        </Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn || '#3B82F6',
                            borderRadius: 8,
                            paddingVertical: height * 0.015
                        }}
                        className="items-center"
                        activeOpacity={0.8}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04
                            }}
                            className="font-bold"
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