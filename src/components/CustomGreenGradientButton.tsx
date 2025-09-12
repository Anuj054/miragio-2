import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Props interface for CustomGreenGradientButton component
 */
interface CustomGreenGradientButtonProps {
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
    icon?: any;                             // Icon source (optional)
    iconSize?: number;                      // Size of the icon in pixels (optional)
    iconPosition?: 'left' | 'right';       // Position of icon relative to text (optional)
}

/**
 * CustomGreenGradientButton - A reusable button component with green gradient background
 * 
 * Features:
 * - Green gradient background from light green to darker green
 * - Supports optional icons on left or right side of text
 * - Customizable dimensions, text, and styling
 * - Disabled state with opacity reduction
 * - Configurable border radius and text properties
 * - Automatic icon alignment with text
 */
const CustomGreenGradientButton: React.FC<CustomGreenGradientButtonProps> = ({
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
    icon,
    iconPosition = 'left',
    iconSize = 20,
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
                colors={['#48BB78', '#2F855A']}    // Light green to darker green gradient
                locations={[0.4405, 0.7579]}       // Color stop positions
                start={{ x: 0, y: 0 }}             // Gradient start point (top-left)
                end={{ x: 0.8, y: 1 }}             // Gradient end point (bottom-right)
                style={[
                    styles.button,
                    {
                        width: '100%',               // Fill parent TouchableOpacity
                        height: '100%',              // Fill parent TouchableOpacity
                        borderRadius,                // Apply custom border radius
                        flexDirection: 'row',        // Arrange icon and text horizontally
                        alignItems: 'center',        // Center items vertically
                        justifyContent: 'center',    // Center items horizontally
                    },
                    disabled && styles.disabled,    // Apply disabled style if needed
                ]}
            >
                {/* Left-positioned icon */}
                {icon && iconPosition === 'left' && (
                    <Image
                        source={icon}
                        style={[
                            styles.icon,
                            {
                                width: iconSize,
                                height: iconSize,
                                marginRight: 8,          // Space between icon and text
                                marginTop: -3,           // Fine-tune vertical alignment
                            }
                        ]}
                        resizeMode="contain"
                    />
                )}

                {/* Button text */}
                <Text
                    style={[
                        styles.buttonText,
                        {
                            fontSize,                    // Apply custom font size
                            fontWeight,                  // Apply custom font weight
                            color: textColor,            // Apply custom text color
                        },
                        textStyle,                       // Apply any additional text styles
                    ]}
                >
                    {text}
                </Text>

                {/* Right-positioned icon */}
                {icon && iconPosition === 'right' && (
                    <Image
                        source={icon}
                        style={[
                            styles.icon,
                            {
                                width: iconSize,
                                height: iconSize,
                                marginLeft: 8,           // Space between text and icon
                                marginTop: -1,           // Fine-tune vertical alignment
                            }
                        ]}
                        resizeMode="contain"
                    />
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

/**
 * StyleSheet for the CustomGreenGradientButton component
 */
const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',    // Center content vertically
        alignItems: 'center',        // Center content horizontally
    },
    buttonText: {
        textAlign: 'center',         // Center text alignment
    },
    icon: {
        // Base icon styles - specific dimensions set inline
    },
    disabled: {
        opacity: 0.5,                // Reduce opacity for disabled state
    },
});

export default CustomGreenGradientButton;
