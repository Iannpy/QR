import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import { Modal } from "./Modal";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal = ({ isOpen, onClose }: ComingSoonModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("header.login")}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t("alerts.comingSoon")}
        </p>
      </div>
    </Modal>
  );
};

