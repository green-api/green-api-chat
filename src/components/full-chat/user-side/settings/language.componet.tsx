import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import SelectLanguage from 'components/UI/select/select-language.component';

export const Language = () => {
  const { t } = useTranslation();
  return (
    <Flex gap={14} vertical>
      <Flex className="settings" vertical style={{ flex: '0 0 auto' }}>
        <p style={{ fontSize: '1.5rem' }}>{t('LANGUAGE')}</p>
      </Flex>
      <div style={{ marginLeft: 20 }}>
        <SelectLanguage />
      </div>
    </Flex>
  );
};
