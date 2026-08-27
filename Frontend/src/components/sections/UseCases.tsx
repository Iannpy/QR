import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";

const useCaseKeys = ["marketing", "social", "business", "restaurant", "events", "support"] as const;

export const UseCases = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md mb-6 sm:mb-8 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t("sections.useCases.title")}
        </h2>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
        {t("sections.useCases.intro")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {useCaseKeys.map((key) => (
          <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t(`sections.useCases.${key}.title`)}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {t(`sections.useCases.${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

