import { greenAPI } from 'services/green-api/green-api.service';
import {
  InstanceInterface,
  ReceiveNotificationResponseInterface,
  DeleteNotificationParameters,
  ResultResponseInterface,
} from 'types';
import { getGreenApiUrls } from 'utils';

export const receivingGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    receiveNotification: builder.mutation<ReceiveNotificationResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
      }),
    }),
    deleteNotification: builder.mutation<ResultResponseInterface, DeleteNotificationParameters>({
      query: ({ idInstance, apiTokenInstance, receiptId }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
        method: 'DELETE',
      }),
    }),
  }),
});
