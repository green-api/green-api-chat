import { useEffect, useState } from 'react';

import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { load as loadFont } from 'webfontloader';
import { FileTextOutlined, FontColorsOutlined } from '@ant-design/icons';

const SelectStatusFont = () => {
  const { t } = useTranslation();

  const [areFontsLoaded, setAreFontsLoaded] = useState(false);

  useEffect(() => {
    if (areFontsLoaded) return;

    loadFont({
      google: {
        families: ['Norican', 'Oswald'],
      },
    });

    setAreFontsLoaded(true);
  }, []);

  return (
    <Form.Item noStyle className="selectFont__select" initialValue="SANS_SERIF" name="font">
      <Select
        suffixIcon={<FontColorsOutlined />}
        options={[
          {
            label: 'SERIF',
            value: 'SERIF',
          },
          {
            label: 'SANS_SERIF',
            value: 'SANS_SERIF',
          },
          {
            label: 'NORICAN_REGULAR',
            value: 'NORICAN_REGULAR',
          },
          {
            label: 'BRYNDAN_WRITE',
            value: 'BRYNDAN_WRITE',
          },
          {
            label: 'OSWALD_HEAVY',
            value: 'OSWALD_HEAVY',
          },
        ]}
        defaultValue="SANS_SERIF"
        placeholder={t('FONT_PLACEHOLDER')}
      />
    </Form.Item>
  );
};

export default SelectStatusFont;
