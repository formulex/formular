import { defineConfig } from 'dumi';

export default defineConfig({
  mode: 'site',
  hash: true,
  styles: [
    '/fonts/fira-code/fira_code.css',
    `code[class*=language-][class*=language-], pre[class*=language-][class*=language-] {
  font-family: 'Fira Code',Consolas,Monaco,"Andale Mono","Ubuntu Mono",monospace;
  font-size: 14px;
}`
  ],
  chainWebpack() {}
});
