import { FC, useState } from 'react';

import { UserAddOutlined } from '@ant-design/icons';
import { Button, Flex, List, Modal, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';

import GroupContactListItem from './group-contact-list-item.component';
import { useAppSelector } from 'hooks';
import { useAddGroupParticipantMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';
import { isContactInfo } from 'utils';

const GroupContactList: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const instanceCredentials = useAppSelector(selectInstance);
  const { t } = useTranslation();

  const [addParticipant] = useAddGroupParticipantMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!activeChat.contactInfo || activeChat.contactInfo === 'Error: forbidden') {
    return null;
  }

  if (isContactInfo(activeChat.contactInfo)) {
    return null;
  }

  const showModal = () => setIsModalVisible(true);

  const handleModalOk = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length < 10) {
      message.error(t('ENTER_VALID_PHONE_NUMBER'));
      return;
    }

    const participantChatId = `${cleaned}@c.us`;

    try {
      await addParticipant({
        groupId: activeChat.chatId,
        participantChatId,
        ...instanceCredentials,
      });

      message.success(t('PARTICIPANT_ADDED'));
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

  return (
    <>
      <List
        className="group-contact-list p-10"
        dataSource={activeChat.contactInfo.participants}
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
          placeholder={t('ADD_PARTICIPANT_PLACEHOLDER')}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={15}
        />
      </Modal>
    </>
  );
};

export default GroupContactList;
