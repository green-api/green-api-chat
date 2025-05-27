import { greenAPI } from 'services/green-api/green-api.service';
import {
  AddGroupParticipantResponseInterface,
  GetGroupDataResponseInterface,
  GroupBaseParametersInterface,
  UpdateGroupNameInterface,
  UpdateGroupNameResponseInterface,
  GroupParticipantApiInterface,
  RemoveGroupParticipantResponseInterface,
  SetGroupAdminInterface,
  SetGroupAdminResponseInterface,
  RemoveGroupAdminResponseInterface,
  SetGroupPictureResponseInterface,
} from 'types';

export const groupGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getGroupData: builder.query<GetGroupDataResponseInterface, GroupBaseParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getGroupData/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      keepUnusedDataFor: 1000,
      providesTags: [{ type: 'groupData' }],
    }),
    updateGroupName: builder.mutation<UpdateGroupNameResponseInterface, UpdateGroupNameInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/updateGroupName/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }, { type: 'chatHistory' }],
    }),
    addGroupParticipant: builder.mutation<
      AddGroupParticipantResponseInterface,
      GroupParticipantApiInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/addGroupParticipant/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }],
    }),
    removeParticipant: builder.mutation<
      RemoveGroupParticipantResponseInterface,
      GroupParticipantApiInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/removeGroupParticipant/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }],
    }),
    setGroupAdmin: builder.mutation<SetGroupAdminResponseInterface, SetGroupAdminInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/setGroupAdmin/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }],
    }),
    removeAdmin: builder.mutation<RemoveGroupAdminResponseInterface, SetGroupAdminInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/removeAdmin/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }],
    }),
    setGroupPicture: builder.mutation<
      SetGroupPictureResponseInterface,
      {
        idInstance: string;
        apiTokenInstance: string;
        apiUrl: string;
        body: FormData;
      }
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, body }) => ({
        url: `${apiUrl}waInstance${idInstance}/setGroupPicture/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }],
    }),
    leaveGroup: builder.mutation<RemoveGroupAdminResponseInterface, GroupBaseParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/leaveGroup/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'groupData' }],
    }),
  }),
});
