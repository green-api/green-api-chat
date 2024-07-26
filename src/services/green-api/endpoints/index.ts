import { receivingGreenApiEndpoints } from './receiving.green-api.endpoints';
import { sendingGreenApiEndpoints } from './sending.green-api.endpoints';

export const {
  useSendMessageMutation,
  useReceiveNotificationMutation,
  useDeleteNotificationMutation,
} = {
  ...sendingGreenApiEndpoints,
  ...receivingGreenApiEndpoints,
};
