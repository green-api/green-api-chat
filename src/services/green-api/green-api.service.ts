import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '',
});

export const greenAPI = createApi({
  reducerPath: 'greenAPI',
  baseQuery: baseQuery,
  endpoints: () => ({}),
});
