import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { RootState } from 'store';
import { InstanceInterface, MessageInterface } from 'types';
import { getIsMiniVersion, getLastChats, updateLastChats, getAllChats } from 'utils';

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
  const { idInstance, apiTokenInstance, apiUrl, mediaUrl, allMessages, minutesToRefetch } = (
    args as FetchArgs
  ).params as InstanceInterface & { allMessages?: boolean; minutesToRefetch?: number };

  const cacheKey = `lastMessages(${JSON.stringify({ allMessages, apiTokenInstance, apiUrl, idInstance, mediaUrl })})`;
  const currentChats: MessageInterface[] | undefined = state.greenAPI.queries[cacheKey]?.data as
    | MessageInterface[]
    | undefined;

  let minutes = minutesToRefetch ?? 3;

  if (!currentChats?.length) {
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
    if (allMessages) {
      !currentChats
        ? (lastIncomingMessages.data = getAllChats(
            lastIncomingMessages.data as MessageInterface[],
            lastOutgoingMessages.data as MessageInterface[]
          ))
        : (lastIncomingMessages.data = updateLastChats(
            currentChats as MessageInterface[],
            lastIncomingMessages.data as MessageInterface[],
            lastOutgoingMessages.data as MessageInterface[],
            getIsMiniVersion(type) ? 5 : undefined
          ));
    } else {
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
  tagTypes: [
    'lastMessages',
    'wabaTemplates',
    'waSettings',
    'groupData',
    'chatHistory',
    'avatar',
    'statuses',
  ],
});
