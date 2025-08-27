import { SettingOutlined } from '@ant-design/icons';

import ArchiveIcon from 'assets/archive.svg?react';
import ChatIcon from 'assets/chat.svg?react';
import PhoneIcon from 'assets/phone.svg?react';
import SettignsIcon from 'assets/settings.svg?react';
import StatusIcon from 'assets/status.svg?react';
import Chats from 'components/full-chat/user-side/chats/chats.component';
import Settings from 'components/full-chat/user-side/settings/settings.component';
import { AsideItem, UserSideItem } from 'types';

export const asideTopIconItems: AsideItem[] = [
  { item: 'chats', title: 'CHATS_TITLE', icon: <ChatIcon /> },
  { item: 'statuses', title: 'STATUSES', icon: <StatusIcon /> },
  { item: 'calls', title: 'CALLS_TITLE', icon: <PhoneIcon /> },
];

export const asideBottomIconItems: AsideItem[] = [
  { item: 'archive', title: 'ARCHIVE_TITLE', icon: <ArchiveIcon /> },
  { item: 'settings', title: 'SETTINGS_TITLE', icon: <SettignsIcon /> },
  { item: 'profile', title: 'PROFILE_TITLE', icon: <SettingOutlined /> },
];

export const USER_SIDE_ITEMS: UserSideItem[] = [
  { item: 'chats', element: <Chats /> },
  { item: 'settings', element: <Settings /> },
];
