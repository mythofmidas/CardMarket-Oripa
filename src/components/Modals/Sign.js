import { useTranslation } from "react-i18next";

const Sign = ({ isOpen, onClose, msg, bgColor }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
      <div className="bg-white p-8 rounded shadow-lg">
        <p className="text-center text-xl w-[250px] mb-4">{t(msg)}</p>
        <div className="flex justify-center">
          <button
            style={{ backgroundColor: bgColor ? bgColor : "#dc3545" }}
            className=" bg-gray-600 hover:bg-opacity-50 hover:opacity-50 text-white py-2 px-4 rounded"
            onClick={onClose}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Sign;
