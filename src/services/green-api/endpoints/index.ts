import { accountGreenApiEndpoints } from './account.green-api.endpoints';
import { groupGreenApiEndpoints } from './group.green-api.endpoints';
import { journalsGreenApiEndpoints } from './journals.green-api.endpoints';
import { receivingGreenApiEndpoints } from './receiving.green-api.endpoints';
import { sendingGreenApiEndpoints } from './sending.green-api.endpoints';
import { serviceMethodsGreenApiEndpoints } from './service-methods.green-api.endpoints';

export const {
  useSendMessageMutation,
  useReceiveNotificationQuery,
  useDeleteNotificationMutation,
  useGetChatHistoryQuery,
  useLastIncomingMessagesQuery,
  useLastOutgoingMessagesQuery,
  useLazyGetGroupDataQuery,
  useGetGroupDataQuery,
  useGetContactInfoQuery,
  useCheckWhatsappMutation,
  useGetAvatarQuery,
  useLastMessagesQuery,
  useSendFileByUploadMutation,
  useSendContactMutation,
  useSendLocationMutation,
  useSendPollMutation,
  useLazyGetStateInstanceQuery,
  useGetWaSettingsQuery,
} = {
  ...accountGreenApiEndpoints,
  ...sendingGreenApiEndpoints,
  ...receivingGreenApiEndpoints,
  ...journalsGreenApiEndpoints,
  ...groupGreenApiEndpoints,
  ...serviceMethodsGreenApiEndpoints,
};
