import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { MessageMenuState } from 'types';

const initialState: MessageMenuState = {
  activeMode: 'menu',
  messageData: null,
};

const messageMenuSlice = createSlice({
  name: 'messageMenuSlice',
  initialState,
  reducers: {
    setMessageMenuActiveMode: (state, action: PayloadAction<MessageMenuState['activeMode']>) => {
      state.activeMode = action.payload;
    },
    setMessageMenuActiveMessageData: (
      state,
      action: PayloadAction<MessageMenuState['messageData']>
    ) => {
      state.messageData = action.payload;
    },
  },
});

export const messageMenuActions = messageMenuSlice.actions;
export default messageMenuSlice.reducer;

export const selectMessageMenuActiveMode = (state: RootState) =>
  state.messageMenuReducer.activeMode;
export const selectMessageMenuActiveMessageData = (state: RootState) =>
  state.messageMenuReducer.messageData;
