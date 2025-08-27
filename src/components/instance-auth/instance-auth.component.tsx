// components/authorization/authorization.component.tsx
import { useState, useEffect } from 'react';

import { useGetAuthorizationCodeMutation } from '@services/green-api/endpoints';
import { Form, InputNumber, Button, Typography, Tabs, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import QrErrorAlert from 'components/alerts/qr-error-alert.component';
import Progressbar from 'components/progressbar.component';
import TutorialLink from 'components/tutorial-link.component';
import CopyButton from 'components/UI/copy-button.component';
import LizardLoader from 'components/UI/lizard-loader.component';
import { useFormWithLanguageValidation } from 'hooks';
import { useQrWebsocket } from 'hooks/use-qr-websocket.hook';
import { StateInstanceEnum } from 'types';

interface AuthorizationProps {
  instanceData: {
    idInstance: number;
    apiTokenInstance: string;
    apiUrl: string;
    mediaUrl: string;
  };
  stateInstance?: StateInstanceEnum;
  onAuthorized: () => void;
  isLoadingSettings: boolean;
  tutorialLink: string;
}

export const Authorization = ({
  instanceData,
  stateInstance,
  onAuthorized,
  tutorialLink,
}: AuthorizationProps) => {
  const { t, i18n } = useTranslation();
  const [activeAuthorizationTabKey, setActiveAuthorizationTabKey] = useState('qr');
  const [showCodeError, setShowCodeError] = useState(false);
  const [showQrError, setShowQrError] = useState(false);
  const [phone, setPhone] = useState('');

  const { openQrWebsocket, qrData, qrText, isQrLoading, isQrError } = useQrWebsocket(
    instanceData.apiUrl,
    onAuthorized
  );

  const [getCode, { data: codeData, isLoading: isLoadingCode }] = useGetAuthorizationCodeMutation();
  const [codeForm] = useFormWithLanguageValidation();
  const [showCodeInstruction, setShowCodeInstruction] = useState(false);

  useEffect(() => {
    if (!codeData || !codeData.status) {
      if (codeData?.status === false) {
        setShowCodeError(true);
      }
      return;
    }

    setShowCodeInstruction(true);
    setShowCodeError(false);
    codeForm.setFieldValue('phoneNumber', '');
  }, [codeData]);

  const handleSubmitCode = async () => {
    if (isLoadingCode) return;

    try {
      await codeForm.validateFields();
    } catch {
      return;
    }

    const phoneNumber = codeForm.getFieldValue('phoneNumber');
    setPhone(phoneNumber);

    getCode({
      idInstance: instanceData.idInstance,
      apiTokenInstance: instanceData.apiTokenInstance,
      apiUrl: instanceData.apiUrl,
      mediaUrl: instanceData.mediaUrl,
      phoneNumber,
    });
  };

  if (stateInstance === StateInstanceEnum.Authorized) {
    return null;
  }

  return (
    <Tabs
      className="descGroup descGroup--noWidth qr__tab"
      activeKey={activeAuthorizationTabKey}
      onChange={setActiveAuthorizationTabKey}
      items={[
        {
          key: 'qr',
          label: (
            <>
              <span>{t('LINK_BY')}</span> <span>{t('LINK_BY_QR')}</span>
            </>
          ),
          children: (
            <QrAuthorization
              qrData={qrData}
              qrText={qrText}
              isQrLoading={isQrLoading}
              isQrError={isQrError}
              tutorialLink={tutorialLink}
              showQrError={showQrError}
              onRefreshQr={() => {
                openQrWebsocket({
                  idInstance: instanceData.idInstance.toString(),
                  apiTokenInstance: instanceData.apiTokenInstance,
                });
                setShowQrError(false);
              }}
              onSwitchToPhone={() => setActiveAuthorizationTabKey('code')}
              onSwitchToSendQr={() => setActiveAuthorizationTabKey('send-qr')}
            />
          ),
        },
        {
          key: 'code',
          label: (
            <>
              <span>{t('LINK_BY')}</span> <span>{t('LINK_BY_PHONE')}</span>
            </>
          ),
          children: (
            <PhoneAuthorization
              showCodeInstruction={showCodeInstruction}
              codeData={codeData}
              phone={phone}
              isLoadingCode={isLoadingCode}
              showCodeError={showCodeError}
              codeForm={codeForm}
              onSubmitCode={handleSubmitCode}
              onBack={() => setShowCodeInstruction(false)}
              language={i18n.resolvedLanguage}
            />
          ),
        },
        {
          key: 'send-qr',
          label: <span>{t('SEND_QR_TO_CLIENT')}</span>,
          children: (
            <SendQrAuthorization
              qrLink={`${QR_HTTP_HOST}/waInstance${instanceData.idInstance}/${instanceData.apiTokenInstance}`}
              language={i18n.resolvedLanguage}
            />
          ),
        },
      ]}
    />
  );
};

// Подкомпоненты для каждой вкладки авторизации
const QrAuthorization = ({
  qrData,
  qrText,
  isQrLoading,
  isQrError,
  tutorialLink,
  showQrError,
  onRefreshQr,
  onSwitchToPhone,
  onSwitchToSendQr,
  setShowQrError,
}: {
  qrData: string | null;
  qrText: string;
  isQrLoading: boolean;
  isQrError: boolean;
  tutorialLink: string;
  showQrError: boolean;
  onRefreshQr: () => void;
  onSwitchToPhone: () => void;
  onSwitchToSendQr: () => void;
  setShowQrError: (value: boolean) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="qr">
      <div className="qr__block">
        <div className="qr__block margin-vertical-auto">
          {isQrLoading && (
            <div className="qr__text">
              <div className="content-in-center">
                <LizardLoader />
              </div>
            </div>
          )}
          {qrData && <img src={`data:image/jpeg;base64,${qrData}`} alt="QR code" />}
          {!qrData && !isQrLoading && (
            <Flex
              align="center"
              justify="center"
              vertical
              className={`qr__text ${isQrError ? 'qr__text--error' : ''}`}
            >
              <TutorialLink link={tutorialLink} additionalClassName="text-center" />
              <span>{t(qrText)}</span>
            </Flex>
          )}
          {!qrData && (
            <>
              {isQrLoading && !isQrError && (
                <Progressbar
                  onFinish={() => setShowQrError(true)}
                  rootClassName="qrProgressBar"
                  time={60}
                />
              )}
              {showQrError && (
                <div className="margin-bottom">
                  <QrErrorAlert />
                </div>
              )}
              <Button
                className="simpleType w-100"
                type="primary"
                onClick={onRefreshQr}
                size="large"
                disabled={isQrLoading || !!qrData}
              >
                {t('REFRESH_QR')}
              </Button>
              <div
                onClick={onSwitchToPhone}
                className="margin-top link link-blue link-hover-underline cursor-pointer"
              >
                {t('LINK_BY')} {t('LINK_BY_PHONE')}
              </div>
              <div
                onClick={onSwitchToSendQr}
                className="margin-top link link-blue link-hover-underline cursor-pointer"
              >
                {t('SEND_QR_TO_CLIENT')}
              </div>
            </>
          )}
        </div>
      </div>
      {i18n.resolvedLanguage === 'ru' ? <QrInstructionCarouselRu /> : <QrInstructionCarouselEn />}
    </div>
  );
};

const PhoneAuthorization = ({
  showCodeInstruction,
  codeData,
  phone,
  isLoadingCode,
  showCodeError,
  codeForm,
  onSubmitCode,
  onBack,
  language,
}: {
  showCodeInstruction: boolean;
  codeData: any;
  phone: string;
  isLoadingCode: boolean;
  showCodeError: boolean;
  codeForm: any;
  onSubmitCode: () => void;
  onBack: () => void;
  language: string;
}) => {
  const { t } = useTranslation();

  if (!showCodeInstruction) {
    return (
      <div className="qr qr--phone">
        <div className="qr__block">
          <div className="margin-vertical-auto">
            <Typography.Title level={3}>{t('INPUT_NUMBER_PHONE')}</Typography.Title>
            <Form form={codeForm} onSubmitCapture={onSubmitCode}>
              <Form.Item
                rules={[{ required: true, message: t('INPUT_NUMBER') }]}
                name="phoneNumber"
              >
                <InputNumber
                  controls={false}
                  disabled={isLoadingCode}
                  className="w-100"
                  placeholder={t('CHAT_ID_PHONE_PLACEHOLDER')}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  htmlType="submit"
                  className="simpleType w-100"
                  type="primary"
                  size="large"
                  loading={isLoadingCode}
                >
                  {t('GET_CODE')}
                </Button>
              </Form.Item>
            </Form>
            {showCodeError && (
              <div className="margin-top failed text-center">
                <p>{t('CODE_ERROR_FIRST')}</p>
                <p>{t('CODE_ERROR_SECOND')}</p>
              </div>
            )}
          </div>
        </div>
        {language === 'ru' ? <NumberInstructionCarouselRu /> : <NumberInstructionCarouselEn />}
      </div>
    );
  }

  return (
    <div className="qr qr--phone qr--show">
      <div className="authorizationCode">
        <div>
          <div>
            <Typography.Title level={3}>{t('INPUT_CODE_ON_PHONE')}</Typography.Title>
            <div>
              {fillJsxString(t('CONNECT_WHATSAPP_ACCOUNT'), [<strong key={phone}>{phone}</strong>])}
            </div>
            <span onClick={onBack} className="success cursor-pointer">
              ({t('CHANGE_NUMBER')})
            </span>
          </div>
          <div dir="ltr" className="authorizationCode__code" translate="no">
            {codeData?.code && (
              <>
                {[...codeData.code].map((letter, index) => (
                  <div key={`${letter}${index}`} className="authorizationCode__letter">
                    {letter}
                  </div>
                ))}
                <div className="authorizationCode__copy">
                  <CopyButton text={codeData.code} />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="authorizationCode__instruction">
          <ol>
            <li dangerouslySetInnerHTML={{ __html: t('LINK_BY_CODE_STEP_1') }} />
            <li
              dangerouslySetInnerHTML={{
                __html: fillString(t('LINK_BY_CODE_STEP_2'), [
                  `<img src="${codeSettingsIcon}" alt="settings" />`,
                  `<img src="${codeMenuIcon}" alt="menu" />`,
                ]),
              }}
            />
            <li dangerouslySetInnerHTML={{ __html: t('LINK_BY_CODE_STEP_3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('LINK_BY_CODE_STEP_4') }} />
          </ol>
        </div>
      </div>
      {language === 'ru' ? <NumberInstructionCarouselRu /> : <NumberInstructionCarouselEn />}
    </div>
  );
};

const SendQrAuthorization = ({ qrLink, language }: { qrLink: string; language: string }) => {
  const { t } = useTranslation();

  return (
    <div className="qr">
      <div className="qr__block" style={{ alignSelf: 'center', rowGap: 10 }}>
        <span style={{ fontSize: '1rem' }} className="text-center">
          {t('SEND_QR_TO_CLIENT_DESCRIPTION')}{' '}
          <CopyButton text={qrLink} additionalClassname="icon-button__qr-link" />
        </span>
        <Button
          className="simpleType w-100"
          type="primary"
          size="large"
          target="_blank"
          href={qrLink}
        >
          {t('INSTANCE_OPEN')}
        </Button>
      </div>
      {language === 'ru' ? <QrInstructionCarouselRu /> : <QrInstructionCarouselEn />}
    </div>
  );
};

export default Authorization;
