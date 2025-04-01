import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { bgColorAtom } from "../../store/theme";
import logo from '../../assets/img/brand/on-gacha_logo.png'

function StopModal({ isStop, setIsStop}) {
  const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);

  const closeModal = () => {
    setIsStop(false);
    localStorage.removeItem("loggedIn");
  };

  return (
    <div
      className={`${
        isStop ? "" : "hidden"
      } fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[100]`}
    >
      <div className="bg-white p-3 rounded shadow-lg w-full xxsm:w-[400px] mx-4 md:mx-0">
        <div className="flex justify-around items-center py-3">
          <img alt="..." src={logo} className="w-[180px] "/>
        </div>
        <div className="justify-between items-center border-1 rounded-md p-2 my-3 border-gray-300 mx-auto">
          <h4 className="text-lg my-4 mx-8">{t('descStop')}</h4>
        </div>
        <div>
          {/* <button
            className="hover:opacity-50 text-white py-2 px-4 rounded w-full"
            onClick={closeModal}
            style={{ backgroundColor: bgColor }}
          >
            {t("ok")}
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default StopModal;
