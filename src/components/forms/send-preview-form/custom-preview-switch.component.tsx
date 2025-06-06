import { FC } from 'react';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Switch, Tooltip, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { formItemDefaultLayout } from 'configs';

const CustomPreviewSwitch: FC = () => {
  const { t } = useTranslation();

  return (
    <Form.Item {...formItemDefaultLayout} name="isCustomPreview" label={t('CUSTOM_PREVIEW')}>
      <Flex gap={8}>
        <Form.Item name="isCustomPreview" noStyle valuePropName="checked">
          <Switch />
        </Form.Item>
        <Tooltip
          title={t('CUSTOM_PREVIEW_TOOLTIP')}
          placement="right"
          overlayStyle={{ maxWidth: 250 }}
        >
          <InfoCircleOutlined style={{ cursor: 'pointer' }} />
        </Tooltip>
      </Flex>
    </Form.Item>
  );
};

export default CustomPreviewSwitch;
