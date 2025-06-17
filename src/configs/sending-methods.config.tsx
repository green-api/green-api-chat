import ButtonsForm from 'components/forms/buttons-form/buttons-form.component';
import SendContactForm from 'components/forms/send-contact-form.component';
import SendFileForm from 'components/forms/send-file-form.component';
import SendLocationForm from 'components/forms/send-location-form.component';
import SendPollForm from 'components/forms/send-poll-form.component';
import PreviewedMessageForm from 'components/forms/send-preview-form/send-preview-form.component';
import SendTemplateForm from 'components/forms/send-template-form.component';
import { SendingMethod } from 'types';

export const SENDING_METHODS_CONFIG: SendingMethod[] = [
  { name: 'sendFileByUpload', element: <SendFileForm /> },
  { name: 'sendContact', element: <SendContactForm /> },
  { name: 'sendLocation', element: <SendLocationForm /> },
  { name: 'sendPoll', element: <SendPollForm /> },
  { name: 'sendTemplate', element: <SendTemplateForm /> },
  { name: 'sendPreview', element: <PreviewedMessageForm /> },
  { name: 'sendButtons', element: <ButtonsForm /> },
];
