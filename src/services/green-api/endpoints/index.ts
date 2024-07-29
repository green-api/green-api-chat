import { journalsGreenApiEndpoints } from './journals.green-api.endpoints';
import { receivingGreenApiEndpoints } from './receiving.green-api.endpoints';
import { sendingGreenApiEndpoints } from './sending.green-api.endpoints';

export const {
  useSendMessageMutation,
  useReceiveNotificationMutation,
  useDeleteNotificationMutation,
  useGetChatHistoryQuery,
} = {
  ...sendingGreenApiEndpoints,
  ...receivingGreenApiEndpoints,
  ...journalsGreenApiEndpoints,
};
