import { FC, useCallback, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

import { Empty, Flex, List, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import ContactFormModal from './contact-form-modal.component';
import ContactsListItem from './contacts-list-item.component';
import { CONTACTS_PAGE_SIZE, getContactApiErrorDetails } from './contacts.helpers';
import { useContactsFilter } from './use-contacts-filter.hook';
import { Search } from 'components/UI/search.component';
import { useAppSelector } from 'hooks';
import { useGetContactsQuery } from 'services/green-api/endpoints';
import { selectInstance, selectTypeInstance } from 'store/slices/instances.slice';

const ContactsList: FC = () => {
  const { t } = useTranslation();

  const instanceCredentials = useAppSelector(selectInstance);
  const typeInstance = useAppSelector(selectTypeInstance);
  const isWhatsApp = typeInstance === 'whatsapp';
  const isTelegram = typeInstance === 'telegram';

  const [searchQuery, setSearchQuery] = useState('');

  const skipGetContactsQuery =
    !instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance || isTelegram;

  const {
    data: contactsData = [],
    isLoading: isContactsLoading,
    error: contactsLoadingError,
  } = useGetContactsQuery(
    {
      ...instanceCredentials,
      group: isWhatsApp ? false : undefined,
    },
    {
      skip: skipGetContactsQuery,
    }
  );

  const contacts = useMemo(
    () => contactsData.filter((contact) => contact.type === 'user'),
    [contactsData]
  );

  const filteredContacts = useContactsFilter(contacts, searchQuery);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <>
      <Search searchQuery={searchQuery} handleChange={handleSearchChange} />

      <div className="contacts-section__list-wrapper">
        {contactsLoadingError && !contactsData.length ? (
          <Empty
            className="empty p-10"
            description={getContactApiErrorDetails(contactsLoadingError, t).message}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : isContactsLoading ? (
          <Flex className="contacts-section__loader" align="center" justify="center">
            <Spin size="large" />
          </Flex>
        ) : (
          <List
            className="contacts-section__list"
            dataSource={filteredContacts}
            rowKey={(contact) => contact.id}
            pagination={{
              pageSize: CONTACTS_PAGE_SIZE,
              showSizeChanger: false,
              showLessItems: true,
            }}
            locale={{
              emptyText: <Empty className="empty p-10" description={t('CONTACTS_EMPTY')} />,
            }}
            renderItem={(contact) => <ContactsListItem contact={contact} />}
          />
        )}
      </div>

      <ContactFormModal />
    </>
  );
};

export default ContactsList;
