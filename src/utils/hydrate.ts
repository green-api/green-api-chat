import { Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { RootState } from 'store';

export function isHydrateAction(
  action: Action
): action is Action<typeof REHYDRATE> & { key: string; payload: RootState; err: unknown } {
  return action.type === REHYDRATE;
}
