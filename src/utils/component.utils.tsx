import { CSSProperties } from 'react';

import {
  AudioOutlined,
  FileImageOutlined,
  FileOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import parse from 'html-react-parser';

import { TextFormatter } from './text-formatter';
import DoubleTickIcon from 'assets/double-tick.svg?react';
import TickIcon from 'assets/tick.svg?react';
import { StatusMessage, TypeMessage } from 'types';

export function getOutgoingStatusMessageIcon(
  statusMessage?: StatusMessage,
  styles?: CSSProperties
) {
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
}

export function getMessageTypeIcon(typeMessage: TypeMessage, downloadUrl?: string) {
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
}

export function getFormattedMessage(textMessage: string) {
  const formattedText = TextFormatter(textMessage);

  if (!formattedText) {
    return textMessage;
  }

  return parse(formattedText);
}
