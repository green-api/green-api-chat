import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { UserCredentials, UserState } from 'types';

const initialState: UserState = {
  credentials: {
    idInstance: '1103957425',
    apiTokenInstance: '9b2e3490817d46c09d646c25d08ad61c47bb86452aae49f090',
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
