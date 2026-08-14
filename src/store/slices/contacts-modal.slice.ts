import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { ContactsModalState } from 'types';

const initialState: ContactsModalState = {
  isOpen: false,
  editedContact: null,
};

const contactsModalSlice = createSlice({
  name: 'contactsModalSlice',
  initialState,
  reducers: {
    openAddContactModal: (state) => {
      state.isOpen = true;
      state.editedContact = null;
    },
    openEditContactModal: (state, action: PayloadAction<ContactsModalState['editedContact']>) => {
      state.isOpen = true;
      state.editedContact = action.payload;
    },
    closeContactModal: (state) => {
      state.isOpen = false;
      state.editedContact = null;
    },
  },
});

export const contactsModalActions = contactsModalSlice.actions;
export default contactsModalSlice.reducer;

export const selectIsContactModalOpen = (state: RootState) => state.contactsModalReducer.isOpen;
export const selectEditedContact = (state: RootState) => state.contactsModalReducer.editedContact;
