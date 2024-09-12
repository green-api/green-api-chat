import enIcon from 'assets/en.svg';
import heIcon from 'assets/he.svg';
import ruIcon from 'assets/ru.svg';

type Language = {
  name: string;
  title: string;
  icon: string;
};

export const LANGUAGES: Language[] = [
  {
    name: 'ru',
    title: 'RUSSIAN',
    icon: ruIcon,
  },
  {
    name: 'en',
    title: 'ENGLISH',
    icon: enIcon,
  },
  {
    name: 'he',
    title: 'HEBREW',
    icon: heIcon,
  },
];
