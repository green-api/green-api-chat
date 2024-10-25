import { FC, useMemo } from 'react';

import { Col, Row, Space, Typography } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';

import { getFormattedMessage } from '../../../utils';
import { ParsedWabaTemplateInterface, WabaTemplateInterface, WabaTemplateTypeEnum } from 'types';

interface MessagePreviewProps {
  template: WabaTemplateInterface;
}

const MessagePreview: FC<MessagePreviewProps> = ({ template }) => {
  const form = useFormInstance();

  const parsedTemplateData = JSON.parse(template.containerMeta) as ParsedWabaTemplateInterface;

  const params = useWatch('params', form);
  console.log(params);

  const templateType = template.templateType;
  const content = getFormattedMessage(parsedTemplateData.data);
  const header = getFormattedMessage(parsedTemplateData.header);
  const footer = getFormattedMessage(parsedTemplateData.footer);
  const mediaUrl = parsedTemplateData.mediaUrl;
  const buttons = parsedTemplateData.buttons;

  const time = useMemo(() => {
    const date = new Date();

    return `0${date.getHours()}`.slice(-2) + ':' + `0${date.getMinutes()}`.slice(-2);
  }, []);

  return (
    <div
      style={{
        maxWidth: 500,
      }}
      className="messagePreview incoming"
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
        {templateType !== WabaTemplateTypeEnum.Text && (
          <img className="messagePreview__image" src={mediaUrl} alt="media" />
        )}
        <Typography.Paragraph style={{ fontSize: 16, margin: 0 }}>{content}</Typography.Paragraph>
      </Space>
      <Row wrap={false} gutter={[15, 15]} className="margin-top">
        {footer && (
          <Col>
            <Typography.Paragraph style={{ fontSize: 14, margin: 0, fontStyle: 'italic' }}>
              {footer}
            </Typography.Paragraph>
          </Col>
        )}
        <Col className="margin-left-auto margin-top-auto">
          <Space style={{ alignSelf: 'end' }}>
            <span style={{ fontSize: 14 }}>{time}</span>
          </Space>
        </Col>
      </Row>

      {buttons && buttons.length > 0 && (
        <Row>
          {buttons.map((button: { text?: string }) => (
            <Col key={button?.text} span={24} className="messagePreview__button">
              {button?.text}
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MessagePreview;
