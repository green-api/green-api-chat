import { FC, useState } from 'react';

import { Button, Flex, Input, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { OtpInput } from 'components/shared/otp-input.component';
import { EXTERNAL_LINKS } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import {
  useSendAuthorizationCodeMutation,
  useStartAuthorizationMutation,
} from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { InstanceInterface } from 'types';

const validatePhone = (phone: string) => {
  const regexRU = /^7\d{10}$/;
  const regexBY = /^375\d{9}$/;
  return regexRU.test(phone) || regexBY.test(phone);
};

const ERROR_REASONS = {
  verify_code_wrong: 'Введён неправильный код',
  connection_closed: 'Соединение с серверами МАХ прервано (сервера недоступны)',
  rate_limit_exceeded: 'Превышено количество отправок кода верификации',
  blocked_or_deleted: 'Аккаунт удален или заблокирован со стороны МАХ',
  code_expired: 'Время действия кода подтверждения истекло',
  timeout: 'Cервера МАХ не прислали ответа в требуемый интервал времени',
  not_ready:
    'Инстанс не готов к работе. Повторите попытку позже. Если проблема сохранится, обратитесь в техническую поддержку.',
} as const;

type ErrorReason = keyof typeof ERROR_REASONS;

const getErrorText = (reason: string) => {
  if (reason in ERROR_REASONS) {
    return ERROR_REASONS[reason as ErrorReason];
  }
  return 'Произошла ошибка при проверке кода';
};

export const MaxAuth: FC = () => {
  const { idInstance, apiTokenInstance, apiUrl, mediaUrl } = useAppSelector(selectInstance);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statAuthorization] = useStartAuthorizationMutation();
  const [sendAuthorizationCode, { isLoading: isSending }] = useSendAuthorizationCodeMutation();
  const { setIsAuthorizingInstance } = useActions();

  const { i18n } = useTranslation();
  const resolvedLanguage = i18n.resolvedLanguage;

  const handleSendAuthorizationCode = async () => {
    if (!validatePhone(phoneNumber)) {
      message.error('Введите корректный номер: Россия (7XXXXXXXXXX) или Беларусь (375XXXXXXXXX)');
      return;
    }

    try {
      const response = await statAuthorization({
        phoneNumber,
        idInstance,
        apiTokenInstance,
        apiUrl,
        mediaUrl,
      }).unwrap();

      if (response.data.status === 'fail') {
        message.error(getErrorText(response.data.reason));
        return;
      }
      setIsCodeSent(true);
    } catch {
      message.error('Произошла непредвиденная ошибка');
    }
  };

  const handleVerifyCode = async (value: string) => {
    try {
      const response = await sendAuthorizationCode({
        idInstance,
        apiTokenInstance,
        apiUrl,
        mediaUrl,
        code: value,
      }).unwrap();

      if (response?.data?.status === 'fail') {
        message.error(getErrorText(response.data.reason));
      }
    } catch {
      message.error('Произошла ошибка при проверке кода');
    }
    setIsAuthorizingInstance(false);
  };

  return (
    <Flex
      vertical
      gap={12}
      style={{
        marginTop: 30,
        maxWidth: 600,
        width: '90%',
        maxHeight: 300,
        padding: '16px',
        border: '1px solid var(--primary-color)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Typography.Title style={{ margin: 0 }} level={3}>
        Введите номер телефона
      </Typography.Title>

      {!isCodeSent && (
        <>
          <Input
            type="tel"
            placeholder="79991234567"
            value={phoneNumber}
            onChange={(event) => {
              const onlyDigits = event.target.value.replaceAll(/\D/g, '');
              setPhoneNumber(onlyDigits);
            }}
            maxLength={12}
            style={{ marginBottom: '16px' }}
          />
          <Button
            className="simpleType w-100"
            type="primary"
            size="large"
            onClick={handleSendAuthorizationCode}
            disabled={!phoneNumber.trim()}
          >
            Получить код
          </Button>
        </>
      )}

      {isCodeSent && (
        <>
          <div style={{ fontSize: 16 }}>
            На номер телефона <strong>{phoneNumber}</strong> отправлено SMS с кодом проверки.
            Введите код проверки для авторизации.
          </div>
          <Flex wrap="wrap" gap={12} align="center" style={{ width: '100%' }}>
            <div style={{ flex: 1 }}>
              <p
                className="link link-blue link-hover-underline-multiline max-auth-back"
                style={{ margin: 0, cursor: 'pointer', paddingLeft: 10 }}
                onClick={() => setIsCodeSent(false)}
              >
                &larr; Назад
              </p>
            </div>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <OtpInput
                length={6}
                disabled={isSending}
                onComplete={(value) => handleVerifyCode(value)}
              />
            </div>
            <div style={{ flex: 1 }} />
          </Flex>

          <div style={{ fontSize: 16 }}>
            При вводе кода проверки Вы соглашаетесь с{' '}
            <a
              key={1}
              className="link link-blue link-hover-underline-multiline"
              target="_blank"
              href={
                EXTERNAL_LINKS.userAgreement[
                  resolvedLanguage as keyof typeof EXTERNAL_LINKS.userAgreement
                ] ?? EXTERNAL_LINKS.userAgreement.default
              }
              rel="noreferrer"
            >
              Пользовательским соглашением
            </a>{' '}
            и{' '}
            <a
              key={0}
              className="link link-blue link-hover-underline-multiline"
              target="_blank"
              href={
                EXTERNAL_LINKS.privacyPolicy[
                  resolvedLanguage as keyof typeof EXTERNAL_LINKS.privacyPolicy
                ] ?? EXTERNAL_LINKS.privacyPolicy.default
              }
              rel="noreferrer"
            >
              Политикой конфиденциальности и обработки персональных данных GREEN-API
            </a>
          </div>
        </>
      )}
    </Flex>
  );
};
