import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import SelectStatusMode from 'components/UI/select/select-status.component';

export const AddStatus = () => {
  const { t } = useTranslation();

  return (
    <Flex gap={10}>
      <SelectStatusMode />
      <Flex gap={10} vertical>
        <p>{t('MY_STATUS')}</p>
        <p style={{ color: 'var(--icon-color)' }}>{t('ADD_STATUS')}</p>
      </Flex>
    </Flex>
  );
};
