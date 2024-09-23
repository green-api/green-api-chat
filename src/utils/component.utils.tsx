import { CSSProperties } from 'react';

import {
  AudioOutlined,
  FileImageOutlined,
  FileOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import DoubleTickIcon from 'assets/double-tick.svg?react';
import TickIcon from 'assets/tick.svg?react';
import { StatusMessage, TypeMessage } from 'types';

export const getOutgoingStatusMessageIcon = (
  statusMessage?: StatusMessage,
  styles?: CSSProperties
) => {
  switch (statusMessage) {
    case 'sent':
      return <TickIcon style={{ ...styles, color: '#8696a0' }} />;

    case 'delivered':
      return <DoubleTickIcon style={{ ...styles, color: '#8696a0' }} />;

    case 'read':
      return <DoubleTickIcon style={{ ...styles, color: 'var(--light-primary-color)' }} />;

    default:
      return null;
  }
};

export const getMessageTypeIcon = (typeMessage: TypeMessage, downloadUrl?: string) => {
  let messageTypeIcon: JSX.Element | null = null;

  switch (typeMessage) {
    case 'imageMessage':
      messageTypeIcon = <FileImageOutlined />;
      break;

    case 'audioMessage':
      messageTypeIcon = <AudioOutlined />;
      break;

    case 'videoMessage':
      messageTypeIcon = <VideoCameraOutlined />;
      break;

    case 'documentMessage':
      messageTypeIcon = <FileOutlined />;
      break;

    case 'locationMessage':
      messageTypeIcon = <FileOutlined />;
      break;

    case 'contactMessage':
      messageTypeIcon = <UserOutlined />;
      break;

    default:
      break;
  }

  if (!messageTypeIcon) {
    return null;
  }

  if (!downloadUrl) {
    return messageTypeIcon;
  }

  return (
    <a href={downloadUrl} target="_blank" rel="noreferrer">
      {messageTypeIcon}
    </a>
  );
};
