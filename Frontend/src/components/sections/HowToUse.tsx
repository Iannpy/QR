import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";

export const HowToUse = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md mb-6 sm:mb-8 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t("sections.howToUse.title")}
        </h2>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
              {step}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t(`sections.howToUse.step${step}.title`)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                {t(`sections.howToUse.step${step}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

