import { chatActions } from 'store/slices/chat.slice';
import { userActions } from 'store/slices/user.slice';
export const actionCreators = {
  ...userActions,
  ...chatActions,
};
