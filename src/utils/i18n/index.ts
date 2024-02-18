import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import zh from "./zh.json";

const resources = {
  "en-US": {
    translation: en,
  },
  "zh-CN": {
    translation: zh,
  },
};

i18next
  .use(LanguageDetector)
  .init({
    compatibilityJSON: "v3",
    resources,
    nsSeparator: false,
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: "zh-CN",
    detection: {
      order: ["querystring", "localStorage", "navigator"],
    },
  })
  .catch(console.error.bind(console));
