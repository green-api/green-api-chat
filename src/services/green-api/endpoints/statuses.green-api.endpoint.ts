import { greenAPI } from 'services/green-api/green-api.service';
import { SendTextStatusInterface, SendVoiceStatusInterface, SendingResponseInterface } from 'types';

export const statusesGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    sendTextStatus: builder.mutation<SendingResponseInterface, SendTextStatusInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendTextStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => {
        return ['statuses'];
      },
    }),
    sendVoiceStatus: builder.mutation<SendingResponseInterface, SendVoiceStatusInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendVoiceStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => {
        return ['statuses'];
      },
    }),
    sendMediaStatus: builder.mutation<SendingResponseInterface, SendVoiceStatusInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendMediaStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => {
        return ['statuses'];
      },
    }),
  }),
});
