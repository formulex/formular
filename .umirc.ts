import { defineConfig } from 'dumi';

const PUBLIC_PATH = '/formular/';

export default defineConfig({
  mode: 'site',
  hash: true,
  title: 'Formular',
  logo: PUBLIC_PATH + 'images/formular_logo.svg',
  links: [
    {
      href: PUBLIC_PATH + 'fonts/fira-code/fira_code.css',
      rel: 'stylesheet',
      type: 'text/css'
    }
  ],
  styles: [
    `code[class*=language-][class*=language-], pre[class*=language-][class*=language-] {
  font-family: 'Fira Code',Consolas,Monaco,"Andale Mono","Ubuntu Mono",monospace;
  font-size: 14px;
}`
  ],
  base: PUBLIC_PATH,
  publicPath: PUBLIC_PATH,
  exportStatic: {},
  ssr: {},
  dynamicImport: {},
  theme: {
    '@c-primary': '#747474'
  },
  navs: {
    'en-US': [
      { title: 'Guide', path: '/guide' },
      { title: 'API', path: '/api' },
      {
        title: 'GitHub',
        path: 'https://github.com/formularx/formular'
      }
    ],
    'zh-CN': [
      { title: '教程', path: '/zh-CN/guide' },
      { title: 'API', path: '/zh-CN/api' },
      {
        title: 'GitHub 仓库',
        path: 'https://github.com/formularx/formular'
      }
    ]
  }
});
