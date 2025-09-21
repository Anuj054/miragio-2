import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { icons } from '../constants/index';

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
    transactionData,
}) => {
    if (!transactionData) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: width * 0.05,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                }}
            >
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        borderRadius: 12,
                        padding: width * 0.05,
                        width: '100%',
                        maxWidth: width * 0.9,
                    }}
                >
                    {/* Icon */}
                    <View style={{ alignItems: 'center', marginBottom: height * 0.02 }}>
                        <View
                            style={{
                                backgroundColor: '#10B981',
                                width: width * 0.18,
                                height: width * 0.18,
                                borderRadius: width * 0.09,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: height * 0.015,
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: width * 0.1, fontWeight: 'bold' }}>✓</Text>
                        </View>
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.05,
                                fontWeight: '700',
                                textAlign: 'center',
                            }}
                        >
                            Withdrawal Submitted!
                        </Text>
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: width * 0.035,
                                textAlign: 'center',
                                marginTop: height * 0.01,
                            }}
                        >
                            Your withdrawal request has been created successfully
                        </Text>
                    </View>

                    {/* Details */}
                    <View
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            padding: width * 0.04,
                            marginBottom: height * 0.02,
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045,
                                fontWeight: '700',
                                marginBottom: height * 0.015,
                            }}
                        >
                            Transaction Details
                        </Text>

                        {[
                            ['Transaction ID', transactionData.transaction_id],
                            ['Coins Withdrawn', `${transactionData.coins} 🪙`],
                            ['Amount', `₹${transactionData.amount}`],
                            ['Status', transactionData.status],
                            ['Method', transactionData.payment_method.replace('_', ' ')],
                        ].map(([label, value], idx) => (
                            <View
                                key={idx}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: height * 0.01 }}
                            >
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: width * 0.035 }}>{label}:</Text>
                                <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.035, fontWeight: '600' }}>
                                    {value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Info */}
                    <View
                        style={{
                            backgroundColor: 'rgba(59,130,246,0.1)',
                            borderRadius: 8,
                            padding: width * 0.04,
                            marginBottom: height * 0.02,
                        }}
                    >
                        <Text
                            style={{
                                color: '#3B82F6',
                                fontSize: width * 0.04,
                                fontWeight: '600',
                                marginBottom: height * 0.01,
                            }}
                        >
                            ℹ️ Processing Time
                        </Text>
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: width * 0.035,
                                lineHeight: width * 0.05,
                            }}
                        >
                            Your withdrawal will be processed within 24–48 hours to your selected payment method.
                        </Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn,
                            borderRadius: 8,
                            paddingVertical: height * 0.018,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: width * 0.045, fontWeight: '700' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default WithdrawalSuccessModal;
