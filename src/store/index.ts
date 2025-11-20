import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import expireReducer from 'redux-persist-expire';

import { listenerMiddleware } from './auth-middleware';
import { qrInstructionReducer } from './slices/qr-instruction.slice';
import { appAPI } from 'services/app/app.service';
import { persistedMethods } from 'services/green-api/endpoints/persisted-methods.green-api.endpoints';
import { greenAPI } from 'services/green-api/green-api.service';
import chatReducer from 'store/slices/chat.slice';
import instancesReducer from 'store/slices/instances.slice';
import messageMenuReducer from 'store/slices/message-menu.slice';
import themeReducer from 'store/slices/theme.slice';
import userReducer from 'store/slices/user.slice';

const rootReducer = combineReducers({
  userReducer,
  chatReducer,
  themeReducer,
  instancesReducer,
  messageMenuReducer,
  qrInstructionReducer,
  [appAPI.reducerPath]: appAPI.reducer,
  [greenAPI.reducerPath]: greenAPI.reducer,
  [persistedMethods.reducerPath]: persistedMethods.reducer,
});

const transforms = [
  expireReducer(persistedMethods.reducerPath, {
    expireSeconds: 180,
    expiredState: {},
    autoExpire: true,
  }),
];

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: [persistedMethods.reducerPath],
  transforms,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const setupStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(
        listenerMiddleware.middleware,
        appAPI.middleware,
        greenAPI.middleware,
        persistedMethods.middleware
      ),
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
