import { SearchOutlined } from '@ant-design/icons';
import Input from 'antd/es/input';

interface SearchProps {
  searchQuery: string;
  t: (key: string) => string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Search: React.FC<SearchProps> = ({ searchQuery, t, handleChange }) => {
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
