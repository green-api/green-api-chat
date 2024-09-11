import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { actionCreators } from './actions';
import { RootState } from 'store';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(actionCreators.setCredentials),
  effect: (_, api) => {
    const state = api.getState() as RootState;

    // if (!state.chatReducer.isMiniVersion) {
    //   localStorage.setItem('userState', JSON.stringify(state.userReducer));
    // }

    localStorage.setItem('userState', JSON.stringify(state.userReducer));
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(actionCreators.logout),
  effect: () => {
    localStorage.removeItem('userState');
  },
});
