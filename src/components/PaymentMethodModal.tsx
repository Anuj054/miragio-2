import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { TranslatedText } from './TranslatedText';
import { useTranslation } from '../context/TranslationContext';

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
    const { currentLanguage } = useTranslation();

    const [modalStep, setModalStep] = useState<'select' | 'upi' | 'bank'>('select');
    const [formLoading, setFormLoading] = useState<boolean>(false);

    const [upiId, setUpiId] = useState<string>("");

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
            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                currentLanguage === 'hi' ? "कृपया UPI ID दर्ज करें" : "Please enter UPI ID"
            );
            return;
        }

        if (!validateUPI(upiId)) {
            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                currentLanguage === 'hi' ?
                    "कृपया वैध UPI ID दर्ज करें (जैसे, yourname@paytm)" :
                    "Please enter a valid UPI ID (e.g., yourname@paytm)"
            );
            return;
        }

        try {
            setFormLoading(true);

            const response = await fetch("https://miragiofintech.org/api/api.php", {
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log("UPI Response:", responseText);

            if (responseText.trim().startsWith('<')) {
                throw new Error('Server returned HTML instead of JSON');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                throw new Error('Invalid JSON response from server');
            }

            if (data.status === "success") {
                Alert.alert(
                    currentLanguage === 'hi' ? "सफल" : "Success",
                    currentLanguage === 'hi' ? "UPI ID सफलतापूर्वक जोड़ी गई!" : "UPI ID added successfully!",
                    [
                        {
                            text: currentLanguage === 'hi' ? "ठीक है" : "OK",
                            onPress: () => {
                                handleClose();
                                onSuccess();
                            }
                        }
                    ]
                );
            } else {
                const errorMessage = data.message || (currentLanguage === 'hi' ? "UPI ID जोड़ने में असफल" : "Failed to add UPI ID");
                Alert.alert(currentLanguage === 'hi' ? "त्रुटि" : "Error", errorMessage);
            }
        } catch (error: any) {
            console.error("Error adding UPI:", error);

            let errorMessage = currentLanguage === 'hi' ?
                "कुछ गलत हुआ। कृपया फिर से कोशिश करें।" :
                "Something went wrong. Please try again.";

            if (error.message && error.message.includes('Network request failed')) {
                errorMessage = currentLanguage === 'hi' ?
                    "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।" :
                    "Network error. Please check your internet connection.";
            } else if (error.message && error.message.includes('HTML instead of JSON')) {
                errorMessage = currentLanguage === 'hi' ?
                    "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।" :
                    "Server error. Please try again later.";
            }

            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                errorMessage
            );
        } finally {
            setFormLoading(false);
        }
    };

    const submitBankForm = async () => {
        const { accountNumber, confirmAccountNumber, ifscCode, bankName, branch, panNumber, accountHolderName } = bankDetails;

        if (!accountNumber || !confirmAccountNumber || !ifscCode || !bankName || !branch || !panNumber || !accountHolderName) {
            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                currentLanguage === 'hi' ? "कृपया सभी फील्ड भरें" : "Please fill in all fields"
            );
            return;
        }

        if (accountNumber !== confirmAccountNumber) {
            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                currentLanguage === 'hi' ? "खाता नंबर मैच नहीं करते" : "Account numbers do not match"
            );
            return;
        }

        if (!validateIFSC(ifscCode)) {
            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                currentLanguage === 'hi' ?
                    "कृपया वैध IFSC कोड दर्ज करें (जैसे, SBIA0154734)" :
                    "Please enter a valid IFSC code (e.g., SBIA0154734)"
            );
            return;
        }

        if (!validatePAN(panNumber)) {
            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                currentLanguage === 'hi' ?
                    "कृपया वैध PAN नंबर दर्ज करें (जैसे, ABCDE1234F)" :
                    "Please enter a valid PAN number (e.g., ABCDE1234F)"
            );
            return;
        }

        try {
            setFormLoading(true);

            const response = await fetch("https://miragiofintech.org/api/api.php", {
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log("Bank Details Response:", responseText);

            if (responseText.trim().startsWith('<')) {
                throw new Error('Server returned HTML instead of JSON');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                throw new Error('Invalid JSON response from server');
            }

            if (data.status === "success") {
                Alert.alert(
                    currentLanguage === 'hi' ? "सफल" : "Success",
                    currentLanguage === 'hi' ?
                        "बैंक विवरण सफलतापूर्वक जोड़े गए! PAN सत्यापन में 24-48 घंटे लग सकते हैं।" :
                        "Bank details added successfully! PAN verification may take 24-48 hours.",
                    [
                        {
                            text: currentLanguage === 'hi' ? "ठीक है" : "OK",
                            onPress: () => {
                                handleClose();
                                onSuccess();
                            }
                        }
                    ]
                );
            } else {
                const errorMessage = data.message || (currentLanguage === 'hi' ? "बैंक विवरण जोड़ने में असफल" : "Failed to add bank details");
                Alert.alert(currentLanguage === 'hi' ? "त्रुटि" : "Error", errorMessage);
            }
        } catch (error: any) {
            console.error("Error adding bank details:", error);

            let errorMessage = currentLanguage === 'hi' ?
                "कुछ गलत हुआ। कृपया फिर से कोशिश करें।" :
                "Something went wrong. Please try again.";

            if (error.message && error.message.includes('Network request failed')) {
                errorMessage = currentLanguage === 'hi' ?
                    "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।" :
                    "Network error. Please check your internet connection.";
            } else if (error.message && error.message.includes('HTML instead of JSON')) {
                errorMessage = currentLanguage === 'hi' ?
                    "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।" :
                    "Server error. Please try again later.";
            }

            Alert.alert(
                currentLanguage === 'hi' ? "त्रुटि" : "Error",
                errorMessage
            );
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
                style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
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
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: height * 0.02 }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.045,
                                fontWeight: 'bold'
                            }}
                        >
                            {modalStep === 'select' ?
                                (currentLanguage === 'hi' ? 'पेमेंट मेथड जोड़ें' : 'Add Payment Method') :
                                modalStep === 'upi' ?
                                    (currentLanguage === 'hi' ? 'UPI ID जोड़ें' : 'Add UPI ID') :
                                    (currentLanguage === 'hi' ? 'बैंक खाता जोड़ें' : 'Add Bank Account')}
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                width: width * 0.06,
                                height: width * 0.06,
                                borderRadius: (width * 0.06) / 2,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.045,
                                    fontWeight: 'bold'
                                }}
                            >
                                ×
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {modalStep === 'select' && (
                        <View>
                            <TranslatedText
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: width * 0.03,
                                    lineHeight: width * 0.04,
                                    marginBottom: height * 0.02
                                }}
                            >
                                Choose a payment method to add for withdrawals
                            </TranslatedText>

                            <TouchableOpacity
                                onPress={() => setModalStep('upi')}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: width * 0.04,
                                    marginBottom: height * 0.015,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: Colors.light.bgBlueBtn,
                                        width: width * 0.09,
                                        height: width * 0.09,
                                        borderRadius: (width * 0.09) / 2,
                                        marginRight: width * 0.03,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Text style={{ fontSize: width * 0.045 }}>💰</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.04,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        UPI ID
                                    </Text>
                                    <TranslatedText
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: width * 0.03,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        Add your UPI ID for quick withdrawals
                                    </TranslatedText>
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

                            <TouchableOpacity
                                onPress={() => setModalStep('bank')}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: width * 0.04,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#10B981',
                                        width: width * 0.09,
                                        height: width * 0.09,
                                        borderRadius: (width * 0.09) / 2,
                                        marginRight: width * 0.03,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Text style={{ fontSize: width * 0.045 }}>🏦</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TranslatedText
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.04,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Bank Account
                                    </TranslatedText>
                                    <TranslatedText
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: width * 0.03,
                                            marginTop: height * 0.005
                                        }}
                                    >
                                        Add bank details with PAN verification
                                    </TranslatedText>
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

                    {modalStep === 'upi' && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View>
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03,
                                        lineHeight: width * 0.04,
                                        marginBottom: height * 0.02
                                    }}
                                >
                                    Enter your UPI ID to enable instant withdrawals
                                </TranslatedText>

                                <View style={{ marginBottom: height * 0.02 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'UPI ID *' : 'UPI ID *'}
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
                                    <TranslatedText
                                        style={{
                                            color: '#60A5FA',
                                            fontSize: width * 0.03,
                                            lineHeight: width * 0.04
                                        }}
                                    >
                                        💡 Make sure your UPI ID is active and verified with your bank
                                    </TranslatedText>
                                </View>

                                <View style={{ flexDirection: 'row', gap: width * 0.02 }}>
                                    <TouchableOpacity
                                        onPress={() => setModalStep('select')}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            flex: 1,
                                            borderRadius: 8,
                                            paddingVertical: height * 0.015
                                        }}
                                    >
                                        <TranslatedText
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.035,
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Back
                                        </TranslatedText>
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
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {formLoading ?
                                                (currentLanguage === 'hi' ? "जोड़ रहे हैं..." : "Adding...") :
                                                (currentLanguage === 'hi' ? "UPI ID जोड़ें" : "Add UPI ID")}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    )}

                    {modalStep === 'bank' && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View>
                                <TranslatedText
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: width * 0.03,
                                        lineHeight: width * 0.04,
                                        marginBottom: height * 0.02
                                    }}
                                >
                                    Enter your bank details and PAN for verification
                                </TranslatedText>

                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'खाता धारक का नाम *' : 'Account Holder Name *'}
                                    </Text>
                                    <TextInput
                                        value={bankDetails.accountHolderName}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                                        placeholder={currentLanguage === 'hi' ?
                                            "बैंक रिकॉर्ड के अनुसार पूरा नाम" :
                                            "Full name as per bank records"}
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

                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'खाता नंबर *' : 'Account Number *'}
                                    </Text>
                                    <TextInput
                                        value={bankDetails.accountNumber}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                                        placeholder={currentLanguage === 'hi' ?
                                            "खाता नंबर दर्ज करें" :
                                            "Enter account number"}
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

                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'खाता नंबर कन्फर्म करें *' : 'Confirm Account Number *'}
                                    </Text>
                                    <TextInput
                                        value={bankDetails.confirmAccountNumber}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, confirmAccountNumber: text }))}
                                        placeholder={currentLanguage === 'hi' ?
                                            "खाता नंबर दुबारा दर्ज करें" :
                                            "Re-enter account number"}
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

                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'बैंक का नाम *' : 'Bank Name *'}
                                    </Text>
                                    <TextInput
                                        value={bankDetails.bankName}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                                        placeholder={currentLanguage === 'hi' ?
                                            "भारतीय स्टेट बैंक" :
                                            "State Bank of India"}
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

                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'शाखा *' : 'Branch *'}
                                    </Text>
                                    <TextInput
                                        value={bankDetails.branch}
                                        onChangeText={(text) => setBankDetails(prev => ({ ...prev, branch: text }))}
                                        placeholder={currentLanguage === 'hi' ?
                                            "शाखा का नाम या कोड" :
                                            "Branch name or code"}
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

                                <View style={{ marginBottom: height * 0.015 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'IFSC कोड *' : 'IFSC Code *'}
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

                                <View style={{ marginBottom: height * 0.02 }}>
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFfffff,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {currentLanguage === 'hi' ? 'PAN नंबर *' : 'PAN Number *'}
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
                                    <TranslatedText
                                        style={{
                                            color: '#F59E0B',
                                            fontSize: width * 0.03,
                                            lineHeight: width * 0.04
                                        }}
                                    >
                                        ⚠️ PAN verification may take 24-48 hours. Bank withdrawals will be enabled after verification.
                                    </TranslatedText>
                                </View>

                                <View style={{ flexDirection: 'row', gap: width * 0.02 }}>
                                    <TouchableOpacity
                                        onPress={() => setModalStep('select')}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            flex: 1,
                                            borderRadius: 8,
                                            paddingVertical: height * 0.015
                                        }}
                                    >
                                        <TranslatedText
                                            style={{
                                                color: Colors.light.whiteFfffff,
                                                fontSize: width * 0.035,
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Back
                                        </TranslatedText>
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
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {formLoading ?
                                                (currentLanguage === 'hi' ? "जोड़ रहे हैं..." : "Adding...") :
                                                (currentLanguage === 'hi' ? "बैंक विवरण जोड़ें" : "Add Bank Details")}
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