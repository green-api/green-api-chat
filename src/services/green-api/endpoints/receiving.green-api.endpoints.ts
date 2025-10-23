import { greenAPI } from 'services/green-api/green-api.service';
import {
  InstanceInterface,
  ReceiveNotificationResponseInterface,
  DeleteNotificationParameters,
  ResultResponseInterface,
  DownloadFileResponseInterface,
  GetChatInformationParameters,
} from 'types';

export const receivingGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    receiveNotification: builder.query<ReceiveNotificationResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
      }),
    }),
    deleteNotification: builder.mutation<ResultResponseInterface, DeleteNotificationParameters>({
      query: ({ idInstance, apiTokenInstance, receiptId, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
        method: 'DELETE',
      }),
    }),
    downloadFile: builder.mutation<DownloadFileResponseInterface, GetChatInformationParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/downloadFile/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
  }),
});
