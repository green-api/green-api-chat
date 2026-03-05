import { Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { LANGUAGES } from 'configs';

const SelectLanguage = () => {
  const { i18n } = useTranslation();
  const selectedLanguage = (i18n.resolvedLanguage || i18n.language || 'en')
    .toLowerCase()
    .split(/[-_]/)[0];

  return (
    <div style={{ display: 'inline-flex' }}>
      <Select
        onSelect={handlerSelect}
        className="selectLanguage"
        size="small"
        value={selectedLanguage}
        bordered={false}
        showArrow={true}
      >
        {LANGUAGES.map((language) => (
          <Select.Option key={language.name + language.title} value={language.name}>
            <span className="selectLanguage__itemBox">
              <Typography className="selectLanguage__text">{language.title}</Typography>
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
