import { createSlice } from '@reduxjs/toolkit';

import { QrInstructionInterface } from 'types';

const initialState: QrInstructionInterface = {
  isVisibleQrInstruction: false,
  isNecessaryToLogout: false,
};

export const qrInstructionSlice = createSlice({
  name: 'qrInstruction',
  initialState,
  reducers: {
    showQrInstruction: (state) => {
      state.isVisibleQrInstruction = true;
      state.isNecessaryToLogout = true;
      return state;
    },
    hideQrInstruction: (state) => {
      state.isVisibleQrInstruction = false;
      return state;
    },
    clearState: () => {
      return initialState;
    },
  },
});

export const qrInstructionReducer = qrInstructionSlice.reducer;
