import { CSSProperties } from 'react';

import {
  ArrowLeftOutlined,
  AudioOutlined,
  FileImageOutlined,
  FileOutlined,
  GlobalOutlined,
  PhoneOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Col, Row, Space, Typography, Image, Flex } from 'antd';
import OTP from 'antd/es/input/OTP';
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
} from 'types';

const INTERACTIVE_BUTTON_ICONS = {
  PHONE_NUMBER: <PhoneOutlined style={{ fontSize: 24 }} />,
  COPY_CODE: <FileOutlined style={{ fontSize: 24 }} />,
  URL: <GlobalOutlined style={{ fontSize: 24 }} />,
  QUICK_REPLY: <ArrowLeftOutlined style={{ fontSize: 24 }} />,
  OTP: <OTP style={{ fontSize: 24 }} />,
} as const;

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
  const { containerClassName, header, content, footer, mediaUrl, buttons, symbol, type, time } =
    options;

  if (!containerClassName) {
    return (
      <>
        <Space direction="vertical">
          {header && (
            <Typography.Paragraph
              style={{ fontSize: 16, margin: 0 }}
              className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
            >
              {header}
            </Typography.Paragraph>
          )}
          {mediaUrl && <Image width={300} loading="lazy" src={mediaUrl} alt="media" />}
          <Typography.Paragraph
            style={{ fontSize: 14, margin: 0 }}
            ellipsis={{ rows: 6, expandable: true, symbol: symbol }}
            className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
          >
            {content}
          </Typography.Paragraph>
        </Space>
        <Row wrap={false} gutter={[15, 15]} className="margin-top">
          {footer && (
            <Col>
              <Typography.Paragraph
                className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
                style={{ fontSize: 13, margin: 0, fontStyle: 'italic' }}
              >
                {footer}
              </Typography.Paragraph>
            </Col>
          )}
        </Row>

        {buttons && buttons.length > 0 && (
          <Space direction="vertical">
            {buttons.map((button, idx) => (
              <Button
                key={`${button.value}-${idx}`}
                className="w-100"
                style={{ textWrap: 'wrap', padding: 4, height: 'auto' }}
              >
                {button.text}
              </Button>
            ))}
          </Space>
        )}
      </>
    );
  }

  return (
    <div
      style={{
        maxWidth: 300,
      }}
      className={containerClassName}
    >
      <Space direction="vertical">
        {header && (
          <Typography.Paragraph style={{ fontSize: 16, margin: 0 }}>{header}</Typography.Paragraph>
        )}
        {mediaUrl && <Image src={mediaUrl} loading="lazy" alt="media" />}
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
            <Typography.Paragraph style={{ fontSize: 13, margin: 0, fontStyle: 'italic' }}>
              {footer}
            </Typography.Paragraph>
          </Col>
        )}
        {time && (
          <Col className="margin-left-auto margin-top-auto">
            <Space>
              <span style={{ fontSize: 12 }}>{time}</span>
            </Space>
          </Col>
        )}
      </Row>
      {buttons && buttons.length > 0 && (
        <Space direction="vertical">
          {buttons.map((button, idx) => (
            <Button key={`${button.value}-${idx}`} className="w-100">
              <div>{button.text}</div>
            </Button>
          ))}
        </Space>
      )}
    </div>
  );
}

export function getInteractiveButtonsMessageLayout(options: GetTemplateMessageLayoutOptions) {
  const { containerClassName, header, content, footer, mediaUrl, buttons, symbol, type, time } =
    options;

  if (!containerClassName) {
    return (
      <div
        style={{
          maxWidth: 300,
        }}
      >
        <>
          {header && (
            <Typography.Paragraph
              style={{ fontSize: 16, margin: 0 }}
              className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full w-100 interactiveButtonsBody `}
            >
              {header}
            </Typography.Paragraph>
          )}
          {mediaUrl && <Image width={300} loading="lazy" src={mediaUrl} alt="media" />}
          <Typography.Paragraph
            style={{ fontSize: 14, margin: 0 }}
            ellipsis={{ rows: 6, expandable: true, symbol: symbol }}
            className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full w-100 interactiveButtonsBody`}
          >
            {content}
          </Typography.Paragraph>
        </>
        <Row wrap={false} gutter={[5, 5]} className="interactiveButtonsBody">
          {footer && (
            <Col>
              <Typography.Paragraph
                className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
                style={{ fontSize: 13, margin: 0, fontStyle: 'italic' }}
              >
                {footer}
              </Typography.Paragraph>
            </Col>
          )}
        </Row>

        {buttons && buttons.length > 0 && (
          <Flex vertical gap={0}>
            {buttons.map((button, idx) => (
              <Button
                variant="outlined"
                key={`${button.value}-${idx}`}
                className="w-100"
                style={{
                  padding: 14,
                  borderRadius: 0,
                  height: 50,
                  width: '300px',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'transparent',
                  borderRight: '0px',
                  borderLeft: '0px',
                  borderTop: idx === 0 ? undefined : '0px',
                }}
              >
                {INTERACTIVE_BUTTON_ICONS[button.type] || null}
                <div style={{ width: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {button.text}
                </div>
              </Button>
            ))}
          </Flex>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 300,
      }}
      className={containerClassName}
    >
      <Space direction="vertical">
        {header && (
          <Typography.Paragraph style={{ fontSize: 16, margin: 0 }}>{header}</Typography.Paragraph>
        )}
        {mediaUrl && <Image src={mediaUrl} loading="lazy" alt="media" />}
        <Typography.Paragraph
          style={{ fontSize: 14, margin: 0 }}
          ellipsis={{ rows: 6, expandable: true, symbol: symbol }}
        >
          {content}
        </Typography.Paragraph>
      </Space>
      <Row wrap={false} gutter={[5, 5]}>
        {footer && (
          <Col>
            <Typography.Paragraph style={{ fontSize: 13, margin: 0, fontStyle: 'italic' }}>
              {footer}
            </Typography.Paragraph>
          </Col>
        )}
        {time && (
          <Col className="margin-left-auto margin-top-auto">
            <Space>
              <span style={{ fontSize: 12 }}>{time}</span>
            </Space>
          </Col>
        )}
      </Row>
      {buttons && buttons.length > 0 && (
        <Space direction="vertical">
          {buttons.map((button, idx) => (
            <Button key={`${button.value}-${idx}`} className="w-100">
              <div>{button.text}</div>
            </Button>
          ))}
        </Space>
      )}
    </div>
  );
}
