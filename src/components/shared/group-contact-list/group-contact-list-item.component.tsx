import { FC, useMemo } from 'react';

import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, List, Menu, Skeleton, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatar from 'assets/emptyAvatarButAvailable.svg';
import AvatarImage from 'components/UI/avatar-image.component';
import { useAppSelector } from 'hooks';
import { useGetContactInfoQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { selectTheme } from 'store/slices/theme.slice';
import { GroupParticipantInterface, Themes } from 'types';
import { getPhoneNumberFromChatId } from 'utils';

interface GroupContactListItemProps {
  participant: GroupParticipantInterface;
  onRemove: (participantChatId: string) => void;
  onSetAdmin: (participantChatId: string) => void;
  onRemoveAdmin: (participantChatId: string) => void;
}

const GroupContactListItem: FC<GroupContactListItemProps> = ({
  participant,
  onRemove,
  onSetAdmin,
  onRemoveAdmin,
}) => {
  const instanceCredentials = useAppSelector(selectInstance);
  const theme = useAppSelector(selectTheme);

  const {
    data: contactInfo,
    isLoading,
    isFetching,
  } = useGetContactInfoQuery({
    ...instanceCredentials,
    chatId: participant.id,
  });

  const { t } = useTranslation();

  const contactName =
    contactInfo?.contactName || contactInfo?.name || getPhoneNumberFromChatId(participant.id);

  const phoneNumber = getPhoneNumberFromChatId(participant.id);

  const avatar = useMemo<string>(() => {
    if (contactInfo?.avatar) {
      return contactInfo.avatar;
    }
    return emptyAvatar;
  }, [contactInfo]);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'remove') {
      onRemove(participant.id);
    } else if (key === 'setAdmin') {
      onSetAdmin(participant.id);
    } else if (key === 'removeAdmin') {
      onRemoveAdmin(participant.id);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {!participant.isAdmin && !participant.isSuperAdmin && (
        <Menu.Item key="setAdmin">{t('ASSIGN_ADMIN')}</Menu.Item>
      )}
      {participant.isAdmin && !participant.isSuperAdmin && (
        <Menu.Item key="removeAdmin">{t('REMOVE_ADMIN')}</Menu.Item>
      )}
      <Menu.Item key="remove" danger>
        {t('DELETE_PARTICIPANT')}
      </Menu.Item>
    </Menu>
  );

  return (
    <List.Item
      className="list-item"
      actions={[
        <Dropdown overlay={menu} key="actions">
          <MoreOutlined style={{ fontSize: 18 }} />
        </Dropdown>,
      ]}
    >
      <Skeleton avatar title={false} loading={isLoading || isFetching} active>
        <List.Item.Meta
          avatar={<AvatarImage src={avatar} size="large" />}
          title={
            <h6
              className="text-overflow message-signerData"
              style={{ fontSize: 14, maxWidth: 280, width: '100%' }}
            >
              {contactName}
            </h6>
          }
          description={contactName === phoneNumber ? null : phoneNumber}
        />
        {(participant.isSuperAdmin || participant.isAdmin) && (
          <Tag color="green" className={theme === Themes.Dark ? 'group-admin-tag' : ''}>
            Group admin
          </Tag>
        )}
      </Skeleton>
    </List.Item>
  );
};

export default GroupContactListItem;
