module.exports = {
  extends: '../../babel.config.cjs',
  presets: ['@babel/react'],
  plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es' }, 'antd']]
};
