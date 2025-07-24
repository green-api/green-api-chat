import en_US from 'antd/es/locale/en_US';
import he_IL from 'antd/es/locale/he_IL';
import ru_RU from 'antd/es/locale/ru_RU';

export const APP_API_URL = 'https://console.test.greenapi.org/api/v1/';

export const APP_API_TOKEN =
  import.meta.env.VITE_DEV_MODE === 'true'
    ? 'test.gac.243b2746f7ef4e18b2dfa98c302f5f27'
    : 'gac.cb546085ecfd42f1a135480c82c9279e';

export const localisation = {
  ru: ru_RU,
  en: en_US,
  he: he_IL,
};
