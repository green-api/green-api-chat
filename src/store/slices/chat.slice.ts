import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ActiveChat, ChatState } from 'types';

const initialState: ChatState = {
  activeChat: null,
};

const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<ActiveChat | null>) => {
      state.activeChat = action.payload;
    },
  },
});

export const chatActions = chatSlice.actions;
export default chatSlice.reducer;

export const selectActiveChat = (state: RootState) => state.chatReducer.activeChat;
