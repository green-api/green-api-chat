import { FC, useRef } from 'react';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Row, Typography } from 'antd';
import useModal from 'antd/es/modal/useModal';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import SelectLanguage from 'components/UI/select/select-language.component';
import { GreenApiRoutes, Routes } from 'configs';
import { useActions, useAppDispatch, useFormWithLanguageValidation } from 'hooks';
import { useLoginMutation } from 'services/app/endpoints';
import { AuthFormValues } from 'types';

const AuthForm: FC = () => {
  const { t } = useTranslation();
  const navigator = useNavigate();
  const [form] = useFormWithLanguageValidation<AuthFormValues>();

  // To avoid twice rendering of modal window
  const needToUpdateModal = useRef(false);

  const [login, { isLoading, isError, data, isSuccess }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const { login: loginUser } = useActions();

  const [modalFactory, contextHolder] = useModal();

  if (isError) {
    needToUpdateModal.current = false;

    modalFactory.error({
      title: 'Unknown error!',
    });
  }

  if (isSuccess && data) {
    if (!data.result) {
      if (data.error.code === 404) {
        form.setFields([
          {
            name: 'login',
            errors: [t('USER_NOT_FOUND')],
          },
        ]);
      }

      if (data.error.code === 401) {
        form.setFields([
          {
            name: 'password',
            errors: [t('PASSWORD_INCORRECT')],
          },
          {
            name: 'login',
            errors: [''],
          },
        ]);
      }
    }

    if (data.result) {
      dispatch(
        loginUser({
          login: form.getFieldValue('login'),
          ...data.data,
          remember: form.getFieldValue('remember'),
        })
      );

      navigator(Routes.main);
      return;
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <Form form={form} onSubmitCapture={handlerSubmit} scrollToFirstError className="auth-form">
        <Typography.Title className="text-center" level={3}>
          {t('LOGIN_TITLE')}
        </Typography.Title>
        <Form.Item
          name="login"
          normalize={(value) => value.replaceAll(/^\s+|\s+$/g, '')}
          rules={[
            {
              type: 'email',
              message: t('INPUT_EMAIL_INVALID'),
            },
            {
              required: true,
              message: t('INPUT_EMAIL_HINT'),
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder={t('E_MAIL')}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: t('INPUT_USER_PASSWORD_HINT') }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder={t('INPUT_USER_PASSWORD')}
          />
        </Form.Item>

        <Row justify="space-between">
          <Col>
            <Form.Item initialValue={true} name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('CHECK_REMEMBER_ME')}</Checkbox>
            </Form.Item>
          </Col>
          <Col>
            <Link
              to={GreenApiRoutes.recoverPassword}
              className="link link-blue link-hover-underline"
            >
              {t('CLICK_FORGOT_PASSWORD')}
            </Link>
          </Col>
        </Row>

        <div className="margin-vertical">
          <Button
            disabled={isLoading}
            type="primary"
            htmlType="submit"
            className="w-100"
            loading={isLoading}
          >
            {t('CLICK_LOGIN')}
          </Button>
        </div>

        <div className="text-center margin-bottom">
          <Link to={GreenApiRoutes.registration} className="link link-blue link-hover-underline">
            {t('CLICK_REGISTER_NOW')}
          </Link>
        </div>

        <Row justify="center">
          <SelectLanguage />
        </Row>
      </Form>
      {contextHolder}
    </div>
  );

  async function handlerSubmit() {
    if (isLoading) return;

    try {
      await form.validateFields();
    } catch {
      return;
    }

    const values = form.getFieldsValue();

    needToUpdateModal.current = true;

    login({ login: values.login, password: values.password });
  }
};

export default AuthForm;
