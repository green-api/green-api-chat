import { useEffect, useState } from 'react';

import { Form, Select, Space } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { useTranslation } from 'react-i18next';
import { load as loadFont } from 'webfontloader';

import { formItemMethodApiLayout } from 'configs';

const SelectStatusFont = () => {
  const { t } = useTranslation();
  const form = useFormInstance();
  const font = useWatch('font', form);

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

  const fonts = {
    SERIF: 'serif',
    SANS_SERIF: 'sans-serif',
    NORICAN_REGULAR: 'Norican',
    BRYNDAN_WRITE: 'cursive',
    OSWALD_HEAVY: 'Oswald',
  };

  return (
    <Form.Item
      label={<span title={t('FONT_PLACEHOLDER')}>{t('FONT_PLACEHOLDER')}</span>}
      {...formItemMethodApiLayout}
      className="selectFont"
    >
      <Space rootClassName="selectFont__space" size="large" align="baseline">
        <Form.Item className="selectFont__select" initialValue="SANS_SERIF" name="font">
          <Select
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
        <div
          style={{ fontFamily: fonts[font as keyof typeof fonts] }}
          className="selectFont__text selectFont__text--desk"
        >
          {font === 'NORICAN_REGULAR' ? 'Here is how your text will look' : t('FONT_TEXT_EXAMPLE')}
        </div>
      </Space>

      <div>
        {font === 'NORICAN_REGULAR' && (
          <div className="failed selectFont__warning" style={{ fontSize: 12 }}>
            {t('LAT_TEXT_ONLY')}
          </div>
        )}
      </div>
    </Form.Item>
  );
};

export default SelectStatusFont;
