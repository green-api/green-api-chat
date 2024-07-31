import { greenAPI } from 'services/green-api/green-api.service';
import {
  CheckWhatsappParametersInterface,
  CheckWhatsappResponseInterface,
  GetAvatarResponseInterface,
  GetContactInfoResponseInterface,
  RequestWithChatIdParameters,
} from 'types';
import { getGreenApiUrls } from 'utils';

export const serviceMethodsGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    checkWhatsapp: builder.mutation<
      CheckWhatsappResponseInterface,
      CheckWhatsappParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/checkWhatsapp/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    getAvatar: builder.query<GetAvatarResponseInterface, RequestWithChatIdParameters>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getAvatar/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    getContactInfo: builder.query<GetContactInfoResponseInterface, RequestWithChatIdParameters>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
  }),
});
