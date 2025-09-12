module.exports = {
  dependencies: {
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: {
          sourceDir:
            '../node_modules/@react-native-async-storage/async-storage/android',
          packageImportPath:
            'import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;',
        },
      },
    },
  },
  assets: ['./src/assets/fonts/'],
};
