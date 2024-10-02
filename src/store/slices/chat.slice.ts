import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ActiveChat, ChatState, SendingMethodName, UserSideActiveMode } from 'types';
import { isPageInIframe } from 'utils';

const initialState: ChatState = {
  activeChat: null,
  userSideActiveMode: 'chats',
  activeSendingMode: null,
  isMiniVersion: isPageInIframe(),
  messageCount: 20,
};

const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<ActiveChat | null>) => {
      state.activeChat = action.payload;
    },

    setUserSideActiveMode: (state, action: PayloadAction<UserSideActiveMode>) => {
      state.userSideActiveMode = action.payload;
    },

    setActiveSendingMode: (state, action: PayloadAction<SendingMethodName | null>) => {
      state.activeSendingMode = action.payload;
    },

    setMessageCount: (state, action: PayloadAction<number>) => {
      state.messageCount = action.payload;
    },
  },
});

export const chatActions = chatSlice.actions;
export default chatSlice.reducer;

export const selectActiveChat = (state: RootState) => state.chatReducer.activeChat;
export const selectUserSideActiveMode = (state: RootState) => state.chatReducer.userSideActiveMode;
export const selectActiveSendingMode = (state: RootState) => state.chatReducer.activeSendingMode;
export const selectMiniVersion = (state: RootState) => state.chatReducer.isMiniVersion;
export const selectMessageCount = (state: RootState) => state.chatReducer.messageCount;
