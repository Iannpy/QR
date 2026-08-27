import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Footer } from "../components/layout/Footer";

export const FAQ = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t("history.back")}</span>
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t("faq.title")}
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t("faq.subtitle")}
          </p>

          <div className="space-y-4">
            {faqItems.map((index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                    {t(`faq.question${index}`)}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {t(`faq.answer${index}`)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

