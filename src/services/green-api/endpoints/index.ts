import { accountGreenApiEndpoints } from './account.green-api.endpoints';
import { groupGreenApiEndpoints } from './group.green-api.endpoints';
import { journalsGreenApiEndpoints } from './journals.green-api.endpoints';
import { persistedMethods } from './persisted-methods.green-api.endpoints';
import { receivingGreenApiEndpoints } from './receiving.green-api.endpoints';
import { sendingGreenApiEndpoints } from './sending.green-api.endpoints';
import { serviceMethodsGreenApiEndpoints } from './service-methods.green-api.endpoints';
import { statusesGreenApiEndpoints } from './statuses.green-api.endpoint';
import { wabaGreenApiEndpoints } from './waba.green-api.endpoints';

export const {
  useSendMessageMutation,
  useGetChatHistoryQuery,
  useGetContactInfoQuery,
  useLazyGetGroupDataQuery,
  useLazyGetContactInfoQuery,
  useCheckWhatsappMutation,
  useLastMessagesQuery,
  useSendFileByUploadMutation,
  useSendContactMutation,
  useSendLocationMutation,
  useSendPollMutation,
  useGetWaSettingsQuery,
  useSendTemplateMutation,
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useUploadFileMutation,
  useUpdateGroupNameMutation,
  useAddGroupParticipantMutation,
  useRemoveParticipantMutation,
  useSetGroupAdminMutation,
  useRemoveAdminMutation,
  useSetGroupPictureMutation,
  useLeaveGroupMutation,
  useSendInteractiveButtonsMutation,
  useSendInteractiveButtonsReplyMutation,
  useSendTextStatusMutation,
  useSendVoiceStatusMutation,
  useSendMediaStatusMutation,
  useGetAccountSettingsQuery,
  useGetAuthorizationCodeMutation,
  useLazyLastMessagesQuery,
  useLogoutMutation,
  useLazyGetStateInstanceQuery,
  useDownloadFileMutation,
  useStartAuthorizationMutation,
  useSendAuthorizationCodeMutation,
  useGetGroupDataQuery,
  useGetAvatarQuery,
  useLazyGetAvatarQuery,
} = {
  ...accountGreenApiEndpoints,
  ...sendingGreenApiEndpoints,
  ...receivingGreenApiEndpoints,
  ...journalsGreenApiEndpoints,
  ...groupGreenApiEndpoints,
  ...serviceMethodsGreenApiEndpoints,
  ...wabaGreenApiEndpoints,
  ...statusesGreenApiEndpoints,
  ...persistedMethods,
};
