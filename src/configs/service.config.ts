import en_US from 'antd/es/locale/en_US';
import he_IL from 'antd/es/locale/he_IL';
import ru_RU from 'antd/es/locale/ru_RU';

import { GreenApiRouteInterface } from 'types';

export const APP_API_URL = 'https://console.green-api.com/api/v1/';

export const APP_API_TOKEN =
  import.meta.env.VITE_DEV_MODE === 'true'
    ? 'test.gac.243b2746f7ef4e18b2dfa98c302f5f27'
    : 'gac.cb546085ecfd42f1a135480c82c9279e';

export const GREEN_API_INSTANCES_ROUTER: GreenApiRouteInterface[] = [
  {
    api: 'https://api.green-api.com',
    media: 'https://media.green-api.com',
    qrHost: 'wss://api.green-api.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [1101, 1102, 2204, [5501, 5530]],
  },
  {
    api: 'https://1103.api.green-api.com',
    media: 'https://1103.media.green-api.com',
    qrHost: 'wss://1103.api.green-api.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [1103],
  },
  {
    api: 'https://5700.api.green-api.com',
    media: 'https://5700.media.green-api.com',
    qrHost: 'wss://5700.api.green-api.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [5700],
  },
  {
    api: 'https://api.p02.green-api.com',
    media: 'https://media.p02.green-api.com',
    qrHost: 'wss://api.p02.green-api.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [3305, 9901],
  },
  {
    api: 'https://api.p03.green-api.com',
    media: 'https://api.p03.green-api.com',
    qrHost: 'wss://api.p03.green-api.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [9903],
  },
  {
    api: 'https://7700.api.greenapi.com',
    media: 'https://7700.media.greenapi.com',
    qrHost: 'wss://7700.api.greenapi.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [[7700, 7710], 7723],
  },
  {
    api: 'https://7835.api.greenapi.com',
    media: 'https://7835.media.greenapi.com',
    qrHost: 'wss://7835.api.greenapi.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [7835],
  },
  {
    api: 'https://7103.api.greenapi.com',
    media: 'https://7103.media.greenapi.com',
    qrHost: 'wss://7103.api.greenapi.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [[7100, 7199]],
  },
  {
    api: 'https://5700.api.green-api.com',
    media: 'https://5700.media.green-api.com',
    qrHost: 'wss://5700.api.green-api.com',
    qrHttpHost: 'https://qr.green-api.com',
    instancesCodes: [[5700, 5799]],
  },
  {
    api: 'https://api.greenapi.com',
    media: 'https://media.greenapi.com',
    qrHost: 'wss://api.greenapi.com',
    qrHttpHost: 'https://qr.greenapi.com',
    instancesCodes: [[7000, 7999]],
  },
];

export const localisation = {
  ru: ru_RU,
  en: en_US,
  he: he_IL,
};
