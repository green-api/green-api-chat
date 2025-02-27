import EditMessageModalContent from 'components/modals/edit-message-modal-content.component';
import { MessageServiceMethod } from 'types';

export const MESSAGE_SERVICE_METHODS_CONFIG: MessageServiceMethod[] = [
  { name: 'editMessage', element: <EditMessageModalContent /> },
  { name: 'deleteMessage', element: <div>test</div> },
];
