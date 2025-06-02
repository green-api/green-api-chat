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
      providesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }];
      },
    }),
    updateGroupName: builder.mutation<UpdateGroupNameResponseInterface, UpdateGroupNameInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/updateGroupName/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }, { type: 'chatHistory' }];
      },
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
      invalidatesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }];
      },
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
      invalidatesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }];
      },
    }),
    setGroupAdmin: builder.mutation<SetGroupAdminResponseInterface, SetGroupAdminInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/setGroupAdmin/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }];
      },
    }),
    removeAdmin: builder.mutation<RemoveGroupAdminResponseInterface, SetGroupAdminInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/removeAdmin/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }];
      },
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
      invalidatesTags: (result, error, { body }) => {
        const groupId = body.get('groupId');
        return [
          { type: 'avatar', id: typeof groupId === 'string' ? groupId : undefined },
          { type: 'groupData' },
        ];
      },
    }),
    leaveGroup: builder.mutation<RemoveGroupAdminResponseInterface, GroupBaseParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/leaveGroup/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { groupId }) => {
        return [{ type: 'groupData', id: groupId }];
      },
    }),
  }),
});
