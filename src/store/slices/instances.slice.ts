import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { InstanceInterface, InstancesState } from 'types';

const getSelectedInstanceFromStorage = () => {
  let selectedInstance: InstanceInterface | null = null;

  try {
    const instanceFromStorage = localStorage.getItem('selectedInstance');

    selectedInstance = JSON.parse(instanceFromStorage!) as InstanceInterface;
  } catch {
    selectedInstance = null;
  }

  return selectedInstance;
};

const initialState: InstancesState = {
  selectedInstance: getSelectedInstanceFromStorage() || {
    idInstance: 0,
    apiTokenInstance: '',
  },

  defaultIdInstance: sessionStorage.getItem('defaultIdInstanceForMethods') ?? undefined,
};

export const instancesSlice = createSlice({
  name: 'instancesSlice',
  initialState,
  reducers: {
    setSelectedInstance: (state, action: PayloadAction<InstancesState['selectedInstance']>) => {
      state.selectedInstance = action.payload;
    },
    setDefaultIdInstance: (state, action: PayloadAction<InstancesState['defaultIdInstance']>) => {
      state.defaultIdInstance = action.payload;

      if (action.payload) {
        sessionStorage.setItem('defaultIdInstanceForMethods', action.payload);
      }

      sessionStorage.removeItem('defaultIdInstanceForMethods');
    },
  },
});

export const instancesActions = instancesSlice.actions;
export default instancesSlice.reducer;

export const selectInstance = (state: RootState) => state.instancesReducer.selectedInstance;
export const selectDefaultIdInstance = (state: RootState) =>
  state.instancesReducer.defaultIdInstance;
