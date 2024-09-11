import { FC } from 'react';

import { Button, Card, Form, Input, notification } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useFormWithLanguageValidation } from 'hooks';
import { useLazyGetStateInstanceQuery } from 'services/green-api/endpoints';
import { StateInstanceEnum, UserCredentials } from 'types';
import { getErrorMessage } from 'utils';

const AuthForm: FC = () => {
  const { setCredentials } = useActions();

  const [getStateInstance, { isLoading }] = useLazyGetStateInstanceQuery();

  const { t } = useTranslation();

  const [form] = useFormWithLanguageValidation<UserCredentials>();

  const onSignIn = async (values: UserCredentials) => {
    const { apiTokenInstance, idInstance } = values;
    const credentials = { idInstance, apiTokenInstance };

    const { data, error } = await getStateInstance({ apiTokenInstance, idInstance });

    if (data) {
      switch (data.stateInstance) {
        case StateInstanceEnum.Authorized:
          setCredentials(credentials);

          return;

        case StateInstanceEnum.Blocked:
          return notification.warning({
            message: t('WARNING'),
            description: t('WARNING_DESCRIPTION_BANNED'),
            duration: 4,
          });

        case StateInstanceEnum.NotAuthorized:
          return notification.warning({
            message: t('WARNING'),
            description: t('WARNING_DESCRIPTION_NOT_AUTHORIZED'),
            duration: 4,
          });

        case StateInstanceEnum.Starting:
          return notification.warning({
            message: t('WARNING'),
            description: t('WARNING_DESCRIPTION_STARTING'),
            duration: 4,
          });

        case StateInstanceEnum.YellowCard:
          return notification.warning({
            message: t('WARNING'),
            description: t('WARNING_DESCRIPTION_YELLOW_CARD'),
            duration: 4,
          });
      }
    }

    if (error) {
      notification.error({
        message: t('ERROR'),
        description: getErrorMessage(error, t),
        duration: 4,
      });
    }
  };

  return (
    <Card className="form-card" title={<h2>{t('AUTHORIZATION')}</h2>}>
      <Form name="auth-form" size="large" onFinish={onSignIn} form={form}>
        <Form.Item
          name="idInstance"
          hasFeedback
          rules={[
            { required: true, message: t('EMPTY_FIELD_ERROR') },
            { whitespace: true, message: t('EMPTY_FIELD_ERROR') },
          ]}
        >
          <Input placeholder="idInstance" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="apiTokenInstance"
          hasFeedback
          rules={[
            { required: true, message: t('EMPTY_FIELD_ERROR') },
            { whitespace: true, message: t('EMPTY_FIELD_ERROR') },
          ]}
        >
          <Input placeholder="apiTokenInstance" autoComplete="off" />
        </Form.Item>
        <Form.Item>
          <Button disabled={isLoading} htmlType="submit" size="large" type="primary">
            {t('LOGIN')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AuthForm;
