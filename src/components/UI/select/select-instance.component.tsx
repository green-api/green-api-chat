import { FC, useEffect, useRef, useState, useMemo } from 'react';

import { Select, Spin } from 'antd';
import { BaseSelectRef } from 'rc-select';
import { useTranslation } from 'react-i18next';

import SelectInstanceLabel from './select-instance-label.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetInstancesQuery } from 'services/app/endpoints';
import { selectType } from 'store/slices/chat.slice';
import { selectInstance, selectInstanceList } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import { SelectInstanceItemInterface } from 'types';
import { getIsChatWorkingFromStorage } from 'utils';

const SelectInstance: FC = () => {
  const type = useAppSelector(selectType);
  const { idUser, apiTokenUser, projectId } = useAppSelector(selectUser);
  const instanceList = useAppSelector(selectInstanceList);
  const selectedInstance = useAppSelector(selectInstance);

  const { setUserSideActiveMode } = useActions();

  const { t } = useTranslation();
  const { setSelectedInstance, setActiveChat, setIsAuthorizingInstance } = useActions();

  const {
    isLoading: isLoadingInstances,
    data: instancesRequestData,
    isSuccess: isSuccessLoadingInstances,
  } = useGetInstancesQuery(
    { idUser, apiTokenUser, projectId },
    { skip: !idUser || !apiTokenUser || ['console-page', 'tab'].includes(type) }
  );

  const [instances, setInstances] = useState<SelectInstanceItemInterface[] | undefined>();
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const setPageTimerReference = useRef<ReturnType<typeof setTimeout>>();
  const selectReference = useRef<BaseSelectRef>(null);

  const limit = 10;

  const formattedInstanceList = useMemo(() => {
    if (!instanceList) return undefined;
    return instanceList.map((instance) => ({
      ...instance,
      label: <SelectInstanceLabel {...instance} />,
    }));
  }, [instanceList]);

  useEffect(() => {
    if (isLoadingInstances) return;

    if (instancesRequestData?.result && Array.isArray(instancesRequestData?.data)) {
      let countInstances = 0;

      const searchValueInLowerCase = searchValue.toLowerCase();
      const bufferInstances: SelectInstanceItemInterface[] = [];

      for (const instance of instancesRequestData.data) {
        if (instance.deleted || countInstances >= page * limit) continue;

        if (
          searchValueInLowerCase &&
          !`${instance?.idInstance}`.includes(searchValueInLowerCase) &&
          !instance.name.toLowerCase().includes(searchValueInLowerCase)
        ) {
          continue;
        }

        countInstances++;
        bufferInstances.push({ ...instance, label: <SelectInstanceLabel {...instance} /> });
      }

      setInstances(bufferInstances);

      const scrollTimer = setTimeout(() => {
        if (!selectReference.current) return;
        selectReference.current.scrollTo({ index: countInstances - limit });
      }, 100);

      return () => clearTimeout(scrollTimer);
    }

    setInstances([]);
  }, [instancesRequestData, page, searchValue, isLoadingInstances]);

  useEffect(() => {
    if (isLoadingInstances) return;

    const sourceList = formattedInstanceList?.length ? formattedInstanceList : instances;

    if (!sourceList?.length) return;

    if (selectedInstance?.idInstance) {
      const defaultInstance = sourceList.find(
        ({ idInstance }) => idInstance === selectedInstance.idInstance
      );

      if (defaultInstance && defaultInstance.idInstance !== 0) {
        setSelectedInstance({
          idInstance: defaultInstance.idInstance,
          apiTokenInstance: defaultInstance.apiTokenInstance,
          apiUrl: defaultInstance.apiUrl,
          mediaUrl: defaultInstance.mediaUrl,
          tariff: defaultInstance.tariff,
          typeInstance: defaultInstance.typeInstance,
        });
        return;
      }
    }

    const firstInstance = sourceList[0];
    setSelectedInstance({
      idInstance: firstInstance.idInstance,
      apiTokenInstance: firstInstance.apiTokenInstance,
      apiUrl: firstInstance.apiUrl,
      mediaUrl: firstInstance.mediaUrl,
      tariff: firstInstance.tariff,
      typeInstance: firstInstance.typeInstance,
    });
  }, [formattedInstanceList, instances, isSuccessLoadingInstances, isLoadingInstances]);

  if (isLoadingInstances || !instances) {
    return <Spin />;
  }

  return (
    <Select
      size="large"
      showSearch
      style={{
        margin: type === 'console-page' ? '16px 0' : '8px 0',
        width: '100%',
      }}
      placeholder={t('SELECT_INSTANCE_PLACEHOLDER')}
      value={selectedInstance?.idInstance}
      options={formattedInstanceList ?? instances}
      ref={selectReference}
      filterOption={(inputValue, option) =>
        `${option?.idInstance}`.includes(inputValue) ||
        `${option?.name.toLowerCase()}`.includes(inputValue.toLowerCase())
      }
      onPopupScroll={({ target }) => {
        const typedTarget = target as HTMLElement;
        if (
          typedTarget.scrollTop + typedTarget.offsetHeight + 50 >= typedTarget.scrollHeight &&
          instancesRequestData?.result &&
          instancesRequestData.data.length > page * limit
        ) {
          clearTimeout(setPageTimerReference.current);
          setPageTimerReference.current = setTimeout(
            () => setPage((previousPage) => previousPage + 1),
            200
          );
        }
      }}
      onSearch={(value) => {
        setSearchValue(value);
        setPage(1);
      }}
      fieldNames={{ value: 'idInstance' }}
      onSelect={(_, option: SelectInstanceItemInterface) => {
        const isChatWorkingFromStorage = getIsChatWorkingFromStorage(option.idInstance);
        window.parent.postMessage(
          {
            event: 'selectInstance',
            selectedInstance: {
              idInstance: option.idInstance,
              apiTokenInstance: option.apiTokenInstance,
              apiUrl: option.apiUrl,
              mediaUrl: option.mediaUrl,
              typeInstance: option.typeInstance,
            },
          },
          '*'
        );

        setSelectedInstance({
          idInstance: option.idInstance,
          apiTokenInstance: option.apiTokenInstance,
          apiUrl: option.apiUrl,
          mediaUrl: option.mediaUrl,
          tariff: option.tariff,
          isChatWorking: isChatWorkingFromStorage,
          typeInstance: option.typeInstance,
        });

        setIsAuthorizingInstance(false);
        setUserSideActiveMode('chats');

        setActiveChat(null);
      }}
    />
  );
};

export default SelectInstance;
