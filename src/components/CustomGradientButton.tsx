import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from "react-native"
import LinearGradient from 'react-native-linear-gradient';

/**
 * Props interface for CustomGradientButton component
 */
interface CustomGradientButtonProps {
    text?: string;                          // Button text content
    width?: number;                         // Button width in pixels
    height?: number;                        // Button height in pixels
    onPress?: () => void;                   // Function to call when button is pressed
    disabled?: boolean;                     // Whether the button is disabled
    fontSize?: number;                      // Font size for button text
    fontWeight?: TextStyle['fontWeight'];   // Font weight for button text
    textColor?: string;                     // Color of button text
    borderRadius?: number;                  // Border radius for rounded corners
    style?: ViewStyle;                      // Additional styles for the TouchableOpacity
    textStyle?: TextStyle;                  // Additional styles for the button text
}

/**
 * CustomGradientButton - A reusable button component with gradient background
 * 
 * Features:
 * - Gradient background from light blue to darker blue
 * - Customizable dimensions, text, and styling
 * - Disabled state with opacity reduction
 * - Configurable border radius and text properties
 */
const CustomGradientButton: React.FC<CustomGradientButtonProps> = ({
    text = 'Button',
    width = 200,
    height = 50,
    onPress,
    disabled = false,
    fontSize = 16,
    fontWeight = '600',
    textColor = 'white',
    borderRadius = 25,
    style = {},
    textStyle = {},
    ...props
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}                    // Slight opacity change on press
            style={[{ width, height }, style]}     // Combine size props with custom styles
            {...props}                             // Spread any additional TouchableOpacity props
        >
            <LinearGradient
                colors={['#5DC2F8', '#2999D5']}
                locations={[0.4405, 0.7579]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[
                    styles.button,
                    {
                        width: '100%',
                        height: '100%',
                        borderRadius,
                    },
                    disabled && styles.disabled,
                ]}
            >
                <Text
                    style={[
                        styles.buttonText,
                        {
                            fontSize,
                            fontWeight,
                            color: textColor,
                        },
                        textStyle,
                    ]}
                >
                    {text}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

/**
 * StyleSheet for the CustomGradientButton component
 */
const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',    // Center content vertically
        alignItems: 'center',        // Center content horizontally
    },
    buttonText: {
        textAlign: 'center',         // Center text alignment
    },
    disabled: {
        opacity: 0.5,                // Reduce opacity for disabled state
    },
});

export default CustomGradientButton;
