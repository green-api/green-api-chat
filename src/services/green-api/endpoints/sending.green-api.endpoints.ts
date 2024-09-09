import { greenAPI } from 'services/green-api/green-api.service';
import {
  SendMessageParametersInterface,
  SendingResponseInterface,
  SendFileByUploadResponseInterface,
  SendFileByUploadParametersInterface,
  SendContactParametersInterface,
  SendLocationParametersInterface,
} from 'types';
import { getFormData, getGreenApiUrls } from 'utils';

export const sendingGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<SendingResponseInterface, SendMessageParametersInterface>({
      query: ({ idInstance, apiTokenInstance, refetchLastMessages, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => {
        if (!result || !arg.refetchLastMessages) return [];

        return ['lastMessages'];
      },
    }),
    sendContact: builder.mutation<SendingResponseInterface, SendContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/sendContact/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    sendLocation: builder.mutation<SendingResponseInterface, SendLocationParametersInterface>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/sendLocation/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    sendFileByUpload: builder.mutation<
      SendFileByUploadResponseInterface,
      SendFileByUploadParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).media
        }/waInstance${idInstance}/sendFileByUpload/${apiTokenInstance}`,
        method: 'POST',
        body: getFormData(body),
        formData: true,
      }),
    }),
  }),
});
