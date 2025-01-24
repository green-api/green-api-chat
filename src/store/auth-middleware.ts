import { createListenerMiddleware, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

import { actionCreators } from './actions';
import { RootState } from 'store';
import { InstancesState, UserInterface } from 'types';
import { deleteCookie, setCookie } from 'utils';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(actionCreators.login),
  effect: (action: PayloadAction<UserInterface & { remember: boolean }>, api) => {
    const state = api.getState() as RootState;

    if (action.payload.remember) {
      setCookie('login', state.userReducer.user.login);
      setCookie('apiTokenUser', state.userReducer.user.apiTokenUser);
      setCookie('idUser', state.userReducer.user.idUser);
    }

    sessionStorage.setItem('login', state.userReducer.user.login);
    sessionStorage.setItem('apiTokenUser', state.userReducer.user.apiTokenUser);
    sessionStorage.setItem('idUser', state.userReducer.user.idUser);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(actionCreators.logout),
  effect: () => {
    deleteCookie('login');
    deleteCookie('idUser');
    deleteCookie('apiTokenUser');

    sessionStorage.removeItem('login');
    sessionStorage.removeItem('apiTokenUser');
    sessionStorage.removeItem('idUser');

    localStorage.removeItem('login');
    localStorage.removeItem('apiTokenUser');
    localStorage.removeItem('idUser');
    localStorage.removeItem('selectedInstance');
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(actionCreators.setSelectedInstance),
  effect: (_, api) => {
    const state = api.getState() as RootState;

    localStorage.setItem('selectedInstance', JSON.stringify(state.instancesReducer));
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(actionCreators.setIsChatWorking),
  effect: (action: PayloadAction<InstancesState['isChatWorking']>, api) => {
    const state = api.getState() as RootState;

    localStorage.setItem(
      state.instancesReducer.selectedInstance.idInstance.toString(),
      JSON.stringify(action.payload)
    );
  },
});
