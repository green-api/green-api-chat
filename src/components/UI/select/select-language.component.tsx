import { GlobalOutlined } from '@ant-design/icons';
import { Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { LANGUAGES } from 'configs';

const SelectLanguage = () => {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ display: 'inline-flex' }}>
      <Select
        onSelect={handlerSelect}
        className="selectLanguage"
        size="small"
        value={i18n.resolvedLanguage}
        bordered={false}
        showArrow={true}
      >
        {LANGUAGES.map((language) => (
          <Select.Option key={language.name + language.title} value={language.name}>
            <span className="selectLanguage__itemBox">
              <Typography className="selectLanguage__text">{t(language.title)}</Typography>
            </span>
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  function handlerSelect(value: string) {
    i18n.changeLanguage(value);
  }
};

export default SelectLanguage;
