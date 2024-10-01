import { CommentOutlined, SettingOutlined } from '@ant-design/icons';

import Chats from 'components/full-chat/user-side/chats/chats.component';
import Settings from 'components/full-chat/user-side/settings/settings.component';
import { AsideItem, UserSideItem } from 'types';

export const asideTopIconItems: AsideItem[] = [
  { item: 'chats', title: 'CHATS_TITLE', icon: <CommentOutlined /> },
];

export const asideBottomIconItems: AsideItem[] = [
  { item: 'profile', title: 'PROFILE_TITLE', icon: <SettingOutlined /> },
];

export const USER_SIDE_ITEMS: UserSideItem[] = [
  { item: 'chats', element: <Chats /> },
  { item: 'settings', element: <Settings /> },
];
