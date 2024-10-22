import { greenAPI } from 'services/green-api/green-api.service';
import {
  CreateTemplateParameters,
  DeleteTemplateByIdParameters,
  DeleteTemplateParametersInterface,
  EditTemplateParameters,
  GetTemplateByIdParametersInterface,
  GetTemplatesResponseInterface,
  InstanceInterface,
  SendingResponseInterface,
  SendTemplateParameters,
  WabaTemplateResponseInterface,
  WabaTemplateStatusResponseInterface,
} from 'types';
import { getGreenApiUrls } from 'utils';

export const wabaGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    createTemplate: builder.mutation<WabaTemplateResponseInterface, CreateTemplateParameters>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/createTemplate/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['wabaTemplates'],
    }),
    getTemplates: builder.query<GetTemplatesResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getTemplates/${apiTokenInstance}`,
      }),
      providesTags: (result, __, argument) =>
        result
          ? [
              { type: 'wabaTemplates', id: argument.idInstance },
              { type: 'wabaTemplates', id: 'templates' },
            ]
          : [{ type: 'wabaTemplates', id: 'templates' }],
    }),
    getTemplateById: builder.query<
      WabaTemplateResponseInterface,
      GetTemplateByIdParametersInterface
    >({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: ({ idInstance, apiTokenInstance, rtkSessionId, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getTemplateById/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      providesTags: (result, _, arguments_) => {
        if (result) return [{ type: 'wabaTemplates', id: arguments_.templateId }];
        return [{ type: 'waSettings', id: 'WabaTemplate' }];
      },
    }),
    deleteTemplate: builder.mutation<
      WabaTemplateStatusResponseInterface,
      DeleteTemplateParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/deleteTemplate/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['wabaTemplates'],
    }),
    deleteTemplateById: builder.mutation<
      WabaTemplateStatusResponseInterface,
      DeleteTemplateByIdParameters
    >({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/deleteTemplateById/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, argument) => [{ type: 'wabaTemplates', id: argument.templateId }],
    }),
    sendTemplate: builder.mutation<SendingResponseInterface, SendTemplateParameters>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/sendTemplate/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    editTemplate: builder.mutation<WabaTemplateStatusResponseInterface, EditTemplateParameters>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/editTemplate/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['wabaTemplates'],
    }),
  }),
});
