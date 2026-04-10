import { useDeferredValue, useMemo } from 'react';

import { getContactDisplayName } from './contacts.helpers';
import { ContactListItemInterface } from 'types';

export const useContactsFilter = (
  contacts: ContactListItemInterface[],
  searchQuery: string
): ContactListItemInterface[] => {
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const searchableContacts = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return contacts.map((contact) => ({
      contact,
      displayName: getContactDisplayName(contact).toLowerCase(),
      whatsappProfileName: (contact.name || '').toLowerCase(),
      chatId: contact.id.toLowerCase(),
    }));
  }, [contacts, deferredSearchQuery]);

  return useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return contacts;
    }

    return searchableContacts
      .filter(
        (item) =>
          item.displayName.includes(normalizedQuery) ||
          item.whatsappProfileName.includes(normalizedQuery) ||
          item.chatId.includes(normalizedQuery)
      )
      .map((item) => item.contact);
  }, [contacts, deferredSearchQuery, searchableContacts]);
};
