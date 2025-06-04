import { Component, ReactNode, ErrorInfo } from 'react';

import { Button, Result } from 'antd';
import { t } from 'i18next';

interface ErrorBoundaryProperties {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    const { error } = this.state;

    if (error) {
      const errorMessage = t(error.message);
      const displayMessage =
        errorMessage === error.message
          ? t('UNEXPECTED_ERROR') + ', ' + error.message
          : errorMessage;

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <Result
            status={404}
            title={<span style={{ color: 'var(--text-color)' }}>{displayMessage}</span>}
          />

          <Button type="primary" onClick={() => window.location.reload()}>
            {t('REFRESH_PAGE')}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
