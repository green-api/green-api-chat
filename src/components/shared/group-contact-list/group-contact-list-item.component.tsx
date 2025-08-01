import { FC, useMemo } from 'react';

import { List, Skeleton, Tag } from 'antd';

import ParticipantMenu from './participant-menu.component';
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
}

const GroupContactListItem: FC<GroupContactListItemProps> = ({ participant }) => {
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

  const contactName =
    contactInfo?.contactName || contactInfo?.name || getPhoneNumberFromChatId(participant.id);

  const phoneNumber = getPhoneNumberFromChatId(participant.id);

  const avatar = useMemo<string>(() => {
    if (contactInfo?.avatar) {
      return contactInfo.avatar;
    }
    return emptyAvatar;
  }, [contactInfo]);

  return (
    <List.Item
      className="list-item"
      actions={[<ParticipantMenu key="participantMenu" participant={participant} />]}
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
