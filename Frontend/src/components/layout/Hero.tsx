import { useTranslation } from "react-i18next";
import { Code2 } from "lucide-react";

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-6 sm:mb-8 lg:mb-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 flex items-center justify-center gap-2 flex-wrap">
        <Code2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
        <span className="whitespace-nowrap">{t("main.title")}</span>
      </h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
        {t("main.subtitle")}
      </p>
    </div>
  );
};

