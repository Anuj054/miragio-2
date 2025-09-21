import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface PaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    visible,
    onClose,
    onSuccess,
    userId,
}) => {
    const [modalStep, setModalStep] = useState<'select' | 'upi' | 'bank'>('select');
    const [upiId, setUpiId] = useState('');

    const closeAll = () => {
        setModalStep('select');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={closeAll}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingHorizontal: width * 0.05,
                        paddingVertical: height * 0.025,
                        maxHeight: height * 0.8,
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: height * 0.02 }}>
                        <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.05, fontWeight: '700' }}>
                            {modalStep === 'select' ? 'Add Payment Method' : modalStep === 'upi' ? 'Add UPI ID' : 'Add Bank Account'}
                        </Text>
                        <TouchableOpacity onPress={closeAll}>
                            <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.06 }}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {modalStep === 'select' && (
                        <View>
                            <TouchableOpacity
                                onPress={() => setModalStep('upi')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: width * 0.04,
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    borderRadius: 10,
                                    marginBottom: height * 0.02,
                                }}
                            >
                                <Text style={{ fontSize: width * 0.06, marginRight: width * 0.03 }}>💰</Text>
                                <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.045 }}>UPI ID</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setModalStep('bank')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: width * 0.04,
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    borderRadius: 10,
                                }}
                            >
                                <Text style={{ fontSize: width * 0.06, marginRight: width * 0.03 }}>🏦</Text>
                                <Text style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.045 }}>Bank Account</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {modalStep === 'upi' && (
                        <ScrollView>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: width * 0.035, marginBottom: height * 0.015 }}>
                                Enter your UPI ID:
                            </Text>
                            <TextInput
                                value={upiId}
                                onChangeText={setUpiId}
                                placeholder="name@bank"
                                placeholderTextColor="gray"
                                style={{
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    borderRadius: 8,
                                    padding: width * 0.04,
                                    fontSize: width * 0.04,
                                    marginBottom: height * 0.025,
                                }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    onPress={() => setModalStep('select')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        paddingVertical: height * 0.02,
                                        borderRadius: 8,
                                        marginRight: width * 0.02,
                                    }}
                                >
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => Alert.alert('UPI Saved')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: Colors.light.bgBlueBtn,
                                        paddingVertical: height * 0.02,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Add UPI</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}

                    {/* Bank form would follow the same pattern, using width/height scaling */}
                </View>
            </View>
        </Modal>
    );
};

export default PaymentMethodModal;
