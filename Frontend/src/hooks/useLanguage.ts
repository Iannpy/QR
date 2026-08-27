import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { STORAGE_KEYS } from "../constants";

/**
 * Hook personalizado para manejar el idioma
 * @returns Objeto con funciones para cambiar el idioma
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  return { currentLanguage: i18n.language, changeLanguage };
};

