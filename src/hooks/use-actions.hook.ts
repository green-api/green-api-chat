import { bindActionCreators } from '@reduxjs/toolkit';

import { useAppDispatch } from 'hooks';
import { actionCreators } from 'store/actions';

export const useActions = () => {
  const dispatch = useAppDispatch();
  return bindActionCreators(actionCreators, dispatch);
};
