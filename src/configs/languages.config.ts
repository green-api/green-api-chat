import enIcon from 'assets/flags/en.svg';
import heIcon from 'assets/flags/he.svg';
import ruIcon from 'assets/flags/ru.svg';
import trIcon from 'assets/flags/tr.svg';

type Language = {
  name: string;
  title: string;
  icon: string;
};

export const LANGUAGES: Language[] = [
  {
    name: 'ru',
    title: 'Русский',
    icon: ruIcon,
  },
  {
    name: 'en',
    title: 'English',
    icon: enIcon,
  },
  {
    name: 'he',
    title: 'עברית',
    icon: heIcon,
  },
  {
    name: 'tr',
    title: 'Türkçe',
    icon: trIcon,
  },
];
