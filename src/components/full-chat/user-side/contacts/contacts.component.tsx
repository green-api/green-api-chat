import { FC } from 'react';

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ContactsList from './contacts-list.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetContactsQuery } from 'services/green-api/endpoints';
import { selectInstance, selectTypeInstance } from 'store/slices/instances.slice';

const Contacts: FC = () => {
  const { t } = useTranslation();

  const instanceCredentials = useAppSelector(selectInstance);
  const typeInstance = useAppSelector(selectTypeInstance);
  const isWhatsApp = typeInstance === 'whatsapp';
  const isTelegram = typeInstance === 'telegram';

  const { openAddContactModal } = useActions();

  const skipGetContactsQuery =
    !instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance || isTelegram;

  const {
    isLoading: isContactsLoading,
    isFetching: isContactsFetching,
    refetch,
  } = useGetContactsQuery(
    {
      ...instanceCredentials,
      group: isWhatsApp ? false : undefined,
    },
    {
      skip: skipGetContactsQuery,
    }
  );

  if (!instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance) {
    return (
      <Empty
        className="empty p-10"
        description={t('SELECT_INSTANCE_PLACEHOLDER')}
        style={{ marginTop: 40 }}
      />
    );
  }

  if (isTelegram) {
    return (
      <Empty
        className="empty p-10"
        description={t('CONTACTS_UNAVAILABLE_TELEGRAM')}
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <Flex className="contacts-section" vertical>
      <Flex className="contacts-section__header" align="center" justify="space-between" gap={8}>
        <Typography.Title level={2} className="contacts-section__title">
          {t('CONTACTS')}
        </Typography.Title>
        <Flex align="center" gap={8}>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isContactsFetching && !isContactsLoading}
            title={t('REFRESH_PAGE')}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddContactModal()}>
            {t('ADD_CONTACT')}
          </Button>
        </Flex>
      </Flex>
      <ContactsList />
    </Flex>
  );
};

export default Contacts;
