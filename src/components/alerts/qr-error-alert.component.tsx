import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';

import { LanguageLiteral } from 'types';
import { fillJsxString, getSupportEmailByLanguage } from 'utils';

const QrErrorAlert = () => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const supportEmail = getSupportEmailByLanguage(resolvedLanguage as LanguageLiteral);

  return (
    <Alert
      type="warning"
      message={
        <>
          <p>
            {fillJsxString(t('QR_LOADER_ERROR'), [
              <a
                key="supportEmail"
                className="link link-blue link-hover-underline nowrap"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>,
            ])}
          </p>
        </>
      }
    />
  );
};

export default QrErrorAlert;
