import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { MessageMenuState } from 'types';

const initialState: MessageMenuState = {
  activeMode: 'menu',
  activeServiceMethod: null,
  messageDataForRender: null,
};

const messageMenuSlice = createSlice({
  name: 'messageMenuSlice',
  initialState,
  reducers: {
    setMessageMenuActiveMode: (state, action: PayloadAction<MessageMenuState['activeMode']>) => {
      state.activeMode = action.payload;
    },
    setMessageDataForRender: (
      state,
      action: PayloadAction<MessageMenuState['messageDataForRender']>
    ) => {
      state.messageDataForRender = action.payload;
    },
    setActiveServiceMethod: (
      state,
      action: PayloadAction<MessageMenuState['activeServiceMethod']>
    ) => {
      state.activeServiceMethod = action.payload;
    },
  },
});

export const messageMenuActions = messageMenuSlice.actions;
export default messageMenuSlice.reducer;

export const selectMessageMenuActiveMode = (state: RootState) =>
  state.messageMenuReducer.activeMode;
export const selectMessageDataForRender = (state: RootState) =>
  state.messageMenuReducer.messageDataForRender;
export const selectActiveServiceMethod = (state: RootState) =>
  state.messageMenuReducer.activeServiceMethod;
