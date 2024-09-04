import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ActiveChat, ChatState } from 'types';
import { isPageInIframe } from 'utils';

const initialState: ChatState = {
  activeChat: null,
  isMiniVersion: isPageInIframe(),
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
export const selectMiniVersion = (state: RootState) => state.chatReducer.isMiniVersion;
