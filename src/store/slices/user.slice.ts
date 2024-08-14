import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { UserCredentials, UserState } from 'types';

const getInitialStateFromStorage = (): UserState | null => {
  const initialState = localStorage.getItem('userState');

  return initialState ? (JSON.parse(initialState) as UserState) : null;
};

const initialState: UserState = getInitialStateFromStorage() || {
  credentials: {
    idInstance: '1101840021',
    apiTokenInstance: 'ed27c1ac352f486cb7cc7d1d42f014005f5f0c16cbbb42769a',
  },
  isAuth: true,
};

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserCredentials>) => {
      state.credentials = action.payload;
      state.isAuth = true;
    },
    logout: (state) => {
      state.isAuth = false;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;

export const selectCredentials = (state: RootState) => state.userReducer.credentials;
export const selectAuth = (state: RootState) => state.userReducer.isAuth;
