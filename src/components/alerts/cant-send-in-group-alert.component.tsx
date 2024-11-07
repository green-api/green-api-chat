import { FC } from 'react';

import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const CantSendInGroupAlert: FC = () => {
  const { t } = useTranslation();

  return (
    <Flex align="center" justify="center" className="chat-form-container text-center p-10">
      <Typography.Paragraph style={{ margin: 'initial' }}>
        {t('CANT_SEND_IN_GROUP')}
      </Typography.Paragraph>
    </Flex>
  );
};

export default CantSendInGroupAlert;
