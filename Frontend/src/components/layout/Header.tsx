import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Code2, Globe, User, Moon, Sun, History, Menu, X, Clock, LayoutDashboard, LogOut } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useLanguage } from "../../hooks/useLanguage";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHistoryPage = location.pathname === "/history";
  const isDashboardPage = location.pathname === "/dashboard";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline text-lg font-bold text-gray-900 dark:text-white">
                {t("header.title")}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                {authed && !isDashboardPage && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Panel</span>
                  </button>
                )}

                {!isHistoryPage && (
                  <button
                    onClick={() => navigate("/history")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <History className="h-4 w-4" />
                    <span>{t("header.history")}</span>
                  </button>
                )}

                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-center w-10 h-10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="relative isolate">
                  <select
                    value={currentLanguage}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 h-10 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex items-center"
                  >
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="pt">🇵🇹 Português</option>
                  </select>
                  <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                </div>

                {authed ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Salir</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>{t("header.login")}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Code2 className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-bold text-white">{t("header.title")}</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-gray-700 transition-colors" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col h-[calc(100%-80px)] p-6">
              <div className="flex-1 space-y-2">
                {authed && (
                  <button onClick={() => handleNavigate("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">Panel</span>
                  </button>
                )}
                {!isHistoryPage && (
                  <button onClick={() => handleNavigate("/history")} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{t("header.history")}</span>
                  </button>
                )}
                <button onClick={() => { toggleDarkMode(); }} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                  {darkMode ? <><Sun className="h-5 w-5" /><span className="font-medium">{t("header.lightMode")}</span></> : <><Moon className="h-5 w-5" /><span className="font-medium">{t("header.darkMode")}</span></>}
                </button>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-5 w-5 text-white" />
                    <span className="font-medium text-white">{t("header.language")}</span>
                  </div>
                  <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="pt">🇵🇹 Português</option>
                  </select>
                </div>
              </div>

              {authed ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg">
                  <LogOut className="h-5 w-5" />
                  <span>Salir</span>
                </button>
              ) : (
                <button onClick={() => { handleNavigate("/login"); }} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg">
                  <User className="h-5 w-5" />
                  <span>{t("header.login")}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
