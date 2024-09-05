import SendFileForm from 'components/forms/send-file-form.component';
import { SendingMethod } from 'types';

export const SENDING_METHODS_CONFIG: SendingMethod[] = [
  { name: 'sendFileByUpload', element: <SendFileForm /> },
];
