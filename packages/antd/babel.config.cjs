module.exports = {
  extends: '../../babel.config.base.cjs',
  presets: ['@babel/react'],
  plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es' }, 'antd']]
};
