import DoubleTickIcon from 'assets/double-tick.svg?react';
import TickIcon from 'assets/tick.svg?react';
import { StatusMessage } from 'types';

export const getOutgoingStatusMessageIcon = (statusMessage: StatusMessage) => {
  switch (statusMessage) {
    case 'sent':
      return <TickIcon style={{ color: '#8696a0' }} />;

    case 'delivered':
      return <DoubleTickIcon style={{ color: '#8696a0' }} />;

    case 'read':
      return <DoubleTickIcon style={{ color: 'var(--light-primary-color)' }} />;

    default:
      return null;
  }
};
