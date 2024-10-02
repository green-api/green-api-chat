import { themeActions } from '../slices/theme.slice';
import { chatActions } from 'store/slices/chat.slice';
import { instancesActions } from 'store/slices/instances.slice';
import { userActions } from 'store/slices/user.slice';
export const actionCreators = {
  ...userActions,
  ...chatActions,
  ...instancesActions,
  ...themeActions,
};
