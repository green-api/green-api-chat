import SendContactForm from 'components/forms/send-contact-form.component';
import SendFileForm from 'components/forms/send-file-form.component';
import SendLocationForm from 'components/forms/send-location-form.component';
import { SendingMethod } from 'types';

export const SENDING_METHODS_CONFIG: SendingMethod[] = [
  { name: 'sendFileByUpload', element: <SendFileForm /> },
  { name: 'sendContact', element: <SendContactForm /> },
  { name: 'sendLocation', element: <SendLocationForm /> },
];
