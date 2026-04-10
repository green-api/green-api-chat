import type { i18n } from 'i18next';

import { ContactListItemInterface } from 'types';
import { getErrorMessage, getPhoneNumberFromChatId, isApiError } from 'utils';

export interface ContactFormValues {
  chatId: string;
  contactName: string;
  contactSecondName?: string;
}

export interface ContactApiErrorDetails {
  message: string;
  field?: keyof ContactFormValues;
}

export const CONTACTS_PAGE_SIZE = 20;

export const normalizeChatId = (chatId: string): string => {
  const trimmedValue = chatId.trim().toLowerCase();

  if (!trimmedValue) return '';

  if (trimmedValue.includes('@')) {
    return trimmedValue;
  }

  const digitsOnly = trimmedValue.replace(/\D/g, '');

  return digitsOnly ? `${digitsOnly}@c.us` : trimmedValue;
};

export const getContactDisplayName = (contact: ContactListItemInterface) =>
  contact.contactName || contact.name || getPhoneNumberFromChatId(contact.id);

const getApiDataMessage = (error: unknown): string => {
  if (!isApiError(error)) return '';

  if (typeof error.data === 'string') {
    return error.data;
  }

  if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
    const message = (error.data as { message?: unknown }).message;

    return typeof message === 'string' ? message : '';
  }

  return '';
};

export const getContactApiErrorDetails = (error: unknown, t: i18n['t']): ContactApiErrorDetails => {
  const errorDataMessage = getApiDataMessage(error);
  const normalizedErrorDataMessage = errorDataMessage.toLowerCase();

  if (
    normalizedErrorDataMessage.includes('already') &&
    normalizedErrorDataMessage.includes('exist')
  ) {
    return { message: t('CONTACT_ALREADY_EXISTS'), field: 'chatId' };
  }

  if (
    normalizedErrorDataMessage.includes('whatsapp') &&
    (normalizedErrorDataMessage.includes('not') ||
      normalizedErrorDataMessage.includes('invalid') ||
      normalizedErrorDataMessage.includes('exist'))
  ) {
    return { message: t('PHONE_DOES_NOT_HAVE_WHATSAPP'), field: 'chatId' };
  }

  if (
    normalizedErrorDataMessage.includes('not found') ||
    normalizedErrorDataMessage.includes('does not exist')
  ) {
    return { message: t('CONTACT_NOT_FOUND'), field: 'chatId' };
  }

  if (isApiError(error)) {
    switch (error.status) {
      case 466:
        return { message: t('CHECK_WHATSAPP_QUOTE_REACHED'), field: 'chatId' };
      case 404:
        return { message: t('CONTACT_NOT_FOUND'), field: 'chatId' };
      case 500:
        return { message: t('CONTACT_SERVER_ERROR') };
      case 400:
        if (errorDataMessage) {
          return { message: errorDataMessage };
        }

        return { message: t('CONTACT_REQUEST_ERROR'), field: 'chatId' };
      default:
        return { message: getErrorMessage(error, t) || t('UNKNOWN_ERROR') };
    }
  }

  return { message: t('UNKNOWN_ERROR') };
};
