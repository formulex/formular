module.exports = {
  presets: [
    '@babel/typescript',
    [
      '@babel/env',
      {
        targets: {
          browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
          node: '10'
        },
        modules: process.env.BUILD_COMMONJS_MODULE ? 'commonjs' : false
      }
    ]
  ],
  plugins: ['@babel/plugin-proposal-class-properties']
};
