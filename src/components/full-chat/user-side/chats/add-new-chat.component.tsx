import { FC, useCallback } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Row } from 'antd';
import { useTranslation } from 'react-i18next';

import NewChatForm from 'components/forms/new-chat-form.component';
import { GlobalModalPropertiesInterface } from 'types';

const AddNewChat: FC<GlobalModalPropertiesInterface> = ({ isVisible, setIsVisible }) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir(i18n.resolvedLanguage);

  const onSubmitCb = useCallback(() => setIsVisible(false), []);

  return (
    <div className={`add-new-chat-menu ${dir === 'rtl' ? 'rtl' : ''} ${isVisible ? 'active' : ''}`}>
      <Row justify="space-between" className="p-10">
        <h3>{t('ADD_NEW_CHAT_HEADER')}</h3>
        <a>
          <CloseOutlined onClick={() => setIsVisible(false)} />
        </a>
      </Row>
      <NewChatForm onSubmitCallback={onSubmitCb} />
    </div>
  );
};

export default AddNewChat;
