export * from './api.types';

export interface UserState {
  credentials: UserCredentials;
  isAuth: boolean;
}
export interface UserCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface InstanceInterface {
  idInstance: string;
  apiTokenInstance: string;
}

export interface ApiErrorResponse<T = unknown> {
  status: number | string;
  data: T;
}

export interface GreenApiUrlsInterface {
  api: string;
  media: string;
  qrHost: string;
  qrHttpHost: string;
}

export interface GreenApiRouteInterface extends GreenApiUrlsInterface {
  // string - для одного значения, string[] - для диапазона значений
  instancesCodes: (number | [number, number])[];
}

export type LanguageLiteral = 'en' | 'ru' | 'he';
