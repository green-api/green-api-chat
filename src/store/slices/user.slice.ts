import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { UserCredentials, UserState } from 'types';

const initialState: UserState = {
  credentials: {
    idInstance: '',
    apiTokenInstance: '',
  },
  isAuth: false,
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
