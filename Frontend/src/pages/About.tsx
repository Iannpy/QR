import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Code2, Heart, Users, Target, Zap, ArrowLeft } from "lucide-react";
import { Footer } from "../components/layout/Footer";

export const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t("about.title")}
            </h1>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {t("about.intro")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {t("about.mission.title")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("about.mission.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                {t("about.features.title")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t("about.features.item1")}</li>
                <li>{t("about.features.item2")}</li>
                <li>{t("about.features.item3")}</li>
                <li>{t("about.features.item4")}</li>
                <li>{t("about.features.item5")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                {t("about.community.title")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("about.community.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                {t("about.openSource.title")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("about.openSource.content")}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer   />
    </div>
  );
};

