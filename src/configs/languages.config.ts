import enIcon from 'assets/en.svg';
import heIcon from 'assets/he.svg';
import ruIcon from 'assets/ru.svg';
import trIcon from 'assets/tr.svg';

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
