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

  const { t } = useTranslation();
  const { setSelectedInstance, setActiveChat } = useActions();

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
    if (isLoadingInstances || !instances?.length) return;

    if (instancesRequestData?.result && selectedInstance?.idInstance) {
      const defaultInstance = instancesRequestData.data.find(
        ({ idInstance }) => idInstance === selectedInstance.idInstance
      );

      if (defaultInstance) {
        setSelectedInstance({
          idInstance: defaultInstance.idInstance,
          apiTokenInstance: defaultInstance.apiTokenInstance,
          apiUrl: defaultInstance.apiUrl,
          mediaUrl: defaultInstance.mediaUrl,
          tariff: defaultInstance.tariff,
          typeInstance: defaultInstance.typeInstance,
        });
      }

      return;
    }

    setSelectedInstance({
      idInstance: instances[0].idInstance,
      apiTokenInstance: instances[0].apiTokenInstance,
      apiUrl: instances[0].apiUrl,
      mediaUrl: instances[0].mediaUrl,
      tariff: instances[0].tariff,
      typeInstance: instances[0].typeInstance,
    });
  }, [instances, isSuccessLoadingInstances, isLoadingInstances]);

  if (isLoadingInstances || !instances) {
    return <Spin />;
  }

  return (
    <Select
      size="large"
      showSearch
      style={{
        margin: type === 'console-page' ? '5px 0' : '8px 0',
        padding: '0 5px',
        width: type === 'console-page' ? '80%' : '100%',
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

        setSelectedInstance({
          idInstance: option.idInstance,
          apiTokenInstance: option.apiTokenInstance,
          apiUrl: option.apiUrl,
          mediaUrl: option.mediaUrl,
          tariff: option.tariff,
          isChatWorking: isChatWorkingFromStorage,
          typeInstance: option.typeInstance,
        });

        setActiveChat(null);
      }}
    />
  );
};

export default SelectInstance;
