import { ThunkAction, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { greenAPI } from 'services/green-api/green-api.service';
import {
  DeleteStatusParametersInterface,
  SendTextStatusInterface,
  SendVoiceStatusInterface,
  SendingResponseInterface,
  StatusesJournalParametersInterface,
  StatusJournalItemInterface,
} from 'types';

const buildStatusesQueryArgs = (
  arg: Pick<
    StatusesJournalParametersInterface,
    'idInstance' | 'apiTokenInstance' | 'apiUrl' | 'mediaUrl'
  >
): StatusesJournalParametersInterface => ({
  idInstance: arg.idInstance,
  apiTokenInstance: arg.apiTokenInstance,
  apiUrl: arg.apiUrl,
  mediaUrl: arg.mediaUrl,
  minutes: 1440,
});

const getInstanceStatusOwnerChatId = (
  state: unknown,
  args: Pick<
    StatusesJournalParametersInterface,
    'idInstance' | 'apiTokenInstance' | 'apiUrl' | 'mediaUrl'
  >
) => {
  const endpoints = greenAPI.endpoints as any;

  const waSettings = endpoints.getWaSettings?.select(args as never)(state as never);
  const waSettingsChatId = waSettings.data?.chatId?.trim();
  if (waSettingsChatId) return waSettingsChatId;

  const waSettingsPhone = waSettings.data?.phone?.trim();
  if (waSettingsPhone) return `${waSettingsPhone}@c.us`;

  const settings = endpoints.getSettings?.select(args as never)(state as never);
  const settingsWid = settings.data?.wid?.trim();
  if (settingsWid) return settingsWid;

  const accountSettings = endpoints.getAccountSettings?.select(args as never)(state as never);
  const accountChatId = accountSettings.data?.chatId?.trim();
  if (accountChatId) return accountChatId;
  const accountPhone = accountSettings.data?.phone?.trim();
  if (accountPhone) return `${accountPhone}@c.us`;

  const outgoingStatuses = endpoints.getOutgoingStatuses?.select(
    buildStatusesQueryArgs(args) as never
  )(state as never);
  const fallbackChatId = outgoingStatuses.data
    ?.find((item: StatusJournalItemInterface) => !!item.chatId)
    ?.chatId?.trim();
  if (fallbackChatId) return fallbackChatId;

  return '';
};

const resolveInstanceStatusOwnerChatId = async (
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
  getState: () => unknown,
  args: Pick<
    StatusesJournalParametersInterface,
    'idInstance' | 'apiTokenInstance' | 'apiUrl' | 'mediaUrl'
  >
) => {
  type Dispatchable = UnknownAction | ThunkAction<unknown, unknown, unknown, UnknownAction>;
  const endpointInitiators = greenAPI.endpoints as unknown as {
    getWaSettings?: {
      initiate: (arg: typeof args, options?: { forceRefetch?: boolean }) => Dispatchable;
    };
    getAccountSettings?: {
      initiate: (arg: typeof args, options?: { forceRefetch?: boolean }) => Dispatchable;
    };
    getSettings?: {
      initiate: (arg: typeof args, options?: { forceRefetch?: boolean }) => Dispatchable;
    };
  };

  const cached = getInstanceStatusOwnerChatId(getState(), args);
  if (cached) return cached;

  try {
    if (endpointInitiators.getWaSettings) {
      await dispatch(endpointInitiators.getWaSettings.initiate(args, { forceRefetch: true }));
    }
  } catch {}
  const waResolved = getInstanceStatusOwnerChatId(getState(), args);
  if (waResolved) return waResolved;

  try {
    if (endpointInitiators.getAccountSettings) {
      await dispatch(endpointInitiators.getAccountSettings.initiate(args, { forceRefetch: true }));
    }
  } catch {}
  const accountResolved = getInstanceStatusOwnerChatId(getState(), args);
  if (accountResolved) return accountResolved;

  try {
    if (endpointInitiators.getSettings) {
      await dispatch(endpointInitiators.getSettings.initiate(args, { forceRefetch: true }));
    }
  } catch {}

  return getInstanceStatusOwnerChatId(getState(), args);
};

export const statusesGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    sendTextStatus: builder.mutation<SendingResponseInterface, SendTextStatusInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendTextStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => {
        return [];
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const now = Math.floor(Date.now() / 1000);
        const optimisticId = `optimistic-text-${Date.now()}`;
        const ownerChatId = await resolveInstanceStatusOwnerChatId(dispatch, getState, arg);
        const patchResult = dispatch(
          greenAPI.util.updateQueryData(
            'getOutgoingStatuses' as never,
            buildStatusesQueryArgs(arg) as never,
            (draft: StatusJournalItemInterface[]) => {
              draft.unshift({
                type: 'outgoing',
                idMessage: optimisticId,
                timestamp: now,
                typeMessage: 'extendedTextMessage',
                chatId: ownerChatId || arg.participants?.[0] || '',
                senderId: ownerChatId || arg.participants?.[0] || undefined,
                textMessage: arg.message,
                extendedTextMessage: {
                  text: arg.message,
                  backgroundColor: arg.backgroundColor,
                  font: arg.font,
                },
                participants: arg.participants,
                sendByApi: true,
              });
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    sendVoiceStatus: builder.mutation<SendingResponseInterface, SendVoiceStatusInterface>({
      query: ({
        idInstance,
        apiTokenInstance,
        apiUrl,
        mediaUrl: _,
        optimisticDownloadUrl: _optimisticDownloadUrl,
        ...body
      }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendVoiceStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => {
        return [];
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const now = Math.floor(Date.now() / 1000);
        const optimisticId = `optimistic-voice-${Date.now()}`;
        const ownerChatId = await resolveInstanceStatusOwnerChatId(dispatch, getState, arg);
        const patchResult = dispatch(
          greenAPI.util.updateQueryData(
            'getOutgoingStatuses' as never,
            buildStatusesQueryArgs(arg) as never,
            (draft: StatusJournalItemInterface[]) => {
              draft.unshift({
                type: 'outgoing',
                idMessage: optimisticId,
                timestamp: now,
                typeMessage: 'audioMessage',
                chatId: ownerChatId || arg.participants?.[0] || '',
                senderId: ownerChatId || arg.participants?.[0] || undefined,
                fileName: arg.fileName,
                downloadUrl: arg.optimisticDownloadUrl || arg.urlFile,
                caption: arg.caption,
                participants: arg.participants,
                sendByApi: true,
              });
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    sendMediaStatus: builder.mutation<SendingResponseInterface, SendVoiceStatusInterface>({
      query: ({
        idInstance,
        apiTokenInstance,
        apiUrl,
        mediaUrl: _,
        optimisticDownloadUrl: _optimisticDownloadUrl,
        ...body
      }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendMediaStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: () => {
        return [];
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const now = Math.floor(Date.now() / 1000);
        const optimisticId = `optimistic-media-${Date.now()}`;
        const ownerChatId = await resolveInstanceStatusOwnerChatId(dispatch, getState, arg);
        const isVideo =
          typeof arg.fileName === 'string' &&
          ['.mp4', '.mov', '.webm', '.mkv', '.avi'].some((ext) =>
            arg.fileName.toLowerCase().endsWith(ext)
          );
        const patchResult = dispatch(
          greenAPI.util.updateQueryData(
            'getOutgoingStatuses' as never,
            buildStatusesQueryArgs(arg) as never,
            (draft: StatusJournalItemInterface[]) => {
              draft.unshift({
                type: 'outgoing',
                idMessage: optimisticId,
                timestamp: now,
                typeMessage: isVideo ? 'videoMessage' : 'imageMessage',
                chatId: ownerChatId || arg.participants?.[0] || '',
                senderId: ownerChatId || arg.participants?.[0] || undefined,
                fileName: arg.fileName,
                downloadUrl: arg.optimisticDownloadUrl || arg.urlFile,
                caption: arg.caption,
                participants: arg.participants,
                sendByApi: true,
              });
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteStatus: builder.mutation<void, DeleteStatusParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/deleteStatus/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const queryArgs = buildStatusesQueryArgs(arg);
        const incomingPatch = dispatch(
          greenAPI.util.updateQueryData(
            'getIncomingStatuses' as never,
            queryArgs as never,
            (draft: StatusJournalItemInterface[]) =>
              draft.filter((item) => item.idMessage !== arg.idMessage)
          )
        );
        const outgoingPatch = dispatch(
          greenAPI.util.updateQueryData(
            'getOutgoingStatuses' as never,
            queryArgs as never,
            (draft: StatusJournalItemInterface[]) =>
              draft.filter((item) => item.idMessage !== arg.idMessage)
          )
        );

        try {
          await queryFulfilled;
        } catch {
          incomingPatch.undo();
          outgoingPatch.undo();
        }
      },
      invalidatesTags: ['statuses'],
    }),
    getIncomingStatuses: builder.query<
      StatusJournalItemInterface[],
      StatusesJournalParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...params }) => ({
        url: `${apiUrl}waInstance${idInstance}/getIncomingStatuses/${apiTokenInstance}`,
        params,
      }),
      providesTags: ['statuses'],
    }),
    getOutgoingStatuses: builder.query<
      StatusJournalItemInterface[],
      StatusesJournalParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...params }) => ({
        url: `${apiUrl}waInstance${idInstance}/getOutgoingStatuses/${apiTokenInstance}`,
        params,
      }),
      providesTags: ['statuses'],
    }),
  }),
});
