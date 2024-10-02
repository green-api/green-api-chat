import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'store';
import { Themes } from 'types';
import { isPageInIframe } from 'utils';

function getInitialState() {
  if (!isPageInIframe()) return Themes.Default;

  const themeFromLocalStorage = localStorage.getItem('theme');

  if (
    themeFromLocalStorage &&
    (themeFromLocalStorage === Themes.Dark || themeFromLocalStorage === Themes.Default)
  ) {
    return themeFromLocalStorage;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Themes.Dark;
  }

  return Themes.Default;
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialState(),
  reducers: {
    setTheme: (state, action: PayloadAction<Themes>) => {
      state = action.payload;

      localStorage.setItem('theme', action.payload);

      return state;
    },
  },
});

export const themeActions = themeSlice.actions;

export default themeSlice.reducer;

export const selectTheme = (state: RootState) => state.themeReducer;
