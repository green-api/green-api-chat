import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { RootState } from 'store';
import { InstanceInterface, MessageInterface } from 'types';
import { getGreenApiUrls, getLastFiveChats, updateLastChats } from 'utils';

const baseQuery = fetchBaseQuery({
  baseUrl: '',
});

const customQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (api.endpoint !== 'lastMessages') {
    return baseQuery(args, api, extraOptions);
  }

  const state = api.getState() as RootState;
  const key = Object.keys(state.greenAPI.queries).find((key) =>
    key.includes('lastMessages')
  ) as keyof typeof state.greenAPI.queries;
  const currentChats = state.greenAPI.queries[key]?.data;

  let minutes = 3;

  if (!currentChats) {
    minutes = 1440;
  }

  const { idInstance, apiTokenInstance } = (args as FetchArgs).params as InstanceInterface;

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
      ? getLastFiveChats(
          lastIncomingMessages.data as MessageInterface[],
          lastOutgoingMessages.data as MessageInterface[]
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
});
