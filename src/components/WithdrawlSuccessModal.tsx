import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Colors } from "../constants/Colors";
import { icons } from "../constants/index";
// Translation imports - USING CUSTOM COMPONENTS
import { TranslatedText } from './TranslatedText';
import { useTranslation } from '../context/TranslationContext';

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
    const { currentLanguage } = useTranslation();

    if (!transactionData) return null;

    // Helper function to format payment method
    const formatPaymentMethod = (method: string) => {
        const formattedMethod = method.replace('_', ' ');
        if (currentLanguage === 'hi') {
            switch (method.toLowerCase()) {
                case 'upi':
                    return 'UPI';
                case 'bank_transfer':
                case 'bank transfer':
                    return 'बैंक ट्रांसफर';
                default:
                    return formattedMethod;
            }
        }
        return formattedMethod;
    };

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
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045
                            }}
                            className="font-bold text-center"
                        >
                            Withdrawal Submitted!
                        </TranslatedText>
                        <TranslatedText
                            style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: width * 0.03,
                                lineHeight: width * 0.04,
                                textAlign: 'center',
                                marginTop: height * 0.01
                            }}
                        >
                            Your withdrawal request has been created successfully
                        </TranslatedText>
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
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04,
                                marginBottom: height * 0.015
                            }}
                            className="font-bold"
                        >
                            Transaction Details
                        </TranslatedText>

                        <View style={{ gap: height * 0.01 }}>
                            <View className="flex-row justify-between items-center">
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Transaction ID:
                                </TranslatedText>
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
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Coins Withdrawn:
                                </TranslatedText>
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
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Amount:
                                </TranslatedText>
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
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Status:
                                </TranslatedText>
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
                                        {currentLanguage === 'hi' ?
                                            (transactionData.status === 'pending' ? 'लंबित' :
                                                transactionData.status === 'completed' ? 'पूर्ण' :
                                                    transactionData.status === 'failed' ? 'असफल' :
                                                        transactionData.status) :
                                            transactionData.status}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03
                                    }}
                                >
                                    Method:
                                </TranslatedText>
                                <Text
                                    style={{
                                        color: Colors.light.whiteFfffff,
                                        fontSize: width * 0.03
                                    }}
                                    className="font-medium capitalize"
                                >
                                    {formatPaymentMethod(transactionData.payment_method)}
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
                            <TranslatedText
                                style={{
                                    color: '#60A5FA',
                                    fontSize: width * 0.035
                                }}
                                className="font-bold"
                            >
                                Processing Time
                            </TranslatedText>
                        </View>
                        <TranslatedText
                            style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: width * 0.03,
                                lineHeight: width * 0.04
                            }}
                        >
                            Your withdrawal will be processed within 24-48 hours. You'll receive the amount in your selected payment method.
                        </TranslatedText>
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
                        <TranslatedText
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04
                            }}
                            className="font-bold"
                        >
                            Close
                        </TranslatedText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default WithdrawalSuccessModal;