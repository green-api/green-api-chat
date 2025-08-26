import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { InstancesState, TariffsEnum, TypeInstance } from 'types';

const getInitialStateFromStorage = () => {
  let initialState: InstancesState | null = null;

  try {
    const initialStateFromStorage = localStorage.getItem('selectedInstance');

    initialState = JSON.parse(initialStateFromStorage!) as InstancesState;
  } catch {
    initialState = null;
  }

  return initialState;
};

const initialState: InstancesState = getInitialStateFromStorage() || {
  selectedInstance: {
    idInstance: 0,
    apiTokenInstance: '',
    apiUrl: '',
    mediaUrl: '',
  },
  tariff: TariffsEnum.Developer,
  isChatWorking: null,
  typeInstance: 'whatsapp',
  instanceList: null,
};

export const instancesSlice = createSlice({
  name: 'instancesSlice',
  initialState,
  reducers: {
    setSelectedInstance: (
      state,
      action: PayloadAction<
        InstancesState['selectedInstance'] & {
          tariff: TariffsEnum;
          typeInstance: TypeInstance;
          isChatWorking?: boolean | null;
        }
      >
    ) => {
      const { tariff, isChatWorking, typeInstance, ...selectedInstance } = action.payload;

      state.selectedInstance = selectedInstance;
      state.tariff = tariff;

      if (isChatWorking !== undefined) {
        state.isChatWorking = isChatWorking;
      }

      if (typeInstance) {
        state.typeInstance = typeInstance;
      }
    },
    setIsChatWorking: (state, action: PayloadAction<InstancesState['isChatWorking']>) => {
      state.isChatWorking = action.payload;
    },
    setInstanceList: (state, action: PayloadAction<InstancesState['instanceList']>) => {
      state.instanceList = action.payload
        ? action.payload.filter((instance) => !instance.deleted)
        : null;
    },
  },
});

export const instancesActions = instancesSlice.actions;
export default instancesSlice.reducer;

export const selectInstance = (state: RootState) => state.instancesReducer.selectedInstance;
export const selectInstanceList = (state: RootState) => state.instancesReducer.instanceList;
export const selectTypeInstance = (state: RootState) => state.instancesReducer.typeInstance;
export const selectInstanceTariff = (state: RootState) => state.instancesReducer.tariff;
export const selectIsChatWorking = (state: RootState) => state.instancesReducer.isChatWorking;
