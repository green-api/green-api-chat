import { FC, useEffect, useState } from 'react';

import { Button, Flex, Form, Input, message, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import QrErrorAlert from 'components/alerts/qr-error-alert.component';
import QrInstructionCarouselRu from 'components/carousel/qr-instruction-carousel-ru.component';
import Progressbar from 'components/progressbar.component';
import TutorialLink from 'components/tutorial-link.component';
import LizardLoader from 'components/UI/lizard-loader.component';
import { useActions } from 'hooks';
import {
  useGetAccountSettingsQuery,
  useQrMutation,
  useSendAuthorizationCodeMutation,
} from 'services/green-api/endpoints';
import { InstanceInterface } from 'types';

interface Properties {
  instanceData: InstanceInterface;
  refetchStateInstace: () => void;
  tutorialLink?: string;
  qrText?: string;
}

export const TelegramAuth: FC<Properties> = ({
  instanceData,
  refetchStateInstace,
  tutorialLink,
  qrText = 'FIRST_GET_QR_DATA',
}) => {
  const [passwordForm] = Form.useForm();

  const [qr, setQr] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showQrError, setShowQrError] = useState(false);
  const [isPendingPassword, setIsPendingPassword] = useState(false);

  const { setIsAuthorizingInstance } = useActions();

  const [getQr, { isLoading: isLoadingQr }] = useQrMutation();
  const { t } = useTranslation();

  const { data: accountSettings } = useGetAccountSettingsQuery(instanceData, {
    pollingInterval: 5000,
    skip: isAuthed,
  });

  const [sendAuthorizationCode, { isLoading: isSendingAuthorizationCode }] =
    useSendAuthorizationCodeMutation();

  const isQrError = showQrError;

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!qr || isAuthed) {
        return;
      }

      try {
        const response = await getQr(instanceData).unwrap();

        if (response.type === 'error') {
          setShowQrError(true);
          return;
        }

        if (response.type === 'alreadyLogged') {
          return;
        }

        if (response.type === 'pending_password') {
          setIsPendingPassword(true);
          setQr(null);
          setShowQrError(false);
          return;
        }

        setIsPendingPassword(false);
        setQr(response.message);
      } catch {
        setShowQrError(true);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [qr, isAuthed, getQr, instanceData]);

  useEffect(() => {
    if (accountSettings?.stateInstance === 'authorized') {
      setIsAuthed(true);
      setTimeout(refetchStateInstace, 1000);
      setIsAuthorizingInstance(false);
    }
  }, [accountSettings, refetchStateInstace, setIsAuthorizingInstance]);

  const handleRefreshQr = async () => {
    try {
      const response = await getQr(instanceData).unwrap();

      if (response.type === 'error') {
        setShowQrError(true);
        return;
      }

      if (response.type === 'pending_password') {
        setIsPendingPassword(true);
        setQr(null);
        setShowQrError(false);
        return;
      }

      setIsPendingPassword(false);
      setQr(response.message);
      setShowQrError(false);
    } catch {
      setShowQrError(true);
    }
  };

  const handlePasswordSubmit = async (values: { password: string }) => {
    try {
      await sendAuthorizationCode({
        ...instanceData,
        code: '',
        password: values.password,
      }).unwrap();
      setTimeout(refetchStateInstace, 1000);
    } catch {
      message.error(t('ERROR_SENDING_PASSWORD'));
    }
  };

  if (isAuthed) return null;

  return (
    <Tabs
      className="descGroup descGroup--noWidth qr__tab"
      id="connect-instance"
      type="card"
      activeKey="qr"
      items={[
        {
          key: 'qr',
          label: (
            <>
              <span>{t('LINK_BY')}</span> <span>{t('LINK_BY_QR')}</span>
            </>
          ),
          children: (
            <div className="qr">
              <div className="qr__block">
                <div className="qr__block margin-vertical-auto">
                  {isLoadingQr && !qr && (
                    <div className="qr__text">
                      <div className="content-in-center">
                        <LizardLoader />
                      </div>
                    </div>
                  )}

                  {qr && (
                    <img height={276} width={276} src={`data:image/png;base64,${qr}`} alt="image" />
                  )}

                  {!qr && !isLoadingQr && (
                    <Flex
                      align="center"
                      justify="center"
                      vertical
                      className={`qr__text ${isQrError ? 'qr__text--error' : ''}`}
                    >
                      {tutorialLink && (
                        <TutorialLink link={tutorialLink} additionalClassName="text-center" />
                      )}
                      <span>{t(qrText)}</span>
                    </Flex>
                  )}

                  {isPendingPassword && (
                    <div className="margin-top">
                      <Form form={passwordForm} onFinish={handlePasswordSubmit}>
                        <Form.Item
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: t('PASSWORD_REQUIRED'),
                            },
                          ]}
                        >
                          <Input type="password" placeholder={t('ENTER_PASSWORD')} size="large" />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            className="simpleType w-100"
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={isSendingAuthorizationCode}
                          >
                            {t('SUBMIT')}
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  )}

                  {!qr && !isPendingPassword && (
                    <>
                      {isLoadingQr && !isQrError && (
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
                        onClick={() => {
                          handleRefreshQr();
                          setShowQrError(false);
                        }}
                        size="large"
                        disabled={isLoadingQr || !!qr}
                      >
                        {t('REFRESH_QR')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <QrInstructionCarouselRu />
            </div>
          ),
        },
      ]}
    />
  );
};
