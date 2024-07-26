import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { listenerMiddleware } from './auth-middleware';
import { greenAPI } from 'services/green-api/green-api.service';
import userReducer from 'store/slices/user.slice';

const rootReducer = combineReducers({
  userReducer,
  [greenAPI.reducerPath]: greenAPI.reducer,
});

export const setupStore = (preloadedState?: RootState) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware(listenerMiddleware.middleware, greenAPI.middleware),
    preloadedState,
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
