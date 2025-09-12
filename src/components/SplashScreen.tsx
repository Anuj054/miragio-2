import React from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default SplashScreen;