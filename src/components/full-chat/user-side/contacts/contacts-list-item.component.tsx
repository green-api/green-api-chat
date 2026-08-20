import { FC, memo, useMemo } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Flex, List, message, Popconfirm, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { getContactApiErrorDetails, getContactDisplayName } from './contacts.helpers';
import emptyAvatar from 'assets/emptyAvatar.svg';
import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import AvatarImage from 'components/UI/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useDeleteContactMutation, useGetAvatarQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { ContactListItemInterface } from 'types';
import { getPhoneNumberFromChatId, isBotChatType } from 'utils';

interface ContactsListItemProps {
  contact: ContactListItemInterface;
}

const ContactsListItem: FC<ContactsListItemProps> = ({ contact }) => {
  const { t } = useTranslation();

  const instanceCredentials = useAppSelector(selectInstance);
  const isMax = useIsMaxInstance();
  const { openEditContactModal } = useActions();
  const [deleteContact, { isLoading: isDeleteLoading }] = useDeleteContactMutation();

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
  const phoneOrChatId = isMax
    ? contact.phoneNumber || contact.id
    : getPhoneNumberFromChatId(contact.id);
  const profileName = contact.name && contact.name !== displayName ? contact.name : null;
  const isBotContact = isBotChatType(contact.type);

  const handleDelete = async () => {
    const response = await deleteContact({
      ...instanceCredentials,
      chatId: contact.id,
    });

    if (response.error) {
      const errorDetails = getContactApiErrorDetails(response.error, t);
      message.error(errorDetails.message);

      return;
    }

    message.success(t('CONTACT_DELETED_SUCCESS'));
  };

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
            onClick={() => openEditContactModal(contact)}
          />

          <Popconfirm
            title={t('DELETE_CONTACT_CONFIRM_TITLE')}
            description={t('DELETE_CONTACT_CONFIRM_DESCRIPTION')}
            okText={t('YES')}
            cancelText={t('NO')}
            onConfirm={handleDelete}
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
        title={
          <Flex vertical gap={0}>
            <span className="contacts-section__name">{displayName}</span>
            {isBotContact && (
              <Typography.Text type="secondary" className="contacts-section__chat-id">
                {t('BOT_LABEL')}
              </Typography.Text>
            )}
          </Flex>
        }
        description={
          <Flex vertical>
            <Typography.Text type="secondary" className="contacts-section__chat-id">
              {phoneOrChatId}
            </Typography.Text>
            {profileName && (
              <Typography.Text type="secondary" className="contacts-section__chat-id">
                {profileName}
              </Typography.Text>
            )}
          </Flex>
        }
      />
    </List.Item>
  );
};

export default memo(ContactsListItem);
