import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

export const WhatIsQR = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md mb-6 sm:mb-8 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t("sections.whatIsQR.title")}
        </h2>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
        {t("sections.whatIsQR.description1")}
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
        {t("sections.whatIsQR.description2")}
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
        {t("sections.whatIsQR.description3")}
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
        {t("sections.whatIsQR.description4")}
      </p>
    </section>
  );
};

