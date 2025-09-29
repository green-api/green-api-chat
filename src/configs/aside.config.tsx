import { Dropdown } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import ArchiveIcon from 'assets/archive.svg?react';
import ChatIcon from 'assets/chat.svg?react';
import PhoneIcon from 'assets/phone.svg?react';
import StatusIcon from 'assets/status.svg?react';
import Chats from 'components/full-chat/user-side/chats/chats.component';
import Settings from 'components/full-chat/user-side/settings/settings.component';
import { AsideItem, UserSideItem } from 'types';
import { SettingsSelect } from 'components/UI/select/select-settigs.component';

export const asideTopIconItems: AsideItem[] = [
  { item: 'chats', title: 'CHATS_TITLE', icon: <ChatIcon /> },
  { item: 'statuses', title: 'STATUSES', icon: <StatusIcon /> },
  { item: 'calls', title: 'CALLS_TITLE', icon: <PhoneIcon /> },
];

export const asideBottomIconItems: AsideItem[] = [
  { item: 'archive', title: 'ARCHIVE_TITLE', icon: <ArchiveIcon /> },
  {
    item: 'settings',
    title: 'SETTINGS_TITLE',
    icon: <SettingsSelect />,
  },
  { item: 'profile', title: 'PROFILE_TITLE', icon: <SettingOutlined /> },
];

export const USER_SIDE_ITEMS: UserSideItem[] = [
  { item: 'chats', element: <Chats /> },
  { item: 'instance', element: <Settings /> },
  { item: 'profile', element: <Settings /> },
  { item: 'business', element: <Settings /> },
  { item: 'logout', element: <Settings /> },
];
