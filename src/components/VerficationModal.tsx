import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,

} from 'react-native';
import verified from '../assets/images/verified.gif';
import CustomGradientButton from './CustomGradientButton';
import { Colors } from '../constants/Colors';
import { useTranslation } from '../context/TranslationContext'; // ✅ Language context



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
    // ✅ Get current language from context
    const { currentLanguage } = useTranslation();
    const isHindi = currentLanguage === 'hi';

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
                {/* Modal content */}
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
                    {/* Icon */}
                    <View className="mb-4">
                        <Image
                            source={verified}
                            className="w-[80px] h-[80px]"
                            resizeMode="contain"
                        />
                    </View>

                    {/* Title */}
                    <Text
                        style={{ color: Colors.light.bgBlueBtn }}
                        className="text-2xl font-extrabold mb-3 text-center"
                    >
                        {isHindi ? 'सत्यापन' : 'Verification'}
                    </Text>

                    {/* Message */}
                    <Text
                        style={{ color: Colors.light.backlight2 }}
                        className="text-center text-base leading-5 mb-4 px-3"
                    >
                        {isHindi
                            ? 'हम आपके कार्य का सत्यापन कर रहे हैं। यह प्रक्रिया आमतौर पर 8-9 दिन लेती है। आपका टोकन आपके खाते में जमा कर दिया जाएगा।'
                            : 'We are verifying your task. It generally takes 8-9 days to complete verification.  Post Verificaiton: your token will be credited to your account.'}
                    </Text>

                    {/* Action button */}
                    <View className="flex items-center justify-center pb-3">
                        <CustomGradientButton
                            text={isHindi ? 'कार्य/होम पर वापस जाएँ' : 'Back to task/home'}
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
