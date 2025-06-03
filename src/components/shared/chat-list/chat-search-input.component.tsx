import React, { useCallback } from 'react';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectSearchQuery } from 'store/slices/chat.slice';

interface ChatSearchInputProps {
  setPage: (page: number) => void;
}

const ChatSearchInput: React.FC<ChatSearchInputProps> = ({ setPage }) => {
  const { t } = useTranslation();

  const searchQuery = useAppSelector(selectSearchQuery);

  const { setSearchQuery } = useActions();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setPage(1);
    },
    [setPage]
  );

  return (
    <div style={{ margin: 8 }}>
      <Input
        placeholder={t('SEARCH_PLACEHOLDER')}
        value={searchQuery}
        onChange={handleChange}
        className="chat-list-search p-2"
        allowClear
      />
    </div>
  );
};

export default ChatSearchInput;
