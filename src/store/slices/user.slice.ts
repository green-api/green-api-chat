import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { UserInterface, UserState } from 'types';
import { getCookie } from 'utils';

const initialState: UserState = {
  user: {
    login:
      sessionStorage.getItem('login') ?? getCookie('login') ?? localStorage.getItem('login') ?? '',
    apiTokenUser:
      sessionStorage.getItem('apiTokenUser') ??
      getCookie('apiTokenUser') ??
      localStorage.getItem('apiTokenUser') ??
      '',
    idUser:
      sessionStorage.getItem('idUser') ??
      getCookie('idUser') ??
      localStorage.getItem('idUser') ??
      '',
  },
};

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserInterface & { remember: boolean }>) => {
      state.user.idUser = action.payload.idUser;
      state.user.apiTokenUser = action.payload.apiTokenUser;
      state.user.login = action.payload.login;
    },
    logout: (state) => {
      state.user.idUser = '';
      state.user.apiTokenUser = '';
      state.user.login = '';
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;

export const selectUser = (state: RootState) => state.userReducer.user;
