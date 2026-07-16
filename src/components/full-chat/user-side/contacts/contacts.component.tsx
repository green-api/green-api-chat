import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, List, Spin, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';

import ContactFormModal from './contact-form-modal.component';
import ContactsListItem from './contacts-list-item.component';
import {
  CONTACTS_PAGE_SIZE,
  ContactFormValues,
  getContactApiErrorDetails,
  normalizeChatId,
} from './contacts.helpers';
import { useContactsFilter } from './use-contacts-filter.hook';
import { Search } from 'components/UI/search.component';
import { useAppSelector, useFormWithLanguageValidation } from 'hooks';
import {
  useAddContactMutation,
  useCheckWhatsappMutation,
  useDeleteContactMutation,
  useEditContactMutation,
  useGetContactsQuery,
} from 'services/green-api/endpoints';
import { selectInstance, selectTypeInstance } from 'store/slices/instances.slice';
import { ContactListItemInterface } from 'types';
import { getPhoneNumberFromChatId } from 'utils';
import { isLidChatId } from 'utils/chat-id.utils';

const Contacts = () => {
  const { t } = useTranslation();

  const instanceCredentials = useAppSelector(selectInstance);
  const typeInstance = useAppSelector(selectTypeInstance);
  const isWhatsApp = typeInstance === 'whatsapp';

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedContact, setEditedContact] = useState<ContactListItemInterface | null>(null);
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState<string | null>(null);
  const [localContacts, setLocalContacts] = useState<ContactListItemInterface[]>([]);
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form] = useFormWithLanguageValidation<ContactFormValues>();

  const [checkWhatsapp] = useCheckWhatsappMutation();
  const [addContact, { isLoading: isAddContactLoading }] = useAddContactMutation();
  const [editContact, { isLoading: isEditContactLoading }] = useEditContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  const skipGetContactsQuery =
    !instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance || !isWhatsApp;

  const {
    data: contactsData = [],
    isLoading: isContactsLoading,
    isFetching: isContactsFetching,
    error: contactsLoadingError,
    refetch,
  } = useGetContactsQuery(
    {
      ...instanceCredentials,
      group: false,
    },
    {
      skip: skipGetContactsQuery,
    }
  );

  const isEditMode = !!editedContact;
  const isFormSubmitLoading = isAddContactLoading || isEditContactLoading;

  const contacts = useMemo(
    () => contactsData.filter((contact) => contact.type === 'user'),
    [contactsData]
  );

  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

  const refetchContactsWithDelay = useCallback(async () => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }

    await new Promise<void>((resolve) => {
      refetchTimeoutRef.current = setTimeout(async () => {
        await refetch();
        resolve();
      }, 500);
    });
  }, [refetch]);

  const filteredContacts = useContactsFilter(localContacts, searchQuery);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (editedContact) {
      form.setFieldsValue({
        chatId: editedContact.id,
        contactName: editedContact.contactName || editedContact.name || '',
        contactSecondName: '',
      });

      return;
    }

    form.resetFields();
  }, [editedContact, form, isModalOpen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditedContact(null);
    form.resetFields();
  }, [form]);

  const openAddModal = useCallback(() => {
    setEditedContact(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((contact: ContactListItemInterface) => {
    setEditedContact(contact);
    setIsModalOpen(true);
  }, []);

  const clearFormErrors = () => {
    form.setFields([
      { name: 'chatId', errors: [] },
      { name: 'contactName', errors: [] },
      { name: 'contactSecondName', errors: [] },
    ]);
  };

  const validateWhatsappAvailability = async (chatId: string): Promise<boolean> => {
    if (isLidChatId(chatId)) return true;

    const phoneNumber = getPhoneNumberFromChatId(chatId).replace(/\D/g, '');

    if (!phoneNumber) {
      form.setFields([{ name: 'chatId', errors: [t('CONTACT_PHONE_INVALID_MESSAGE')] }]);

      return false;
    }

    const { data, error } = await checkWhatsapp({
      ...instanceCredentials,
      phoneNumber,
    });

    if (error) {
      const errorDetails = getContactApiErrorDetails(error, t);

      if (errorDetails.field) {
        form.setFields([{ name: errorDetails.field, errors: [errorDetails.message] }]);
      } else {
        message.error(errorDetails.message);
      }

      return false;
    }

    if (!data?.existsWhatsapp) {
      form.setFields([{ name: 'chatId', errors: [t('PHONE_DOES_NOT_HAVE_WHATSAPP')] }]);

      return false;
    }

    return true;
  };

  const handleSubmit = async (values: ContactFormValues) => {
    clearFormErrors();

    const normalizedChatId = normalizeChatId(values.chatId);

    if (!normalizedChatId || normalizedChatId.includes('@g.us')) {
      form.setFields([{ name: 'chatId', errors: [t('CONTACT_PHONE_INVALID_MESSAGE')] }]);

      return;
    }

    const isContactAlreadyInList = localContacts.some((contact) => contact.id === normalizedChatId);

    if (!isEditMode && isContactAlreadyInList) {
      form.setFields([{ name: 'chatId', errors: [t('CONTACT_ALREADY_EXISTS')] }]);

      return;
    }

    if (isEditMode && !isContactAlreadyInList) {
      form.setFields([{ name: 'chatId', errors: [t('CONTACT_NOT_FOUND')] }]);

      return;
    }

    const isWhatsappAvailable = await validateWhatsappAvailability(normalizedChatId);

    if (!isWhatsappAvailable) {
      return;
    }

    const requestBody = {
      ...instanceCredentials,
      chatId: normalizedChatId,
      firstName: values.contactName.trim(),
      ...(values.contactSecondName?.trim() ? { lastName: values.contactSecondName.trim() } : {}),
      saveInAddressbook: true,
    };

    const previousContacts = localContacts;
    const optimisticContact: ContactListItemInterface = {
      id: normalizedChatId,
      name: values.contactName.trim(),
      contactName: values.contactName.trim(),
      type: 'user',
    };

    setLocalContacts((prev) => {
      if (isEditMode) {
        return prev.map((contact) =>
          contact.id === normalizedChatId ? { ...contact, ...optimisticContact } : contact
        );
      }

      return [optimisticContact, ...prev.filter((contact) => contact.id !== normalizedChatId)];
    });

    const response = isEditMode ? await editContact(requestBody) : await addContact(requestBody);

    if (response.error) {
      setLocalContacts(previousContacts);
      const errorDetails = getContactApiErrorDetails(response.error, t);

      if (errorDetails.field) {
        form.setFields([{ name: errorDetails.field, errors: [errorDetails.message] }]);
      } else {
        message.error(errorDetails.message);
      }

      return;
    }

    await refetchContactsWithDelay();
    message.success(t(isEditMode ? 'CONTACT_UPDATED_SUCCESS' : 'CONTACT_CREATED_SUCCESS'));
    closeModal();
  };

  const handleDelete = useCallback(
    async (chatId: string) => {
      if (!localContacts.some((contact) => contact.id === chatId)) {
        message.error(t('CONTACT_NOT_FOUND'));

        return;
      }

      setPendingDeleteChatId(chatId);
      const previousContacts = localContacts;
      setLocalContacts((prev) => prev.filter((contact) => contact.id !== chatId));

      try {
        const response = await deleteContact({
          ...instanceCredentials,
          chatId,
        });

        if (response.error) {
          setLocalContacts(previousContacts);
          const errorDetails = getContactApiErrorDetails(response.error, t);
          message.error(errorDetails.message);

          return;
        }

        await refetchContactsWithDelay();
        message.success(t('CONTACT_DELETED_SUCCESS'));
      } finally {
        setPendingDeleteChatId(null);
      }
    },
    [deleteContact, instanceCredentials, localContacts, refetchContactsWithDelay, t]
  );

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  if (!instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance) {
    return (
      <Empty
        className="empty p-10"
        description={t('SELECT_INSTANCE_PLACEHOLDER')}
        style={{ marginTop: 40 }}
      />
    );
  }

  if (!isWhatsApp) {
    return (
      <Empty
        className="empty p-10"
        description={t('CONTACTS_UNAVAILABLE_TELEGRAM')}
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <Flex className="contacts-section" vertical>
      <Flex className="contacts-section__header" align="center" justify="space-between" gap={8}>
        <Typography.Title level={2} className="contacts-section__title">
          {t('CONTACTS')}
        </Typography.Title>
        <Flex align="center" gap={8}>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isContactsFetching && !isContactsLoading}
            title={t('REFRESH_PAGE')}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            {t('ADD_CONTACT')}
          </Button>
        </Flex>
      </Flex>

      <Search searchQuery={searchQuery} t={t} handleChange={handleSearchChange} />

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
            renderItem={(contact) => (
              <ContactsListItem
                contact={contact}
                instanceCredentials={instanceCredentials}
                isDeleteLoading={pendingDeleteChatId === contact.id}
                onEdit={openEditModal}
                onDelete={handleDelete}
                t={t}
              />
            )}
          />
        )}
      </div>

      <ContactFormModal
        t={t}
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        isLoading={isFormSubmitLoading}
        form={form}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Flex>
  );
};

export default Contacts;
