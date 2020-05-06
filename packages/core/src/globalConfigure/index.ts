import en from 'ajv-i18n/localize/en';

export interface GlobalConfigure {
  ajvLocalize: any;
}

export const globalConfig: GlobalConfigure = {
  ajvLocalize: en
};

export function configure({ ajvLocalize }: Partial<GlobalConfigure>) {
  if (typeof ajvLocalize === 'function') {
    globalConfig.ajvLocalize = ajvLocalize;
  }
}
