import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { TextStyle, ViewStyle, DimensionValue } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Props interface for CustomGradientButtonWithIcon component
 */
interface CustomGradientButtonProps {
    text?: string;                          // Button text content
    width?: DimensionValue;                 // Button width (number or percentage string)
    height?: number;                        // Button height in pixels
    onPress?: () => void;                   // Function to call when button is pressed
    disabled?: boolean;                     // Whether the button is disabled
    fontSize?: number;                      // Font size for button text
    fontWeight?: TextStyle['fontWeight'];   // Font weight for button text
    textColor?: string;                     // Color of button text
    borderRadius?: number;                  // Border radius for rounded corners
    style?: ViewStyle;                      // Additional styles for the TouchableOpacity
    textStyle?: TextStyle;                  // Additional styles for the button text
    icon: any;                              // Icon source (required)
    iconSize: number;                       // Size of the icon in pixels (required)
    iconPosition: 'left' | 'right';        // Position of icon relative to text (required)
    [key: string]: any;                     // Allow additional props
}

/**
 * CustomGradientButtonWithIcon - A reusable button component with gradient background and icon
 * 
 * Features:
 * - Gradient background from light blue to darker blue
 * - Supports icons on left or right side of text
 * - Customizable dimensions, text, and styling
 * - Disabled state with opacity reduction
 * - Configurable border radius and text properties
 * - Automatic icon alignment with text
 * - Compatible with React Native CLI
 */
const CustomGradientButtonWithIcon: React.FC<CustomGradientButtonProps> = ({
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
    iconPosition,
    iconSize,
    ...props
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}                    // Slight opacity change on press
            style={[
                { width, height },
                styles.touchableContainer,
                style
            ]}
            {...props}                             // Spread any additional TouchableOpacity props
        >
            <LinearGradient
                colors={['#5DC2F8', '#2999D5']}    // Light blue to darker blue gradient
                locations={[0.4405, 0.7579]}       // Color stop positions
                start={{ x: 0, y: 0 }}             // Gradient start point (top-left)
                end={{ x: 0.8, y: 1 }}             // Gradient end point (bottom-right)
                style={[
                    styles.button,
                    {
                        borderRadius,                // Apply custom border radius
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
                            styles.leftIcon,
                            {
                                width: iconSize,
                                height: iconSize,
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
                            styles.rightIcon,
                            {
                                width: iconSize,
                                height: iconSize,
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
 * StyleSheet for the CustomGradientButtonWithIcon component
 */
const styles = StyleSheet.create({
    touchableContainer: {
        overflow: 'hidden',              // Ensure gradient respects border radius
    },
    button: {
        flex: 1,                         // Fill the TouchableOpacity
        flexDirection: 'row',            // Arrange icon and text horizontally
        justifyContent: 'center',        // Center content horizontally
        alignItems: 'center',            // Center content vertically
        paddingHorizontal: 16,           // Horizontal padding inside button
        paddingVertical: 8,              // Vertical padding inside button
    },
    buttonText: {
        textAlign: 'center',             // Center text alignment
        flex: 0,                         // Don't stretch text
    },
    icon: {
        // Base icon styles - specific dimensions set inline
    },
    leftIcon: {
        marginRight: 8,                  // Space between left icon and text
        marginTop: -2,                   // Fine-tune vertical alignment
    },
    rightIcon: {
        marginLeft: 8,                   // Space between text and right icon
        marginTop: -1,                   // Fine-tune vertical alignment
    },
    disabled: {
        opacity: 0.5,                    // Reduce opacity for disabled state
    },
});

export default CustomGradientButtonWithIcon;
