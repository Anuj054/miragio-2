import React from 'react';
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '../../navigation/types';

import bg2 from '../../assets/images/bg2.png';
import { icons } from '../../constants';
import { Colors } from '../../constants/Colors';

import { useTranslation } from '../../context/TranslationContext';
import { TranslatedText } from '../../components/TranslatedText';

type Props = NativeStackScreenProps<WalletStackParamList, 'TdsSummary'>;

const { width, height } = Dimensions.get('window');

const TdsSummary: React.FC<Props> = ({ navigation }) => {
    const { currentLanguage } = useTranslation();
    const isHi = currentLanguage === 'hi';

    const handleBackPress = () => navigation.goBack();

    const rows = [
        {
            date: '01-Apr-2025',
            amount: '₹5,000',
            tds: '₹500',
            rate: '10%',
            challan: '123456',
            bsr: '0512345',
        },
        {
            date: '15-May-2025',
            amount: '₹7,500',
            tds: '₹750',
            rate: '10%',
            challan: '789654',
            bsr: '0516789',
        },
    ];

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ===== Header (matches FAQ/Wallet style) ===== */}
            <View style={{ height: height * 0.14 }}>
                <Image source={bg2} resizeMode="cover" className="absolute w-full h-full" />
                <View
                    className="flex-1 px-4"
                    style={{ paddingTop: height * 0.05, paddingBottom: height * 0.02 }}
                >
                    <View
                        className="flex-row items-center justify-between"
                        style={{ height: height * 0.08 }}
                    >
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="items-center justify-center"
                            style={{ width: width * 0.1, height: width * 0.1 }}
                        >
                            <Image
                                source={icons.back}
                                style={{ width: width * 0.04, height: width * 0.06 }}
                            />
                        </TouchableOpacity>

                        {/* Centered title with translation */}
                        <View className="flex-1 items-center">
                            <TranslatedText
                                style={{ color: Colors.light.whiteFfffff, fontSize: width * 0.075 }}
                                className="font-medium"
                            >
                                {isHi ? 'टीडीएस कटौती सारांश' : 'TDS Deduction Summary'}
                            </TranslatedText>
                        </View>

                        <View style={{ width: width * 0.1, height: width * 0.1 }} />
                    </View>
                </View>
                <View className="absolute bottom-0 w-full bg-white" style={{ height: 1 }} />
            </View>

            {/* ===== Table ===== */}
            <ScrollView
                className="flex-1 px-5 py-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.12 }}
            >
                {/* Table Header */}
                <View className="flex-row border-b border-gray-600 pb-2 mb-2">
                    <TranslatedText
                        style={{}} className="flex-1 text-gray-300 text-xs font-semibold">
                        {isHi ? 'भुगतान तिथि' : 'Payment Date'}
                    </TranslatedText>
                    <TranslatedText
                        style={{}} className="flex-1 text-gray-300 text-xs font-semibold text-right">
                        {isHi ? 'भुगतान राशि (₹)' : 'Payment Amount (₹)'}
                    </TranslatedText>
                    <TranslatedText
                        style={{}} className="flex-1 text-gray-300 text-xs font-semibold text-right">
                        {isHi ? 'कटौती टीडीएस (₹)' : 'TDS Deducted (₹)'}
                    </TranslatedText>
                    <TranslatedText
                        style={{}} className="w-12 text-gray-300 text-xs font-semibold text-right">
                        {isHi ? 'दर' : 'Rate'}
                    </TranslatedText>
                    <TranslatedText
                        style={{}} className="w-16 text-gray-300 text-xs font-semibold text-right">
                        {isHi ? 'चलान नंबर' : 'Challan No.'}
                    </TranslatedText>
                    <TranslatedText
                        style={{}} className="w-16 text-gray-300 text-xs font-semibold text-right">
                        {isHi ? 'BSR कोड' : 'BSR Code'}
                    </TranslatedText>
                </View>

                {/* Data Rows */}
                {rows.map((r, i) => (
                    <View key={i} className="flex-row py-2 border-b border-gray-800">
                        <TranslatedText
                            style={{}} className="flex-1 text-white text-xs">{r.date}</TranslatedText>
                        <TranslatedText
                            style={{}} className="flex-1 text-white text-xs text-right">{r.amount}</TranslatedText>
                        <TranslatedText
                            style={{}} className="flex-1 text-white text-xs text-right">{r.tds}</TranslatedText>
                        <TranslatedText
                            style={{}} className="w-12 text-white text-xs text-right">{r.rate}</TranslatedText>
                        <TranslatedText
                            style={{}} className="w-16 text-white text-xs text-right">{r.challan}</TranslatedText>
                        <TranslatedText
                            style={{}} className="w-16 text-white text-xs text-right">{r.bsr}</TranslatedText>
                    </View>
                ))}

                {/* Total Row */}
                <View className="flex-row mt-3 border-t border-gray-600 pt-2">
                    <TranslatedText
                        style={{}} className="flex-1 text-gray-300 text-xs font-semibold">
                        {isHi ? 'कुल' : 'Total'}
                    </TranslatedText>
                    <TranslatedText
                        style={{}} className="flex-1 text-white text-xs text-right">₹12,500</TranslatedText>
                    <TranslatedText
                        style={{}} className="flex-1 text-white text-xs text-right">₹1,250</TranslatedText>
                    <TranslatedText
                        style={{}} className="w-12 text-gray-400 text-xs text-right">–</TranslatedText>
                    <TranslatedText
                        style={{}} className="w-16 text-gray-400 text-xs text-right">–</TranslatedText>
                    <TranslatedText
                        style={{}} className="w-16 text-gray-400 text-xs text-right">–</TranslatedText>
                </View>
            </ScrollView>
        </View>
    );
};

export default TdsSummary;
