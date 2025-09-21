import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

// Get screen dimensions
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
    userId
}) => {
    const [modalStep, setModalStep] = useState<'select' | 'upi' | 'bank'>('select');
    const [formLoading, setFormLoading] = useState<boolean>(false);

    // UPI form state
    const [upiId, setUpiId] = useState<string>("");

    // Bank form state - Updated to match API requirements
    const [bankDetails, setBankDetails] = useState({
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        bankName: "",
        branch: "",
        panNumber: "",
        accountHolderName: ""
    });

    const resetModal = () => {
        setModalStep('select');
        setUpiId("");
        setBankDetails({
            accountNumber: "",
            confirmAccountNumber: "",
            ifscCode: "",
            bankName: "",
            branch: "",
            panNumber: "",
            accountHolderName: ""
        });
        setFormLoading(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Validation functions
    const validateUPI = (upi: string) => {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(upi);
    };

    const validateIFSC = (ifsc: string) => {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc);
    };

    const validatePAN = (pan: string) => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };

    const submitUPIForm = async () => {
        if (!upiId.trim()) {
            Alert.alert("Error", "Please enter UPI ID");
            return;
        }

        if (!validateUPI(upiId)) {
            Alert.alert("Error", "Please enter a valid UPI ID (e.g., yourname@paytm)");
            return;
        }

        try {
            setFormLoading(true);

            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "addUpi",
                    user_id: parseInt(userId),
                    upi: upiId.trim()
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                Alert.alert("Success", "UPI ID added successfully!", [
                    {
                        text: "OK",
                        onPress: () => {
                            handleClose();
                            onSuccess();
                        }
                    }
                ]);
            } else {
                const errorMessage = data.message || "Failed to add UPI ID";
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.error("Error adding UPI:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setFormLoading(false);
        }
    };

    const submitBankForm = async () => {
        const { accountNumber, confirmAccountNumber, ifscCode, bankName, branch, panNumber, accountHolderName } = bankDetails;

        // Validation
        if (!accountNumber || !confirmAccountNumber || !ifscCode || !bankName || !branch || !panNumber || !accountHolderName) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (accountNumber !== confirmAccountNumber) {
            Alert.alert("Error", "Account numbers do not match");
            return;
        }

        if (!validateIFSC(ifscCode)) {
            Alert.alert("Error", "Please enter a valid IFSC code (e.g., SBIA0154734)");
            return;
        }

        if (!validatePAN(panNumber)) {
            Alert.alert("Error", "Please enter a valid PAN number (e.g., ABCDE1234F)");
            return;
        }

        try {
            setFormLoading(true);

            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "addBankDetails",
                    user_id: parseInt(userId),
                    bank_holder_name: accountHolderName,
                    account_number: accountNumber,
                    confirm_account_number: confirmAccountNumber,
                    bank_name: bankName,
                    branch: branch,
                    ifsc_code: ifscCode.toUpperCase(),
                    pan_number: panNumber.toUpperCase()
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                Alert.alert("Success", "Bank details added successfully! PAN verification may take 24-48 hours.", [
                    {
                        text: "OK",
                        onPress: () => {
                            handleClose();
                            onSuccess();
                        }
                    }
                ]);
            } else {
                const errorMessage = data.message || "Failed to add bank details";
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.error("Error adding bank details:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View
                className="flex-1 justify-end"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
            >
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 5,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        padding: width * 0.04,
                        maxHeight: height * 0.8
                    }}
                >
                    {/* Modal Header */}
                    <View
                        className="flex-row items-center justify-between"
                        style={{ marginBottom: height * 0.02 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045
                            }}
                            className="font-bold"
                        >
                            {modalStep === 'select' ? 'Add Payment Method' :
                                modalStep === 'upi' ? 'Add UPI ID' : 'Add Bank Account'}
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                width: width * 0.06,
                                height: width * 0.06,
                                borderRadius: (width * 0.06) / 2
                            }}
                            className="items-center justify-center"
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.045
                                }}
                                className="font-bold"
                            >
                                ×
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    {modalStep === 'select' && (
                        <View>
                            <Text
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: width * 0.03,
                                    lineHeight: width * 0.04,
                                    marginBottom: height * 0.02
                                }}
                            >
                                Choose a payment method to add for withdrawals
                            </Text>

                            {/* UPI Option */}
                            <TouchableOpacity
                                onPress={() => setModalStep('upi')}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: width * 0.04,
                                    marginBottom: height * 0.015
                                }}
                                className="flex-row items-center"
                            >
                                <View
                                    style={{
                                        backgroundColor: Colors.light.bgBlueBtn,
                                        width: width * 0.09,
                                        height: width * 0.09,
                                        borderRadius: (width * 0.09) / 2,
                                        marginRight: width * 0.03
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Text style={{ fontSize: width * 0.045 }}>💰</Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.04
                                        }}
                                        className="font-bold"
                                    >
                                        UPI ID
                                    </Text>
                                    <Text
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: width * 0.03,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        Add your UPI ID for quick withdrawals
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: width * 0.045
                                    }}
                                >
                                    ›
                                </Text>
                            </TouchableOpacity>

                            {/* Bank Option */}
                            <TouchableOpacity
                                onPress={() => setModalStep('bank')}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: width * 0.04
                                }}
                                className="flex-row items-center"
                            >
                                <View
                                    style={{
                                        backgroundColor: '#10B981',
                                        width: width * 0.09,
                                        height: width * 0.09,
                                        borderRadius: (width * 0.09) / 2,
                                        marginRight: width * 0.03
                                    }}
                                    className="items-center justify-center"
                                >
                                    <Text style={{ fontSize: width * 0.045 }}>🏦</Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.04
                                        }}
                                        className="font-bold"
                                    >
                                        Bank Account
                                    </Text>
                                    <Text
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: width * 0.03,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        Add bank details with PAN verification
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: width * 0.045
                                    }}
                                >
                                    ›
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* UPI Form */}
                    {modalStep === 'upi' && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View>
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03,
                                        lineHeight: width * 0.04,
                                        marginBottom: height * 0.02
                                    }}
                                >
                                    Enter your UPI ID to enable instant withdrawals
                                </Text>

                                <View style={{ marginBottom: height * 0.02 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        UPI ID *
                                    </Text>
                                    <TextInput
                                        value={upiId}
                                        onChangeText={setUpiId}
                                        placeholder="yourname@paytm"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: upiId ? Colors.light.bgBlueBtn : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

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
                                    <Text
                                        style={{
                                            color: '#60A5FA',
                                            fontSize: width * 0.03,
                                            lineHeight: width * 0.04
                                        }}
                                    >
                                        💡 Make sure your UPI ID is active and verified with your bank
                                    </Text>
                                </View>

                                <View
                                    className="flex-row"
                                    style={{ gap: width * 0.02 }}
                                >
                                    <TouchableOpacity
                                        onPress={() => setModalStep('select')}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            flex: 1,
                                            borderRadius: 8,
                                            paddingVertical: height * 0.015
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.035,
                                                textAlign: 'center'
                                            }}
                                            className="font-bold"
                                        >
                                            Back
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={submitUPIForm}
                                        disabled={formLoading}
                                        style={{
                                            backgroundColor: Colors.light.bgBlueBtn,
                                            opacity: formLoading ? 0.5 : 1,
                                            flex: 1,
                                            borderRadius: 8,
                                            paddingVertical: height * 0.015
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.035,
                                                textAlign: 'center'
                                            }}
                                            className="font-bold"
                                        >
                                            {formLoading ? "Adding..." : "Add UPI ID"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    )}

                    {/* Bank Form */}
                    {modalStep === 'bank' && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View>
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03,
                                        lineHeight: width * 0.04,
                                        marginBottom: height * 0.02
                                    }}
                                >
                                    Enter your bank details and PAN for verification
                                </Text>

                                {/* Form fields with responsive sizing */}
                                {/* Account Holder Name */}
                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        Account Holder Name *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.accountHolderName}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                                        placeholder="Full name as per bank records"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: bankDetails.accountHolderName ? Colors.light.bgBlueBtn : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* Account Number */}
                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        Account Number *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.accountNumber}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                                        placeholder="Enter account number"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: bankDetails.accountNumber ? Colors.light.bgBlueBtn : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        keyboardType="numeric"
                                        maxLength={18}
                                        secureTextEntry={true}
                                    />
                                </View>

                                {/* Confirm Account Number */}
                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        Confirm Account Number *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.confirmAccountNumber}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, confirmAccountNumber: text }))}
                                        placeholder="Re-enter account number"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: bankDetails.confirmAccountNumber ?
                                                (bankDetails.accountNumber === bankDetails.confirmAccountNumber ? '#10B981' : '#EF4444')
                                                : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        keyboardType="numeric"
                                        maxLength={18}
                                    />
                                </View>

                                {/* Bank Name */}
                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        Bank Name *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.bankName}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                                        placeholder="State Bank of India"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: bankDetails.bankName ? Colors.light.bgBlueBtn : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* Branch */}
                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        Branch *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.branch}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, branch: text }))}
                                        placeholder="Branch name or code"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: bankDetails.branch ? Colors.light.bgBlueBtn : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* IFSC Code */}
                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        IFSC Code *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.ifscCode}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, ifscCode: text.toUpperCase() }))}
                                        placeholder="SBIA0154734"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: validateIFSC(bankDetails.ifscCode) ? '#10B981' :
                                                bankDetails.ifscCode ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        autoCapitalize="characters"
                                        maxLength={11}
                                    />
                                </View>

                                {/* PAN Number */}
                                <View style={{ marginBottom: height * 0.02 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01
                                        }}
                                        className="font-bold"
                                    >
                                        PAN Number *
                                    </Text>
                                    <TextInput
                                        value={bankDetails.panNumber}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, panNumber: text.toUpperCase() }))}
                                        placeholder="DERFG5656T"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            borderColor: validatePAN(bankDetails.panNumber) ? '#10B981' :
                                                bankDetails.panNumber ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
                                            fontSize: width * 0.035,
                                            borderRadius: 8,
                                            padding: width * 0.03
                                        }}
                                        autoCapitalize="characters"
                                        maxLength={10}
                                    />
                                </View>

                                <View
                                    style={{
                                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(251, 191, 36, 0.2)',
                                        borderRadius: 8,
                                        padding: width * 0.03,
                                        marginBottom: height * 0.02
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#F59E0B',
                                            fontSize: width * 0.03,
                                            lineHeight: width * 0.04
                                        }}
                                    >
                                        ⚠️ PAN verification may take 24-48 hours. Bank withdrawals will be enabled after verification.
                                    </Text>
                                </View>

                                <View
                                    className="flex-row"
                                    style={{ gap: width * 0.02 }}
                                >
                                    <TouchableOpacity
                                        onPress={() => setModalStep('select')}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            flex: 1,
                                            borderRadius: 8,
                                            paddingVertical: height * 0.015
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.035,
                                                textAlign: 'center'
                                            }}
                                            className="font-bold"
                                        >
                                            Back
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={submitBankForm}
                                        disabled={formLoading}
                                        style={{
                                            backgroundColor: '#10B981',
                                            opacity: formLoading ? 0.5 : 1,
                                            flex: 1,
                                            borderRadius: 8,
                                            paddingVertical: height * 0.015
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.035,
                                                textAlign: 'center'
                                            }}
                                            className="font-bold"
                                        >
                                            {formLoading ? "Adding..." : "Add Bank Details"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default PaymentMethodModal;