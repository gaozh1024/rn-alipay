module.exports = {
  dependency: {
    platforms: {
      ios: null,
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.rnalipay.RnAlipayPackage;',
        packageInstance: 'new RnAlipayPackage()',
      },
    },
  },
};
