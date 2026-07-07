import { useTranslation } from 'react-i18next';
import operativosES from '../data/operativos.json';
import operativosEN from '../locales/en/operativos.json';
import operativosJA from '../locales/ja/operativos.json';

export const useOperativos = () => {
  const { i18n } = useTranslation();
  if (i18n.language.startsWith('en')) return operativosEN;
  if (i18n.language.startsWith('ja')) return operativosJA;
  return operativosES; // fallback to Spanish
};
