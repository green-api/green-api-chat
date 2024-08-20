import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { greenAPI } from 'services/green-api/green-api.service';
import chatReducer from 'store/slices/chat.slice';
import userReducer from 'store/slices/user.slice';

const rootReducer = combineReducers({
  userReducer,
  chatReducer,
  [greenAPI.reducerPath]: greenAPI.reducer,
});

export const setupStore = (preloadedState?: RootState) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(greenAPI.middleware),
    preloadedState,
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
