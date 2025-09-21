import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../constants/Colors';


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

            // Updated to match your API format
            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "addUpi", // Changed from "add_upi_id"
                    user_id: parseInt(userId), // Ensure it's a number
                    upi: upiId.trim() // Changed from "upi_id"
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
                // Handle specific error messages from API
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

            // Updated to match your API format exactly
            const response = await fetch("https://netinnovatus.tech/miragio_task/api/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "addBankDetails", // Changed from "add_bank_details"
                    user_id: parseInt(userId), // Ensure it's a number
                    bank_holder_name: accountHolderName, // Changed from account_holder_name
                    account_number: accountNumber,
                    confirm_account_number: confirmAccountNumber, // Added this field
                    bank_name: bankName,
                    branch: branch, // Added this field
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
                // Handle specific error messages from API
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
                    }}
                    className="rounded-t-2xl p-4 max-h-[80%]"
                >
                    {/* Modal Header - Smaller */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="text-lg font-bold"
                        >
                            {modalStep === 'select' ? 'Add Payment Method' :
                                modalStep === 'upi' ? 'Add UPI ID' : 'Add Bank Account'}
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            className="w-6 h-6 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                            <Text
                                style={{ color: Colors.light.whiteFfffff }}
                                className="text-lg font-bold"
                            >
                                ×
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    {modalStep === 'select' && (
                        <View>
                            <Text
                                className="text-xs mb-4 leading-4"
                                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                                Choose a payment method to add for withdrawals
                            </Text>

                            {/* UPI Option - Smaller */}
                            <TouchableOpacity
                                onPress={() => setModalStep('upi')}
                                className="rounded-lg p-4 mb-3 flex-row items-center"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <View
                                    className="rounded-full items-center justify-center mr-3"
                                    style={{
                                        backgroundColor: Colors.light.bgBlueBtn,
                                        width: 36,
                                        height: 36
                                    }}
                                >
                                    <Text className="text-lg">💰</Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-base font-bold"
                                    >
                                        UPI ID
                                    </Text>
                                    <Text
                                        className="text-xs mt-1"
                                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                    >
                                        Add your UPI ID for quick withdrawals
                                    </Text>
                                </View>
                                <Text
                                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                    className="text-lg"
                                >
                                    ›
                                </Text>
                            </TouchableOpacity>

                            {/* Bank Option - Smaller */}
                            <TouchableOpacity
                                onPress={() => setModalStep('bank')}
                                className="rounded-lg p-4 flex-row items-center"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <View
                                    className="rounded-full items-center justify-center mr-3"
                                    style={{
                                        backgroundColor: '#10B981',
                                        width: 36,
                                        height: 36
                                    }}
                                >
                                    <Text className="text-lg">🏦</Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-base font-bold"
                                    >
                                        Bank Account
                                    </Text>
                                    <Text
                                        className="text-xs mt-1"
                                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                    >
                                        Add bank details with PAN verification
                                    </Text>
                                </View>
                                <Text
                                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                    className="text-lg"
                                >
                                    ›
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* UPI Form - Smaller */}
                    {modalStep === 'upi' && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View>
                                <Text
                                    className="text-xs mb-4 leading-4"
                                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    Enter your UPI ID to enable instant withdrawals
                                </Text>

                                <View className="mb-4">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View
                                    className="rounded-lg p-3 mb-4"
                                    style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(59, 130, 246, 0.2)'
                                    }}
                                >
                                    <Text className="text-blue-400 text-xs leading-4">
                                        💡 Make sure your UPI ID is active and verified with your bank
                                    </Text>
                                </View>

                                <View className="flex-row space-x-2">
                                    <TouchableOpacity
                                        onPress={() => setModalStep('select')}
                                        className="flex-1 rounded-lg py-3"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    >
                                        <Text
                                            style={{ color: Colors.light.whiteFfffff }}
                                            className="text-center font-bold text-sm"
                                        >
                                            Back
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={submitUPIForm}
                                        disabled={formLoading}
                                        className="flex-1 rounded-lg py-3"
                                        style={{
                                            backgroundColor: Colors.light.bgBlueBtn,
                                            opacity: formLoading ? 0.5 : 1
                                        }}
                                    >
                                        <Text
                                            style={{ color: Colors.light.whiteFfffff }}
                                            className="text-center font-bold text-sm"
                                        >
                                            {formLoading ? "Adding..." : "Add UPI ID"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    )}

                    {/* Bank Form - Smaller */}
                    {modalStep === 'bank' && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View>
                                <Text
                                    className="text-xs mb-4 leading-4"
                                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    Enter your bank details and PAN for verification
                                </Text>

                                {/* Account Holder Name - Smaller */}
                                <View className="mb-3">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* Account Number - Smaller */}
                                <View className="mb-3">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        keyboardType="numeric"
                                        maxLength={18}
                                        secureTextEntry={true}
                                    />
                                </View>

                                {/* Confirm Account Number - Smaller */}
                                <View className="mb-3">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        keyboardType="numeric"
                                        maxLength={18}
                                    />
                                </View>

                                {/* Bank Name - Smaller */}
                                <View className="mb-3">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* Branch - Smaller */}
                                <View className="mb-3">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* IFSC Code - Smaller */}
                                <View className="mb-3">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        autoCapitalize="characters"
                                        maxLength={11}
                                    />
                                </View>

                                {/* PAN Number - Smaller */}
                                <View className="mb-4">
                                    <Text
                                        style={{ color: Colors.light.whiteFfffff }}
                                        className="text-sm font-bold mb-2"
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
                                            fontSize: 14
                                        }}
                                        className="rounded-lg p-3"
                                        autoCapitalize="characters"
                                        maxLength={10}
                                    />
                                </View>

                                <View
                                    className="rounded-lg p-3 mb-4"
                                    style={{
                                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(251, 191, 36, 0.2)'
                                    }}
                                >
                                    <Text className="text-yellow-400 text-xs leading-4">
                                        ⚠️ PAN verification may take 24-48 hours. Bank withdrawals will be enabled after verification.
                                    </Text>
                                </View>

                                <View className="flex-row space-x-2">
                                    <TouchableOpacity
                                        onPress={() => setModalStep('select')}
                                        className="flex-1 rounded-lg py-3"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    >
                                        <Text
                                            style={{ color: Colors.light.whiteFfffff }}
                                            className="text-center font-bold text-sm"
                                        >
                                            Back
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={submitBankForm}
                                        disabled={formLoading}
                                        className="flex-1 rounded-lg py-3"
                                        style={{
                                            backgroundColor: '#10B981',
                                            opacity: formLoading ? 0.5 : 1
                                        }}
                                    >
                                        <Text
                                            style={{ color: Colors.light.whiteFfffff }}
                                            className="text-center font-bold text-sm"
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