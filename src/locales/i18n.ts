import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en/translation.json";
import ko from "./ko/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: "en", // 기본 언어
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
