import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { Search } from 'components/UI/search.component';
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

  return <Search searchQuery={searchQuery} t={t} handleChange={handleChange} />;
};

export default ChatSearchInput;
