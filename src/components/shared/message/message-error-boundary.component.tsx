import React from 'react';

import { withTranslation, WithTranslation } from 'react-i18next';

import TextMessage from './text-message.component';
import { TypeConnectionMessage } from 'types';

interface MessageErrorBoundaryProps extends WithTranslation {
  type: TypeConnectionMessage;
  jsonMessage: string;
  children: React.ReactNode;
}

interface MessageErrorBoundaryState {
  hasError: boolean;
}

class MessageErrorBoundary extends React.Component<
  MessageErrorBoundaryProps,
  MessageErrorBoundaryState
> {
  constructor(props: MessageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MessageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('Ошибка при рендере сообщения:', error, info);
  }

  render() {
    const { hasError } = this.state;
    const { type, jsonMessage, t, children } = this.props;

    if (hasError) {
      return (
        <TextMessage
          textMessage={t('UNABLE_TO_DISPLAY_MESSAGE', {
            defaultValue: 'Невозможно отобразить сообщение',
          })}
          typeMessage="textMessage"
          jsonMessage={jsonMessage}
          type={type}
        />
      );
    }

    return children;
  }
}

export default withTranslation()(MessageErrorBoundary);
