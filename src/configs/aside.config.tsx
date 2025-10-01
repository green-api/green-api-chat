import { SettingOutlined } from '@ant-design/icons';

import ChatIcon from 'assets/chat.svg?react';
import Chats from 'components/full-chat/user-side/chats/chats.component';
import Settings from 'components/full-chat/user-side/settings/settings.component';
import { SettingsSelect } from 'components/UI/select/select-settigs.component';
import { AsideItem, UserSideItem } from 'types';

export const asideTopIconItems: AsideItem[] = [
  { item: 'chats', title: 'CHATS_TITLE', icon: <ChatIcon /> },
  // { item: 'statuses', title: 'STATUSES', icon: <StatusIcon /> },
  // { item: 'calls', title: 'CALLS_TITLE', icon: <PhoneIcon /> },
];

export const asideBottomIconItems: AsideItem[] = [
  // { item: 'archive', title: 'ARCHIVE_TITLE', icon: <ArchiveIcon /> },
  {
    item: 'settings',
    title: 'SETTINGS_TITLE',
    icon: <SettingsSelect />,
  },
  { item: 'profile', title: 'PROFILE_TITLE', icon: <SettingOutlined width={20} height={20} /> },
];

export const USER_SIDE_ITEMS: UserSideItem[] = [
  { item: 'chats', element: <Chats /> },
  { item: 'instance', element: <Settings /> },
  { item: 'profile', element: <Settings /> },
  // { item: 'business', element: <Settings /> },
  { item: 'logout', element: <Settings /> },
];
