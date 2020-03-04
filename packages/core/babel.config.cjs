module.exports = {
  presets: [
    '@babel/typescript',
    [
      '@babel/env',
      {
        targets: {
          chrome: '49',
          node: '10'
        },
        modules: process.env.BUILD_COMMONJS_MODULE ? 'commonjs' : false
      }
    ]
  ]
};
