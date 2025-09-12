import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    Dimensions,
} from 'react-native';
import verified from '../assets/images/verified.gif';
import CustomGradientButton from './CustomGradientButton';
import { Colors } from '../constants/Colors';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

// TypeScript interface for component props
interface VerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onBackToTask: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
    visible,
    onClose,
    onBackToTask
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            {/* =================== MODAL OVERLAY BACKGROUND =================== */}
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>

                {/* =================== MODAL CONTENT CONTAINER =================== */}
                <View
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        borderLeftColor: Colors.light.bgBlueBtn,
                        borderLeftWidth: 6,
                        borderRadius: 10,
                        padding: 12,
                        width: '90%',
                        maxWidth: 350,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                    className="items-center"
                >
                    {/* =================== VERIFICATION ICON SECTION =================== */}
                    <View className="mb-4">
                        {/* Animated verification GIF icon */}
                        <Image
                            source={verified}
                            className="w-[80px] h-[80px]"
                            resizeMode="contain"
                        />
                    </View>

                    {/* =================== MODAL CONTENT SECTION =================== */}

                    {/* Modal title */}
                    <Text style={{ color: Colors.light.bgBlueBtn }} className="text-2xl font-extrabold mb-3 text-center">
                        Verification
                    </Text>

                    {/* Verification message */}
                    <Text style={{ color: Colors.light.backlight2 }} className="text-center text-base leading-5 mb-4 px-3">
                        We are verifying your task once verification done your token will be credit to your account
                    </Text>

                    {/* =================== ACTION BUTTON SECTION =================== */}
                    <View className="flex items-center justify-center pb-3">
                        {/* Back to task button */}
                        <CustomGradientButton
                            text="Back to task/home"
                            width={180}
                            height={38}
                            borderRadius={12}
                            fontSize={16}
                            fontWeight="600"
                            textColor={Colors.light.whiteFefefe}
                            onPress={onBackToTask}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default VerificationModal;
