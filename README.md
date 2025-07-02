# 📦 sw-console-chat

Chat module for personal accounts using [GREEN-API](https://green-api.com/en).

### Installation

To install dependencies:

```bash
npm install
```

### Development Mode

Start the development server:

```bash
npm run dev
```

### Production Build

Build the app for production:

```bash
npm run build
```

Compiled files will be located in the `dist/` directory.

---

## 🔐 Authorization Methods

You can provide authorization data to the chat module using either **postMessage** or **URL query parameters**.

---

### 1. Authorization via `postMessage`

To send authorization data from a parent window to an embedded iframe, use the `postMessage` API.

#### Example:

```ts
iframeReference.current?.contentWindow?.postMessage(
  {
    type: MessageEventTypeEnum.INIT,
    payload: {
      login: login,
      apiTokenUser: apiTokenUser,
      idUser: idUser,
      idInstance: instanceData.idInstance,
      apiTokenInstance: instanceData.apiTokenInstance,
      apiUrl: instanceData.apiUrl,
      mediaUrl: instanceData.mediaUrl,
      tariff: instanceData.tariff,
      locale: resolvedLanguage,
      theme: currentTheme,
      platform: platform,
      projectId: projectId,
    },
  },
  CHAT_APP_URL // Replace with the actual iframe URL
);
```

#### Payload Fields

| Field              | Type                  | Description                                 |
| ------------------ | --------------------- | ------------------------------------------- |
| `login`            | `string`              | User login                                  |
| `apiTokenUser`     | `string`              | User API token                              |
| `idUser`           | `string`              | User ID                                     |
| `idInstance`       | `number`              | Instance ID                                 |
| `apiTokenInstance` | `string`              | API token for the instance                  |
| `apiUrl`           | `string`              | Base API URL                                |
| `mediaUrl`         | `string`              | Media upload URL                            |
| `tariff`           | `TariffsEnum`         | Tariff plan (see below)                     |
| `locale`           | `string \| undefined` | Optional language code (e.g., `en`, `ru`)   |
| `theme`            | `ThemesEnum`          | Theme mode (see below)                      |
| `platform`         | `string`              | Platform ID (e.g., `web`, `android`, `ios`) |
| `projectId`        | `string`              | Project identifier                          |

#### TariffsEnum

```ts
export const enum TariffsEnum {
  Developer = 'DEVELOPER',
  Business = 'BUSINESS',
  BusinessUSD = 'BUSINESS_USD',
  BusinessKZT = 'BUSINESS_KZT',
}
```

#### ThemesEnum

```ts
export const enum ThemesEnum {
  Default = 'default',
  Dark = 'dark',
}
```

---

### 2. Authorization via URL Query Parameters

Alternatively, you can pass authorization data through the URL when loading the app:

```
http://localhost:5173/?idInstance=YOUR_ID&apiTokenInstance=YOUR_API_TOKEN&apiUrl=https://api.green-api.com/&mediaUrl=https://media.green-api.com/
```

#### Required Query Parameters

| Parameter          | Description                |
| ------------------ | -------------------------- |
| `idInstance`       | Instance ID                |
| `apiTokenInstance` | API token for the instance |
| `apiUrl`           | Base API URL               |
| `mediaUrl`         | Media API URL              |

## 📄 License

MIT License

# 📦 sw-console-chat

Модуль чата с использованием [GREEN-API](https://green-api.com/).

### Установка

Для установки зависимостей:

```bash
npm install
```

### Режим разработки

Запуск сервера разработки:

```bash
npm run dev
```

### Сборка для продакшена

Сборка приложения для продакшена:

```bash
npm run build
```

Скомпилированные файлы будут находиться в директории `dist/`.

---

## 🔐 Методы авторизации

Вы можете передать данные авторизации в модуль чата с помощью **postMessage** или **параметров URL**.

---

### 1. Авторизация через `postMessage`

Чтобы отправить данные авторизации из родительского окна в встроенный iframe, используйте API `postMessage`.

#### Пример:

```ts
iframeReference.current?.contentWindow?.postMessage(
  {
    type: MessageEventTypeEnum.INIT,
    payload: {
      login: login,
      apiTokenUser: apiTokenUser,
      idUser: idUser,
      idInstance: instanceData.idInstance,
      apiTokenInstance: instanceData.apiTokenInstance,
      apiUrl: instanceData.apiUrl,
      mediaUrl: instanceData.mediaUrl,
      tariff: instanceData.tariff,
      locale: resolvedLanguage,
      theme: currentTheme,
      platform: platform,
      projectId: projectId,
    },
  },
  CHAT_APP_URL // Замените на фактический URL iframe
);
```

#### Поля payload

| Поле               | Тип                   | Описание                                      |
| ------------------ | --------------------- | --------------------------------------------- |
| `login`            | `string`              | Логин пользователя                            |
| `apiTokenUser`     | `string`              | API токен пользователя                        |
| `idUser`           | `string`              | ID пользователя                               |
| `idInstance`       | `number`              | ID инстанса                                   |
| `apiTokenInstance` | `string`              | API токен инстанса                            |
| `apiUrl`           | `string`              | Базовый URL API                               |
| `mediaUrl`         | `string`              | URL для загрузки медиа                        |
| `tariff`           | `TariffsEnum`         | Тарифный план (см. ниже)                      |
| `locale`           | `string \| undefined` | Необязательный код языка (например, `en`)     |
| `theme`            | `ThemesEnum`          | Режим темы (см. ниже)                         |
| `platform`         | `string`              | Платформа (например, `web`, `android`, `ios`) |
| `projectId`        | `string`              | Идентификатор проекта                         |

#### TariffsEnum

```ts
export const enum TariffsEnum {
  Developer = 'DEVELOPER',
  Business = 'BUSINESS',
  BusinessUSD = 'BUSINESS_USD',
  BusinessKZT = 'BUSINESS_KZT',
}
```

#### ThemesEnum

```ts
export const enum ThemesEnum {
  Default = 'default',
  Dark = 'dark',
}
```

---

### 2. Авторизация через параметры URL

Вы также можете передать данные авторизации через URL при загрузке приложения:

```
http://localhost:5173/?idInstance=YOUR_ID&apiTokenInstance=YOUR_API_TOKEN&apiUrl=https://api.green-api.com/&mediaUrl=https://media.green-api.com/
```

#### Обязательные параметры URL

| Параметр           | Описание                      |
| ------------------ | ----------------------------- |
| `idInstance`       | ID инстанса                   |
| `apiTokenInstance` | API токен инстанса            |
| `apiUrl`           | Базовый URL API               |
| `mediaUrl`         | URL для работы с медиафайлами |

## 📄 Лицензия

Лицензия MIT
