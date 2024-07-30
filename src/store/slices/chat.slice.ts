import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ChatState, MessageInterface } from 'types';

const initialState: ChatState = {
  showContactList: true,
  activeChat: {} as MessageInterface,
};

const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<MessageInterface>) => {
      state.activeChat = action.payload;
      state.showContactList = false;
    },
    setShowContactList: (state) => {
      state.showContactList = true;
      state.activeChat = {} as MessageInterface;
    },
  },
});

export const chatActions = chatSlice.actions;
export default chatSlice.reducer;

export const selectActiveChat = (state: RootState) => state.chatReducer.activeChat;
export const selectShowContactList = (state: RootState) => state.chatReducer.showContactList;
