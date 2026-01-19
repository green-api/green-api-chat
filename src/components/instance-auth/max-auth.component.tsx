import { FC, useEffect, useState } from 'react';

import { Button, Flex, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import QrErrorAlert from './qr-error-alert.component';
import QrInstructionCarouselRu from 'components/carousel/qr-instruction-carousel-ru.component';
import Progressbar from 'components/progressbar.component';
import LizardLoader from 'components/UI/lizard-loader.component';
import { useActions } from 'hooks';
import { useQrMutation, useGetAccountSettingsQuery } from 'services/green-api/endpoints';
import { InstanceInterface } from 'types';

interface Properties {
  instanceData: InstanceInterface;
  refetchStateInstace: () => void;
  tutorialLink?: string;
  qrText?: string;
}

export const MaxAuth: FC<Properties> = ({
  instanceData,
  refetchStateInstace,
  qrText = 'FIRST_GET_QR_DATA',
}) => {
  const [qr, setQr] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showQrError, setShowQrError] = useState(false);

  const { setIsAuthorizingInstance } = useActions();

  const { t } = useTranslation();

  const [getQr, { isLoading: isLoadingQr }] = useQrMutation();
  const { data: accountSettings } = useGetAccountSettingsQuery(instanceData, {
    pollingInterval: 5000,
    skip: !qr || isAuthed,
  });

  const isQrError = showQrError;

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!qr || isAuthed) return;

      try {
        const response = await getQr(instanceData).unwrap();

        if (response.type === 'error') {
          setShowQrError(true);
          return;
        }

        if (response.type === 'alreadyLogged') {
          return;
        }

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
  }, [accountSettings, refetchStateInstace]);

  const handleRefreshQr = async () => {
    try {
      const response = await getQr(instanceData).unwrap();

      if (response.type === 'error') {
        setShowQrError(true);
        return;
      }

      setQr(response.message);
      setShowQrError(false);
    } catch {
      setShowQrError(true);
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
                      <span>{t(qrText)}</span>
                    </Flex>
                  )}

                  {!qr && (
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
