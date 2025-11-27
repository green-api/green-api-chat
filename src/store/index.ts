import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

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

const storageWithTimestamp = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const wrapped = JSON.parse(raw);
      return JSON.stringify(wrapped.state ?? null);
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const existingRaw = localStorage.getItem(key);
      let timestamp = Date.now();

      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        const EXPIRE_MS = 3 * 60 * 1000;

        if (parsed.timestamp && Date.now() - parsed.timestamp < EXPIRE_MS) {
          timestamp = parsed.timestamp;
        }
      }

      const wrapped = {
        state: JSON.parse(value),
        timestamp,
      };

      localStorage.setItem(key, JSON.stringify(wrapped));
    } catch (err) {
      console.error('persist setItem error:', err);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    localStorage.removeItem(key);
  },
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage: storageWithTimestamp,
  whitelist: [persistedMethods.reducerPath],
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
