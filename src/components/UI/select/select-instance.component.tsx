import { FC, useEffect, useState, useMemo, useRef } from 'react';

import { Flex, Spin } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useTranslation } from 'react-i18next';

import SelectInstanceLabel from './select-instance-label.component';
import { Search } from '../search.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetInstancesQuery } from 'services/app/endpoints';
import { selectType } from 'store/slices/chat.slice';
import { selectInstance, selectInstanceList } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import { getIsChatWorkingFromStorage } from 'utils';

function moveSelectedToTop<T extends { idInstance: number }>(list: T[], selectedId?: number): T[] {
  if (!selectedId) return list;
  const index = list.findIndex((i) => i.idInstance === selectedId);
  if (index <= 0) return list;
  const copy = [...list];
  const [target] = copy.splice(index, 1);
  copy.unshift(target);
  return copy;
}

const SelectInstance: FC = () => {
  const type = useAppSelector(selectType);
  const { idUser, apiTokenUser, projectId } = useAppSelector(selectUser);
  const instanceList = useAppSelector(selectInstanceList);
  const selectedInstance = useAppSelector(selectInstance);

  const { setUserSideActiveMode } = useActions();
  const { setSelectedInstance, setActiveChat, setIsAuthorizingInstance } = useActions();
  const { t } = useTranslation();

  const { isLoading: isLoadingInstances } = useGetInstancesQuery(
    { idUser, apiTokenUser, projectId },
    { skip: !idUser || !apiTokenUser || ['console-page', 'tab'].includes(type) }
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [listHeight, setListHeight] = useState(window.innerHeight);

  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const recalcHeight = () => {
      if (!searchRef.current) return;
      const rect = searchRef.current.getBoundingClientRect();
      const available = window.innerHeight - rect.bottom - 20;
      setListHeight(available > 0 ? available : 0);
    };

    recalcHeight();
    window.addEventListener('resize', recalcHeight);
    return () => window.removeEventListener('resize', recalcHeight);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.replace(/\D/g, ''));
  };

  const rawList = useMemo(() => {
    return moveSelectedToTop(
      instanceList?.filter((i) => !i.deleted) ?? [],
      selectedInstance?.idInstance
    );
  }, [instanceList, selectedInstance?.idInstance]);

  const filteredList = useMemo(() => {
    if (!searchQuery) return rawList;
    return rawList.filter((i) => String(i.idInstance).includes(searchQuery));
  }, [rawList, searchQuery]);

  useEffect(() => {
    if (!filteredList.length) return;

    const currentId = selectedInstance?.idInstance;
    const found = currentId ? filteredList.find((i) => i.idInstance === currentId) : null;
    const next = found ?? filteredList[0];

    if (next.idInstance === currentId) return;

    setSelectedInstance({
      idInstance: next.idInstance,
      apiTokenInstance: next.apiTokenInstance,
      apiUrl: next.apiUrl,
      mediaUrl: next.mediaUrl,
      tariff: next.tariff,
      typeInstance: next.typeInstance,
    });
  }, [filteredList, selectedInstance?.idInstance]);

  if (isLoadingInstances || !instanceList) {
    return <Spin />;
  }

  return (
    <Flex vertical gap={8} style={{ height: '100vh' }}>
      <div ref={searchRef}>
        <Search searchQuery={searchQuery} t={t} handleChange={handleSearchChange} />
      </div>

      <div style={{ margin: '0 12px' }}>
        <VirtualList data={filteredList} itemHeight={56} itemKey="idInstance" height={listHeight}>
          {(item) => (
            <div
              key={item.idInstance}
              onClick={() => {
                const isChatWorking = getIsChatWorkingFromStorage(item.idInstance);

                window.parent.postMessage(
                  {
                    event: 'selectInstance',
                    selectedInstance: {
                      idInstance: item.idInstance,
                      apiTokenInstance: item.apiTokenInstance,
                      apiUrl: item.apiUrl,
                      mediaUrl: item.mediaUrl,
                      typeInstance: item.typeInstance,
                    },
                  },
                  '*'
                );

                setSelectedInstance({
                  idInstance: item.idInstance,
                  apiTokenInstance: item.apiTokenInstance,
                  apiUrl: item.apiUrl,
                  mediaUrl: item.mediaUrl,
                  tariff: item.tariff,
                  isChatWorking,
                  typeInstance: item.typeInstance,
                });

                setIsAuthorizingInstance(false);
                setUserSideActiveMode('chats');
                setActiveChat(null);
              }}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                background:
                  selectedInstance?.idInstance === item.idInstance
                    ? 'var(--authorized-header-color)'
                    : 'transparent',
              }}
            >
              <SelectInstanceLabel {...item} />
            </div>
          )}
        </VirtualList>
      </div>
    </Flex>
  );
};

export default SelectInstance;
