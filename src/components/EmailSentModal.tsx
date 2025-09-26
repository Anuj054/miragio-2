import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

/**
 * Props interface for EmailSentModal component
 */
interface EmailSentModalProps {
    visible: boolean;           // Controls modal visibility
    onClose: () => void;        // Function to call when modal should close
    email?: string;             // Email address to display (optional, has default)
}

/**
 * EmailSentModal - A responsive modal component that confirms email has been sent for password reset
 * 
 * Features:
 * - Dark overlay background with fade animation
 * - Centered modal with confirmation message
 * - Displays the email address where reset link was sent
 * - Single "Ok" button to dismiss the modal
 * - Fully responsive design that scales across all mobile devices
 * - Uses custom Colors theme for consistent styling
 */
const EmailSentModal: React.FC<EmailSentModalProps> = ({
    visible,
    onClose,
    email = "k*******9@gmail.com"          // Default masked email for privacy
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}                      // Allows background to show through
            animationType="fade"                    // Smooth fade in/out animation
            onRequestClose={onClose}                // Handle hardware back button on Android
        >
            {/* Modal overlay - dark background that covers entire screen */}
            <View
                className="flex-1 justify-center items-center"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    paddingHorizontal: width * 0.05  // 5% padding on sides
                }}
            >

                {/* Modal content container - responsive */}
                <View
                    style={{
                        backgroundColor: Colors.light.blackPrimary,
                        borderRadius: 10,
                        padding: width * 0.06,  // 6% padding
                        width: '100%',
                        maxWidth: width * 0.85,  // Maximum 85% of screen width
                        minWidth: Math.min(300, width * 0.8)  // Minimum width with constraints
                    }}
                    className="items-center"
                >
                    {/* Modal title - responsive text */}
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.06,  // 6% of screen width
                            lineHeight: width * 0.07,
                            marginBottom: height * 0.025  // 2.5% of screen height
                        }}
                        className="font-bold text-center"
                    >
                        Email Sent
                    </Text>

                    {/* Confirmation message with email address - responsive */}
                    <Text
                        style={{
                            color: Colors.light.whiteFfffff,
                            fontSize: width * 0.045,  // 4.5% of screen width
                            lineHeight: width * 0.055,
                            marginBottom: height * 0.04,  // 4% of screen height
                            textAlign: 'center'
                        }}
                    >
                        We've sent a reset code to {email} to get back into your account
                    </Text>

                    {/* Close button - responsive */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderRadius: 24,
                            paddingVertical: height * 0.015,  // 1.5% of screen height
                            paddingHorizontal: width * 0.08,  // 8% of screen width
                            minWidth: width * 0.4,  // Minimum 40% of screen width
                            minHeight: Math.max(44, height * 0.055)  // Minimum 44px touch target
                        }}
                        className="items-center justify-center"
                        onPress={onClose}                   // Dismiss modal when pressed
                        activeOpacity={0.8}                 // Slight opacity change on press
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFfffff,
                                fontSize: width * 0.04,  // 4% of screen width
                                fontWeight: '600'
                            }}
                            className="text-center"
                        >
                            Ok
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default EmailSentModal;