import { CSSProperties } from 'react';

import {
  AudioOutlined,
  FileImageOutlined,
  FileOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Col, Row, Space, Typography, Image } from 'antd';
import parse from 'html-react-parser';

import { TextFormatter } from './text-formatter';
import DoubleTickIcon from 'assets/double-tick.svg?react';
import TickIcon from 'assets/tick.svg?react';
import {
  GetTemplateMessageLayoutOptions,
  LanguageLiteral,
  Renderable,
  StatusMessage,
  TypeMessage,
  WabaTemplateTypeEnum,
} from 'types';

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

export function getFormattedMessage(textMessage: string): Renderable {
  const formattedText = TextFormatter(textMessage);

  if (!formattedText) {
    return textMessage;
  }

  return parse(formattedText);
}

export function fillJsxString(string: string, data: (JSX.Element | string)[]) {
  const substringArray = string.split(/{\d}/);

  data = data.filter((_, index) => string.includes(`{${index}`));

  return (
    <span>
      {substringArray.map((substring, index) => {
        return (
          <span key={`${substring}${index}`}>
            {substring} {data[index] || ''}{' '}
          </span>
        );
      })}
    </span>
  );
}

export function fillTemplateString(string: string, data: string[]) {
  const substringArray = string.split(/{{\d}}/);

  data = data.filter((_, index) => string.includes(`{{${index + 1}}}`));

  return substringArray.map((substring, index) => `${substring}${data[index] || ''}`).join('');
}

export function numWord(
  count: number,
  words: Record<LanguageLiteral, string[]>,
  resolvedLanguage: LanguageLiteral
) {
  const val = Math.abs(count) % 100;
  const num = val % 10;

  if (val > 10 && val < 20) return words[resolvedLanguage][2];
  if (num > 1 && num < 5) return words[resolvedLanguage][1];
  if (num == 1) return words[resolvedLanguage][0];

  return words[resolvedLanguage][2];
}

export function getTemplateMessageLayout(options: GetTemplateMessageLayoutOptions) {
  const {
    containerClassName,
    header,
    content,
    footer,
    templateType,
    mediaUrl,
    buttons,
    time,
    symbol,
  } = options;

  return (
    <div
      style={{
        maxWidth: 500,
      }}
      className={containerClassName}
    >
      <Space direction="vertical">
        {templateType === WabaTemplateTypeEnum.Text && (
          <>
            {header && (
              <Typography.Paragraph style={{ fontSize: 16, margin: 0 }}>
                {header}
              </Typography.Paragraph>
            )}
          </>
        )}
        {templateType !== WabaTemplateTypeEnum.Text && <Image src={mediaUrl} alt="media" />}
        <Typography.Paragraph
          style={{ fontSize: 14, margin: 0 }}
          ellipsis={{ rows: 6, expandable: true, symbol: symbol }}
        >
          {content}
        </Typography.Paragraph>
      </Space>
      <Row wrap={false} gutter={[15, 15]} className="margin-top">
        {footer && (
          <Col>
            <Typography.Paragraph style={{ fontSize: 12, margin: 0, fontStyle: 'italic' }}>
              {footer}
            </Typography.Paragraph>
          </Col>
        )}
        <Col className="margin-left-auto margin-top-auto">
          <Space style={{ alignSelf: 'end' }}>
            <span style={{ fontSize: 12 }}>{time}</span>
          </Space>
        </Col>
      </Row>

      {buttons && buttons.length > 0 && (
        <Space direction="vertical">
          {buttons.map((button, idx) => (
            <Button key={`${button.value}-${idx}`} className="w-100">
              {button.text}
            </Button>
          ))}
        </Space>
      )}
    </div>
  );
}
