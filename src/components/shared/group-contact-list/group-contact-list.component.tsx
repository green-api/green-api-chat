import { FC, useState } from 'react';

import { UserAddOutlined } from '@ant-design/icons';
import { Button, Flex, List, Modal, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';

import GroupContactListItem from './group-contact-list-item.component';
import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useAddGroupParticipantMutation, useGetGroupDataQuery } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, GroupParticipantInterface } from 'types';
import { isContactInfo } from 'utils';

const GroupContactList: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const instanceCredentials = useAppSelector(selectInstance);
  const { t } = useTranslation();
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();

  const { data: groupData } = useGetGroupDataQuery(
    {
      ...instanceCredentials,
      ...(isMax || isTelegram ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
    },
    {
      skip:
        !activeChat?.chatId ||
        !instanceCredentials?.idInstance ||
        !instanceCredentials?.apiTokenInstance ||
        !isTelegram,
    }
  );

  const [addParticipant] = useAddGroupParticipantMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isTelegram) {
    if (!activeChat.contactInfo || typeof activeChat.contactInfo === 'string') {
      return null;
    }

    if (isContactInfo(activeChat.contactInfo, isMax)) {
      return null;
    }
  }

  const showModal = () => setIsModalVisible(true);

  const handleModalOk = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length < 7) {
      message.error(t('ENTER_VALID_PHONE_NUMBER'));
      return;
    }

    const participantChatId = `${cleaned}${isMax ? '' : '@c.us'}`;

    try {
      const res = await addParticipant({
        ...(isMax || isTelegram ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        participantChatId,
        ...instanceCredentials,
      });

      if (!!res.data?.addParticipant) {
        message.success(t('PARTICIPANT_ADDED'));
      }
      if (!res.data?.addParticipant) {
        message.error(t('ERROR_ADDING_PARTICIPANT'));
      }

      setIsModalVisible(false);
      setPhoneNumber('');
    } catch {
      message.error(t('ERROR_ADDING_PARTICIPANT'));
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPhoneNumber('');
  };

  const getParticipantsFromData = (data: unknown): GroupParticipantInterface[] => {
    if (data && typeof data === 'object' && 'participants' in data) {
      return data.participants as GroupParticipantInterface[];
    }
    return [];
  };

  const participants = isTelegram
    ? getParticipantsFromData(groupData)
    : getParticipantsFromData(activeChat.contactInfo);

  if (participants.length === 0) {
    return null;
  }

  return (
    <>
      <List<GroupParticipantInterface>
        className="group-contact-list p-10"
        dataSource={participants}
        pagination={{
          pageSize: 4,
          showLessItems: true,
          showSizeChanger: false,
        }}
        renderItem={(participant) => <GroupContactListItem participant={participant} />}
        footer={
          <Flex justify="space-between" align="center">
            <Button icon={<UserAddOutlined />} type="primary" onClick={showModal}>
              {t('ADD')}
            </Button>
          </Flex>
        }
      />
      <Modal
        title={t('ADD_PARTICIPANT')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('ADD')}
        cancelText={t('CANCEL')}
      >
        <Input
          placeholder={isMax ? '10000000' : t('ADD_PARTICIPANT_PLACEHOLDER')}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={15}
        />
      </Modal>
    </>
  );
};

export default GroupContactList;
