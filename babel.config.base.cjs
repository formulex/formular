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
        modules: process.env.ESMODULE ? false : 'commonjs'
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    'lodash'
  ],
  overrides: [
    {
      test: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
      presets: ['power-assert']
    }
  ]
};
