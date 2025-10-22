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
  searchQuery: '',
  replyMessage: null,
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

    setReplyMessage: (state, action: PayloadAction<ChatState['replyMessage']>) => {
      state.replyMessage = action.payload;
    },

    setBrandData: (
      state,
      action: PayloadAction<{
        description?: ChatState['description'];
        brandImageUrl?: ChatState['brandImgUrl'];
      }>
    ) => {
      action.payload.description && (state.description = action.payload.description);
      action.payload.brandImageUrl && (state.brandImgUrl = action.payload.brandImageUrl);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
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
export const selectDescription = (state: RootState) => state.chatReducer.description;
export const selectBrandImgUrl = (state: RootState) => state.chatReducer.brandImgUrl;
export const selectSearchQuery = (state: RootState) => state.chatReducer.searchQuery;
export const selectReplyMessage = (state: RootState) => state.chatReducer.replyMessage;
