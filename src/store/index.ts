import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { listenerMiddleware } from './auth-middleware';
import { greenAPI } from 'services/green-api/green-api.service';
import chatReducer from 'store/slices/chat.slice';
import themeReducer from 'store/slices/theme.slice';
import userReducer from 'store/slices/user.slice';

const rootReducer = combineReducers({
  userReducer,
  chatReducer,
  themeReducer,
  [greenAPI.reducerPath]: greenAPI.reducer,
});

export const setupStore = (preloadedState?: RootState) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(listenerMiddleware.middleware, greenAPI.middleware),
    preloadedState,
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
