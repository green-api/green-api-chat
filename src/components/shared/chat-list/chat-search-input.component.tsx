import React, { useCallback } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectMiniVersion, selectSearchQuery } from 'store/slices/chat.slice';

interface ChatSearchInputProps {
  setPage: (page: number) => void;
}

const ChatSearchInput: React.FC<ChatSearchInputProps> = ({ setPage }) => {
  const { t } = useTranslation();

  const searchQuery = useAppSelector(selectSearchQuery);

  const isMiniVersion = useAppSelector(selectMiniVersion);

  const { setSearchQuery } = useActions();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setPage(1);
    },
    [setPage]
  );

  if (isMiniVersion) {
    return null;
  }

  return (
    <div style={{ margin: 8 }}>
      <Input
        size="large"
        style={{
          borderRadius: 20,
          backgroundColor: 'var(--search-input-bg)',
          color: 'var(--search-input-font-color)',
          fontSize: 15,
          border: 'none',
        }}
        prefix={<SearchOutlined />}
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
