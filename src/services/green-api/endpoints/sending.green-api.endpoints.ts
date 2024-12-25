import { greenAPI } from 'services/green-api/green-api.service';
import {
  SendMessageParametersInterface,
  SendingResponseInterface,
  SendFileByUploadResponseInterface,
  SendFileByUploadParametersInterface,
  SendContactParametersInterface,
  SendLocationParametersInterface,
  SendPollParametersInterface,
} from 'types';
import { getFormData } from 'utils';

export const sendingGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<SendingResponseInterface, SendMessageParametersInterface>({
      query: ({
        idInstance,
        apiTokenInstance,
        refetchLastMessages,
        apiUrl,
        mediaUrl: _,
        ...body
      }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => {
        if (!result || !arg.refetchLastMessages) return [];

        return ['lastMessages'];
      },
    }),
    sendContact: builder.mutation<SendingResponseInterface, SendContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendContact/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    sendLocation: builder.mutation<SendingResponseInterface, SendLocationParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendLocation/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    sendPoll: builder.mutation<SendingResponseInterface, SendPollParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendPoll/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    sendFileByUpload: builder.mutation<
      SendFileByUploadResponseInterface,
      SendFileByUploadParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, mediaUrl, apiUrl: _, ...body }) => ({
        url: `${mediaUrl}waInstance${idInstance}/sendFileByUpload/${apiTokenInstance}`,
        method: 'POST',
        body: getFormData(body),
        formData: true,
      }),
    }),
  }),
});
