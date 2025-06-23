import { FC, useRef, useState } from 'react';

import { Button, Flex, Form, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import { TemplateButtonsField } from './buttons-field.component';
import { mapButtonsToInteractive } from './utils';
import TextArea from 'components/UI/text-area.component';
import { formItemDefaultLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import {
  useSendInteractiveButtonsMutation,
  useSendInteractiveButtonsReplyMutation,
} from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat, selectMessageCount, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, ButtonsFormValues, MessageInterface } from 'types';
import { getLastChats } from 'utils';

const ButtonsForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const messageCount = useAppSelector(selectMessageCount);
  const { setActiveSendingMode } = useActions();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [isReply, setIsReply] = useState(false);
  const [form] = useFormWithLanguageValidation<ButtonsFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const [sendButtons, { isLoading: isButtonsLoading }] = useSendInteractiveButtonsMutation();
  const [sendReplyButtons, { isLoading: isReplyButtonsLoading }] =
    useSendInteractiveButtonsReplyMutation();

  const onSendMessage = async (values: ButtonsFormValues) => {
    const { buttons, header, body, footer } = values;

    if (!body) return;

    const formBody = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      buttons,
      header,
      body,
      footer,
    };

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);
      responseTimerReference.current = null;
    }

    const { data } = isReply ? await sendReplyButtons(formBody) : await sendButtons(formBody);

    if (data) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          ...instanceCredentials,
          chatId: activeChat.chatId,
          count: isMiniVersion ? 10 : messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) return;

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'interactiveButtons',
            textMessage: body,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent',
            interactiveButtons: {
              contentText: body,
              footerText: footer,
              headerText: header,
              buttons: mapButtonsToInteractive(buttons),
            },
          });

          return draftChatHistory;
        }
      );

      const updateChatListThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'lastMessages',
        instanceCredentials,
        (draftChatHistory) => {
          const newMessage: MessageInterface = {
            type: 'outgoing',
            typeMessage: 'textMessage',
            textMessage: body,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent',
          };

          return getLastChats(draftChatHistory, [newMessage], isMiniVersion ? 5 : undefined);
        }
      );

      dispatch(updateChatHistoryThunk);
      dispatch(updateChatListThunk);
      dispatch(setActiveSendingMode(null));
      form.resetFields();
    }
  };

  return (
    <>
      <Tabs
        activeKey={isReply ? 'reply' : 'mixed'}
        onChange={(key) => {
          setIsReply(key === 'reply');
          form.resetFields(['buttons']);
        }}
        items={[
          {
            key: 'mixed',
            label: t('MIXED_BUTTONS'),
          },
          {
            key: 'reply',
            label: t('REPLY_BUTTONS'),
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Flex wrap gap={32}>
        <Form
          name="chat-form"
          onFinish={onSendMessage}
          form={form}
          onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
          disabled={isButtonsLoading || isReplyButtonsLoading}
          style={{ flexGrow: 1 }}
          labelCol={{ style: { width: 300 } }}
        >
          <Form.Item required {...formItemDefaultLayout} name="body" key="body" label={t('BODY')}>
            <TextArea />
          </Form.Item>

          <Form.Item {...formItemDefaultLayout} name="header" key="header" label={t('HEADER')}>
            <TextArea />
          </Form.Item>

          <Form.Item {...formItemDefaultLayout} name="footer" key="footer" label={t('FOOTER')}>
            <TextArea />
          </Form.Item>
          <TemplateButtonsField isReply={isReply} />
          <Form.Item style={{ marginBottom: 0 }} {...formItemDefaultLayout}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-100"
              loading={isButtonsLoading || isReplyButtonsLoading}
            >
              {t('SEND_MESSAGE')}
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </>
  );
};

export default ButtonsForm;
