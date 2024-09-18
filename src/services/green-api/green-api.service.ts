import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { RootState } from 'store';
import { InstanceInterface, MessageInterface } from 'types';
import { getGreenApiUrls, getLastChats, isPageInIframe, updateLastChats } from 'utils';

const baseQuery = fetchBaseQuery({
  baseUrl: '',
});

let attemptIdToGetChats = 1;

const customQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (api.endpoint !== 'lastMessages') {
    return baseQuery(args, api, extraOptions);
  }

  const state = api.getState() as RootState;
  const { idInstance, apiTokenInstance } = (args as FetchArgs).params as InstanceInterface;

  const key =
    `lastMessages(${JSON.stringify({ apiTokenInstance, idInstance })})` as keyof typeof state.greenAPI.queries;
  const currentChats = state.greenAPI.queries[key]?.data;

  let minutes = 3;

  if (!currentChats) {
    minutes = isPageInIframe() ? 1440 : 20160;
  }

  if (!currentChats && isPageInIframe() && attemptIdToGetChats < 6) {
    minutes = 1440;
    attemptIdToGetChats++;
  }

  const [lastIncomingMessages, lastOutgoingMessages] = await Promise.all([
    baseQuery(
      {
        url: `${getGreenApiUrls(idInstance).api}/waInstance${idInstance}/lastIncomingMessages/${apiTokenInstance}`,
        params: { minutes },
      },
      { ...api, endpoint: 'lastIncomingMessages' },
      extraOptions
    ),
    baseQuery(
      {
        url: `${getGreenApiUrls(idInstance).api}/waInstance${idInstance}/lastOutgoingMessages/${apiTokenInstance}`,
        params: { minutes },
      },
      { ...api, endpoint: 'lastOutgoingMessages' },
      extraOptions
    ),
  ]);

  if (lastIncomingMessages.data && lastOutgoingMessages.data) {
    lastIncomingMessages.data = !currentChats
      ? getLastChats(
          lastIncomingMessages.data as MessageInterface[],
          lastOutgoingMessages.data as MessageInterface[],
          isPageInIframe() ? 5 : undefined
        )
      : updateLastChats(
          currentChats as MessageInterface[],
          lastIncomingMessages.data as MessageInterface[],
          lastOutgoingMessages.data as MessageInterface[]
        );
  }

  if (lastIncomingMessages.error || lastOutgoingMessages.error) {
    lastIncomingMessages.error = lastIncomingMessages.error || lastOutgoingMessages.error;
  }

  return lastIncomingMessages;
};

export const greenAPI = createApi({
  reducerPath: 'greenAPI',
  baseQuery: customQuery,
  endpoints: () => ({}),
  tagTypes: ['lastMessages'],
});
