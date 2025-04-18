import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { bgColorAtom } from "../../store/theme";
import coinImg from "../../assets/img/icons/coin.png";

function ConfirmShippingModal({
  isOpen,
  setIsOpen,
  title,
  flag,
  desc,
  shippingPrizes,
  cashback,
  submitShipping,
}) {
  const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);

  const closeModal = () => {
    setIsOpen(false);
  };

  const submitOk = () => {
    submitShipping();
  };

  return (
    <>
      <div
        className={`${
          isOpen ? "" : "hidden"
        } fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20`}
      >
        <div className="bg-white p-3 rounded shadow-lg w-full xxsm:w-[400px] mx-4 md:mx-0">
          <div className="flex justify-around items-center py-3">
            <p className="my-2 font-bold mx-8 text-2xl text-red-600">{title}</p>
          </div>
          {/* <div className="flex justify-around text-center items-center">
            <p className="my-2 mx-8 text-lg text-red-600">{desc}</p>
          </div> */}
          {flag === 1 ? (
            <div className="flex flex-wrap justify-between items-center border-1 rounded-md p-2 my-3 border-gray-300">
              <p>{t("cashback") + " " + t("point")}</p>
              <div className="flex flex-wrap justify-end items-center p-2">
                <img alt="coin-img" src={coinImg} className="w-6 mx-1" />
                <p className="text-gray-600 font-bold">{cashback}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-around text-center items-center pb-4">
              <p className="mx-auto text-lg text-red-600">{desc}</p>
            </div>
          )}
          <div>
            <button
              className="mr-6 hover:opacity-50 text-white py-2 px-4 my-1 rounded w-full"
              onClick={submitOk}
              style={{ backgroundColor: bgColor }}
            >
              {t("confirm")}
            </button>
            <button
              className="mr-6 hover:opacity-50 bg-gray-600 text-white py-2 px-4 my-1 rounded w-full"
              onClick={closeModal}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmShippingModal;
