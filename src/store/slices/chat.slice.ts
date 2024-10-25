import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ChatState } from 'types';
import { getIsMiniVersion } from 'utils';

const initialState: ChatState = {
  activeChat: null,
  userSideActiveMode: 'chats',
  activeSendingMode: null,
  type: 'tab',
  isMiniVersion: getIsMiniVersion('tab'),
  messageCount: 30,
  isContactInfoOpen: false,
  activeTemplate: null,
  templateMessagesLoading: false,
};

const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<ChatState['activeChat']>) => {
      state.activeChat = action.payload;
    },

    setUserSideActiveMode: (state, action: PayloadAction<ChatState['userSideActiveMode']>) => {
      state.userSideActiveMode = action.payload;
    },

    setActiveSendingMode: (state, action: PayloadAction<ChatState['activeSendingMode']>) => {
      state.activeSendingMode = action.payload;
    },

    setMessageCount: (state, action: PayloadAction<ChatState['messageCount']>) => {
      state.messageCount = action.payload;
    },

    setType: (state, action: PayloadAction<ChatState['type']>) => {
      state.type = action.payload;

      state.isMiniVersion = getIsMiniVersion(action.payload);
    },

    setContactInfoOpen: (state, action: PayloadAction<ChatState['isContactInfoOpen']>) => {
      state.isContactInfoOpen = action.payload;
    },

    setActiveTemplate: (state, action: PayloadAction<ChatState['activeTemplate']>) => {
      state.activeTemplate = action.payload;
    },

    setTemplateMessagesLoading: (
      state,
      action: PayloadAction<ChatState['templateMessagesLoading']>
    ) => {
      state.templateMessagesLoading = action.payload;
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
export const selectType = (state: RootState) => state.chatReducer.type;
export const selectIsContactInfoOpen = (state: RootState) => state.chatReducer.isContactInfoOpen;
export const selectActiveTemplate = (state: RootState) => state.chatReducer.activeTemplate;
export const selectTemplateMessagesLoading = (state: RootState) =>
  state.chatReducer.templateMessagesLoading;
