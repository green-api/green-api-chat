import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { RootState } from 'store';
import { InstanceInterface, MessageInterface } from 'types';
import { getIsMiniVersion, getLastChats, updateLastChats } from 'utils';

const baseQuery = fetchBaseQuery({
  baseUrl: '',
  timeout: 70000,
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
  const type = state.chatReducer.type;
  const { idInstance, apiTokenInstance, apiUrl, mediaUrl } = (args as FetchArgs)
    .params as InstanceInterface;

  const cacheKey = `lastMessages(${JSON.stringify({ apiTokenInstance, apiUrl, idInstance, mediaUrl })})`;
  const currentChats = state.greenAPI.queries[cacheKey]?.data;

  let minutes = 3;

  if (!currentChats) {
    minutes = getIsMiniVersion(type) ? 1440 : 20160;

    if (type === 'partner-iframe') {
      minutes = 12080;
    }
  }

  if (!currentChats && getIsMiniVersion(type) && attemptIdToGetChats < 6) {
    minutes = 1440;
    attemptIdToGetChats++;
  }

  const [lastIncomingMessages, lastOutgoingMessages] = await Promise.all([
    baseQuery(
      {
        url: `${apiUrl}waInstance${idInstance}/lastIncomingMessages/${apiTokenInstance}`,
        params: { minutes },
      },
      { ...api, endpoint: 'lastIncomingMessages' },
      extraOptions
    ),
    baseQuery(
      {
        url: `${apiUrl}waInstance${idInstance}/lastOutgoingMessages/${apiTokenInstance}`,
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
          getIsMiniVersion(type) ? 5 : undefined
        )
      : updateLastChats(
          currentChats as MessageInterface[],
          lastIncomingMessages.data as MessageInterface[],
          lastOutgoingMessages.data as MessageInterface[],
          getIsMiniVersion(type) ? 5 : undefined
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
  tagTypes: ['lastMessages', 'wabaTemplates', 'waSettings', 'groupData', 'chatHistory'],
});
