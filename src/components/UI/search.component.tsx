import { ChangeEvent, FC } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import Input from 'antd/es/input';
import { useTranslation } from 'react-i18next';

interface SearchProps {
  searchQuery: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const Search: FC<SearchProps> = ({ searchQuery, handleChange }) => {
  const { t } = useTranslation();

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
