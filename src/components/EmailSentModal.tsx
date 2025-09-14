import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * Props interface for EmailSentModal component
 */
interface EmailSentModalProps {
    visible: boolean;           // Controls modal visibility
    onClose: () => void;        // Function to call when modal should close
    email?: string;             // Email address to display (optional, has default)
}

/**
 * EmailSentModal - A modal component that confirms email has been sent for password reset
 * 
 * Features:
 * - Dark overlay background with fade animation
 * - Centered modal with confirmation message
 * - Displays the email address where reset link was sent
 * - Single "Ok" button to dismiss the modal
 * - Responsive design with fixed width constraints
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
            <View className="flex-1 bg-black/70 justify-center items-center px-5">

                {/* Modal content container */}
                <View
                    style={{ backgroundColor: Colors.light.blackPrimary }}
                    className="rounded-[10px] p-8 w-full items-center"
                >
                    {/* Modal title */}
                    <Text
                        style={{ color: Colors.light.whiteFfffff }}
                        className="text-2xl font-bold mb-5 text-center"
                    >
                        Email Sent
                    </Text>

                    {/* Confirmation message with email address */}
                    <Text
                        style={{ color: Colors.light.whiteFfffff }}
                        className="text-xl text-center leading-6 mb-8 w-[343px]"
                    >
                        We've sent a reset code to {email}  to get back into your account
                    </Text>

                    {/* Close button */}
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.light.backlight2 }}
                        className="items-center justify-center py-3 rounded-3xl w-[205px] h-[46px]"
                        onPress={onClose}                   // Dismiss modal when pressed
                        activeOpacity={0.8}                 // Slight opacity change on press
                    >
                        <Text
                            style={{ color: Colors.light.whiteFfffff }}
                            className="font-semibold text-center"
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
