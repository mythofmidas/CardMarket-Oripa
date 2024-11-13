import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { bgColorAtom } from "../../store/theme";

function SucceedModal({ isOpen, setIsOpen, text }) {
  const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.removeItem("loggedIn");
  };

  return (
    <div
      className={`${
        isOpen ? "" : "hidden"
      } fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20`}
    >
      <div className="bg-white p-3 rounded shadow-lg">
        <div className="flex justify-around items-center">
          <h4 className="text-lg my-4 mx-8">{text}</h4>
        </div>
        <div>
          <button
            className="mr-6 hover:opacity-50 text-white py-2 px-4 rounded w-full"
            onClick={closeModal}
            style={{ backgroundColor: bgColor }}
          >
            {t("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SucceedModal;
