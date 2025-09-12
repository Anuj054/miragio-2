import { useColorScheme as useRNColorScheme } from 'react-native';

export const useColorScheme = () => {
    return useRNColorScheme();
};

// ============================================
// android/app/src/main/assets/fonts/ 
// Place your font files here:
// - SpaceMono-Regular.ttf
// - Poppins-Bold.ttf
// - Poppins-SemiBold.ttf
// - Poppins-Medium.ttf

// ============================================
// react-native.config.js (Create this file in root directory)
module.exports = {
    project: {
        ios: {},
        android: {},
    },
    assets: ['./src/assets/fonts/'], // Path to your fonts
};