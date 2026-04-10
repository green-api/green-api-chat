import { FC, memo, useMemo } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Flex, List, Popconfirm, Typography } from 'antd';

import { getContactDisplayName } from './contacts.helpers';
import emptyAvatar from 'assets/emptyAvatar.svg';
import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import AvatarImage from 'components/UI/avatar-image.component';
import { useGetAvatarQuery } from 'services/green-api/endpoints';
import { ContactListItemInterface, InstanceInterface } from 'types';
import { getPhoneNumberFromChatId } from 'utils';

type TranslateFn = (key: string) => string;

interface ContactsListItemProps {
  contact: ContactListItemInterface;
  instanceCredentials: InstanceInterface;
  isDeleteLoading: boolean;
  onEdit: (contact: ContactListItemInterface) => void;
  onDelete: (chatId: string) => void;
  t: TranslateFn;
}

const ContactsListItem: FC<ContactsListItemProps> = ({
  contact,
  instanceCredentials,
  isDeleteLoading,
  onEdit,
  onDelete,
  t,
}) => {
  const { data: avatarData } = useGetAvatarQuery(
    {
      ...instanceCredentials,
      chatId: contact.id,
    },
    {
      skip: !instanceCredentials?.idInstance || !instanceCredentials?.apiTokenInstance,
    }
  );

  const avatar = useMemo(() => {
    if (avatarData?.urlAvatar) {
      return avatarData.urlAvatar;
    }

    if (avatarData && !avatarData.available) {
      return emptyAvatar;
    }

    return emptyAvatarButAvailable;
  }, [avatarData]);

  const displayName = getContactDisplayName(contact);
  const phoneOrChatId = getPhoneNumberFromChatId(contact.id);
  const whatsappProfileName = contact.name && contact.name !== displayName ? contact.name : null;

  return (
    <List.Item
      className="contacts-section__list-item"
      actions={[
        <Flex key="actions" className="contacts-section__actions" align="center" gap={8}>
          <Button
            className="contacts-section__icon-btn"
            type="default"
            icon={<EditOutlined />}
            title={t('EDIT_CONTACT_ACTION')}
            aria-label={t('EDIT_CONTACT_ACTION')}
            onClick={() => onEdit(contact)}
          />

          <Popconfirm
            title={t('DELETE_CONTACT_CONFIRM_TITLE')}
            description={t('DELETE_CONTACT_CONFIRM_DESCRIPTION')}
            okText={t('YES')}
            cancelText={t('NO')}
            onConfirm={() => onDelete(contact.id)}
          >
            <Button
              className="contacts-section__icon-btn contacts-section__icon-btn--danger"
              type="default"
              danger
              icon={<DeleteOutlined />}
              title={t('DELETE_CONTACT_ACTION')}
              aria-label={t('DELETE_CONTACT_ACTION')}
              loading={isDeleteLoading}
            />
          </Popconfirm>
        </Flex>,
      ]}
    >
      <List.Item.Meta
        avatar={<AvatarImage src={avatar} size="large" fallbackSrc={emptyAvatarButAvailable} />}
        title={<span className="contacts-section__name">{displayName}</span>}
        description={
          <Flex vertical>
            <Typography.Text type="secondary" className="contacts-section__chat-id">
              {phoneOrChatId}
            </Typography.Text>
            {whatsappProfileName && (
              <Typography.Text type="secondary" className="contacts-section__chat-id">
                {whatsappProfileName}
              </Typography.Text>
            )}
          </Flex>
        }
      />
    </List.Item>
  );
};

export default memo(ContactsListItem);
