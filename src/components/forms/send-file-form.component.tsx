import { FC } from 'react';

import { Button, Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useTranslation } from 'react-i18next';

import UploadOneFile from 'components/UI/upload-one-file.components';
import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useSendFileByUploadMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, SendFileFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendFileForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { setActiveSendingMode } = useActions();

  const { t } = useTranslation();
  const isMax = useIsMaxInstance();

  const [sendFileByUpload, { isLoading }] = useSendFileByUploadMutation();

  const [form] = useFormWithLanguageValidation<SendFileFormValues>();

  const onFinish = async (values: SendFileFormValues) => {
    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      file: values.file,
      ...(values.fileName ? { fileName: values.fileName } : {}),
      ...(values.caption ? { caption: values.caption } : {}),
      ...(!isMax && values.quotedMessageId ? { quotedMessageId: values.quotedMessageId } : {}),
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendFileByUpload(body);

    if (isApiError(error)) {
      switch (error.status) {
        case 466:
          return form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

        default:
          return form.setFields([
            { name: 'response', errors: [getErrorMessage(error, t) || t('UNKNOWN_ERROR')] },
          ]);
      }
    }

    if (data) {
      form.setFields([{ name: 'response', warnings: [t('SUCCESS_SENDING_MESSAGE')] }]);

      setActiveSendingMode(null);
    }
  };

  return (
    <Form form={form} {...formItemMethodApiLayout} onFinish={onFinish}>
      <Form.Item
        name="file"
        label={t('FILE_LABEL')}
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        normalize={(value) => value.file}
      >
        <UploadOneFile />
      </Form.Item>
      <Form.Item name="fileName" label={t('FILENAME_LABEL')}>
        <Input placeholder={t('FILENAME_LABEL')} />
      </Form.Item>
      <Form.Item name="caption" label={t('DESCRIPTION')}>
        <TextArea placeholder={t('DESCRIPTION')} autoSize={{ minRows: 2, maxRows: 5 }} />
      </Form.Item>
      {!isMax && (
        <Form.Item name="quotedMessageId" label={t('QUOTED_MESSAGE_ID_LABEL')}>
          <Input placeholder={t('QUOTED_MESSAGE_ID_LABEL')} />
        </Form.Item>
      )}
      <Form.Item
        style={{ marginBottom: 0 }}
        wrapperCol={{
          span: 24,
          offset: 0,
          sm: {
            span: 20,
            offset: 4,
          },
          lg: {
            span: 16,
            offset: 9,
          },
        }}
      >
        <Button disabled={isLoading} htmlType="submit" size="large" block={true} type="primary">
          {t('SEND_MESSAGE')}
        </Button>
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default SendFileForm;
