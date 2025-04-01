import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import api from "../../utils/api";
import { bgColorAtom } from "../../store/theme";
import { setAuthToken } from "../../utils/setHeader";
import usePersistedUser from "../../store/usePersistedUser";

import Spinner from "../Others/Spinner";
import Card from "./Card";
import ConfirmShippingModal from "../Modals/ConfirmShippingModal";
import CheckShippingModal from "../Modals/CheckShipingModal";
import { showToast } from "../../utils/toastUtil";
import { testAtom } from "../../store/test";
import { gachasAtom } from "../../store/gachas";
import StopModal from "../Modals/StopModal";

const NotSelected = ({ initialPrizes }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);
  const [user] = usePersistedUser();

  const [cashback, setCashback] = useState(0);
  const [totalcash, setTotalcash] = useState(0);
  const [shippingPrizes, setShippingPrizes] = useState([]);
  const [returningPrizes, setReturningPrizes] = useState([]);
  const [notSelectedPrizes, setNotSelectedPrizes] = useState([]);
  const [spinFlag, setSpinFlag] = useState(false);
  const [shipAddress, setShipAddress] = useState(null);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenReturnModal, setIsOpenReturnModal] = useState(false);
  const [isOpenCheckModal, setIsCheckOpenModal] = useState(false);
  const [check, setCheck] = useState(false);
  const [testmode] = useAtom(testAtom);
  const [,setGachas] = useAtom(gachasAtom);
  const [isStop, setIsStop] = useState(false);

  useEffect(() => {
    setInitialData();
  }, [initialPrizes]);

  useEffect(() => {
    if (check) onChangePrize('all');
    else onChangePrize('never');
  }, [check])

  const setInitialData = async () => {
    setAuthToken();

    try {
      setSpinFlag(true);
      const res = await api.get(`user/obtainedPrizes/${user?._id}`);
      setSpinFlag(false);

      if (res.data.status === 1 && res.data.shipAddress) {
        setShipAddress(res.data.shipAddress);
      }
      let tempPrizes = [];
      if (initialPrizes) {
        tempPrizes = initialPrizes;
      } else {
        if (res.data.status === 1) {
          tempPrizes = res.data.obtainedPrizes;
          tempPrizes = tempPrizes.filter(
            (item) => item.kind==='rubbish' || item.deliverStatus === "notSelected"
          );
        }
      }
      let total = 0;
      tempPrizes.map(item => total += item.cashback);
      setTotalcash(total);

      // sort array based on priz kind
      const order = ["last_prize", "round_number_prize", "extra_prize"];
      tempPrizes.sort((a, b) => {
        const indexA = order.indexOf(a.kind);
        const indexB = order.indexOf(b.kind);

        if (indexA === -1 && indexB === -1) return 0; // both are not in the order
        if (indexA === -1) return 1; // a is not in the order, b comes first
        if (indexB === -1) return -1; // b is not in the order, a comes first

        return indexA - indexB; // sort based on the defined order
      });

      setNotSelectedPrizes(tempPrizes);
      setReturningPrizes(tempPrizes);
      calcCashbak(tempPrizes);
    } catch (error) {}
  };

  // calculate total cashback of prize to return
  const calcCashbak = (prizes) => {
    let total = 0;
    for (let index = 0; index < prizes.length; index++) {
      const element = prizes[index];
      total += element.cashback;
      prizes[index].selected = false;
    }
    setCashback(total);
  };

  // check shipment
  const checkShipment = () => {
    // if (shippingPrizes.length === 0) {
    //   // return all prizes
    //   setIsConfirmOpenModal(true);
    // } else {
    //   console.log("go to ship address page");
    // }
    if (testmode) {
      showToast(t("thisTestmode"), "error");
      return;
    }
    if (shipAddress) setIsOpenConfirmModal(true);
    else setIsCheckOpenModal(true);
    // if (!shipAddress) {
    //   setIsCheckOpenModal(true);
    // } else {
    //   setIsConfirmOpenModal(true);
    // }
  };

  const checkReturn = () => {
    if (testmode) {
      showToast(t("thisTestmode"), "error");
      return;
    }
    setIsOpenReturnModal(true);
  }

  // shipping selected prize and return unselected prize
  const submitShipping = async (flg) => {
    setAuthToken();
    setIsOpenConfirmModal(false);
    setIsOpenReturnModal(false);

    let returnData, shipData = [], returnCash = cashback;
    setSpinFlag(true);
    
    // flg = 1, seleted return
    // flg = 2, all return
    // flg = 3, selected shipped
    if (flg == 1) {
      shipData = [];
      returnData = notSelectedPrizes.filter((item) => item.selected === true);
    }
    else {
      shipData = shippingPrizes
      returnData = returningPrizes;
    }

    if (cashback !== totalcash) returnCash = totalcash - cashback;

    const res = await api.post("/admin/gacha/shipping", {
      shippingPrizes: shipData,
      returningPrizes: returnData,
      cashback: returnCash,
    });
    setSpinFlag(false);

    if (res.data.status === 2) setIsStop(true);
    else if (res.data.status === 1) {
      setGachas(res.data.gachas);
      if (initialPrizes) {
        navigate("/user/redrawGacha", {
          state: { gachaId: initialPrizes[0].gacha_id },
        });
      } else {
        setShippingPrizes([]);
        setReturningPrizes([]);
        setInitialData();
      }
    }
  };

  // choose returned prize and shipped prize
  const onChangePrize = (index) => {
    // Create a new array with the updated selected prize
    let updatedPrizes;
    if (index === 'all') {
      updatedPrizes = notSelectedPrizes.map((prize) => {
        return {...prize, selected: true}
      });
    }
    else if (index === "never") {
      updatedPrizes = notSelectedPrizes.map((prize) => {
        return {...prize, selected: false}
      });
    }
    else {
      updatedPrizes = notSelectedPrizes.map((prize, i) => {
        if (i === index) {
          // Return a new object with the updated selected property
          return { ...prize, selected: !prize.selected };
        }
        return prize; // Return the unchanged prize
      });
    }
    setNotSelectedPrizes(updatedPrizes);

    // Create two arrays: one for selected and one for not selected
    const selectedPrizes = updatedPrizes.filter(
      (prize) => prize.selected === true
    );
    const unselectedPrizes = updatedPrizes.filter(
      (prize) => prize.selected === false
    );

    // Log or use the arrays as needed
    const isShip = selectedPrizes.filter((prize) => prize.kind === 'rubbish');
    if (isShip.length) setShippingPrizes([]);
    else setShippingPrizes(selectedPrizes);
    setReturningPrizes(unselectedPrizes);
    calcCashbak(unselectedPrizes);
  };

  return (
    <>
      {spinFlag && <Spinner />}
      <p className="py-2">{t("selectProducts")}</p>
      <div className="pb-2 card-list mb-2 overflow-auto flex flex-wrap max-h-[580px]">
        {notSelectedPrizes?.length !== 0 &&
          notSelectedPrizes?.map((prize, i) => {
            return (
              <div
                key={i}
                className="w-full md:w-1/2 cursor-pointer"
                onClick={() => onChangePrize(i)}
              >
                <Card prize={prize} checkbox={true} />
              </div>
            );
          })}
      </div>
      {notSelectedPrizes.length !== 0 &&
        <div className="flex gap-2 pt-5">
          <input 
            className="cursor-point"
            type="checkbox"
            onChange={() => setCheck(!check)}
          />
          <p>{t("allselect")} </p>
        </div>}
      {shippingPrizes.length !== 0 && (
        <>
          <p className="p-1">{t("shippingAddress")}</p>
          <div
            className="border w-full p-2 rounded-md cursor-pointer hover:opacity-50"
            onClick={() => navigate("/user/changeShippingAddress")}
          >
            {shipAddress ? (
              <div className="flex flex-wrap items-center cursor-pointer flex-grow">
                <div className="flex flex-col px-2 text-gray-600">
                  <span className="font-bold">
                    {shipAddress?.lastName} {shipAddress?.firstName}
                  </span>
                  <span>
                    {(shipAddress?.country !== undefined
                      ? t(shipAddress?.country) + ", "
                      : "") +
                      (shipAddress?.prefecture !== undefined
                        ? shipAddress?.prefecture + ", "
                        : "") +
                      (shipAddress?.address !== undefined
                        ? shipAddress?.address + ", "
                        : "") +
                      (shipAddress?.addressLine1 !== undefined
                        ? shipAddress?.addressLine1 + ", "
                        : "") +
                      (shipAddress?.addressLine2 !== undefined
                        ? shipAddress?.addressLine2 + ", "
                        : "") +
                      (shipAddress?.building !== undefined
                        ? shipAddress?.building + ", "
                        : "") +
                      (shipAddress?.districtCity !== undefined
                        ? shipAddress?.districtCity + ", "
                        : "") +
                      (shipAddress?.cityTown !== undefined
                        ? shipAddress?.cityTown + ", "
                        : "") +
                      (shipAddress?.cityDistrict !== undefined
                        ? shipAddress?.cityDistrict + ", "
                        : "") +
                      (shipAddress?.islandCity !== undefined
                        ? shipAddress?.islandCity + ", "
                        : "") +
                      (shipAddress?.suburbCity !== undefined
                        ? shipAddress?.suburbCity + ", "
                        : "") +
                      (shipAddress?.state !== undefined
                        ? shipAddress?.state + ", "
                        : "") +
                      (shipAddress?.stateProvinceRegion !== undefined
                        ? shipAddress?.stateProvinceRegion + ", "
                        : "") +
                      (shipAddress?.zipCode !== undefined
                        ? shipAddress?.zipCode + ", "
                        : "")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-2.5">{t("noShippingAddress")}</div>
            )}
          </div>
          <div
            className={`my-2 rounded-md flex flex-wrap items-center text-white outline-none w-full min-h-[55px] ${totalcash - cashback < 1000 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-50 '}`}
            style={{ backgroundColor: bgColor }}
            onClick={totalcash - cashback < 1000 ? null : checkShipment} // Prevent click if disabled
            // hidden={shipAddress ? false : true}
          >
            <div className="flex flex-col mx-auto text-center">
              {totalcash - cashback < 1000 ? <p>{t("cash1000")}</p> :
                <p>{t("selectedShipping")}</p>
              }
            </div>
          </div>
          </>
      )}
      
      {notSelectedPrizes.length !== 0 &&
        <>
          <div
            className="my-2 rounded-md hover:opacity-50 flex flex-wrap items-center text-white outline-none w-full min-h-[55px] cursor-pointer"
            style={{ backgroundColor: bgColor }}
            onClick={checkReturn}
          >
            <div className="flex flex-col mx-auto text-center">
              {totalcash === cashback ? 
                <p>{t("allReturn")}</p> : <p> {t("SelectedReturn")} </p>
              }
              <div className="flex flex-wrap justify-center items-center">
                <img
                  alt="pointImg"
                  src={require("../../assets/img/icons/coin.png")}
                  className="text-center w-6"
                />
                <p className="px-2">{totalcash === cashback ? cashback : totalcash - cashback}</p>
              </div>
            </div>
          </div>
        </>
      }
      {/* {notSelectedPrizes?.length !== 0 && (
        <div
          className="my-2 rounded-md hover:opacity-50 flex flex-wrap items-center text-white outline-none w-full min-h-[55px] cursor-pointer"
          style={{ backgroundColor: bgColor }}
          onClick={checkShipment}
        >
          <div className="flex flex-col mx-auto text-center">
            {shippingPrizes.length === 0 ? (
              <>
                <p>{t("allReturn")}</p>
                <div className="flex flex-wrap justify-center items-center">
                  <img
                    alt="pointImg"
                    src={require("../../assets/img/icons/coin.png")}
                    className="text-center w-6"
                  />
                  <p className="px-2">{cashback}</p>
                </div>
              </>
            ) : (
              <p>{t("selectedShipping")}</p>
            )}
          </div>
        </div>
      )} */}
      <ConfirmShippingModal
        isOpen={isOpenReturnModal}
        setIsOpen={setIsOpenReturnModal}
        title={t("Return")}
        cashback={totalcash === cashback ? cashback : totalcash - cashback}
        desc={
          totalcash === cashback ? t("shippingDesc1") : t("shippingDesc3")
        }
        shippingPrizes={shippingPrizes}
        submitShipping={totalcash === cashback ? () => submitShipping(2) : () => submitShipping(1)}
        flag={1}
      />
      <ConfirmShippingModal
        isOpen={isOpenConfirmModal}
        setIsOpen={setIsOpenConfirmModal}
        title={ t("selectedShipping")}
        desc={t("shippingDesc2")}
        shippingPrizes={shippingPrizes}
        submitShipping={() => submitShipping(3)}
        flag={2}
      />

      <CheckShippingModal
        isOpen={isOpenCheckModal}
        setIsOpen={setIsCheckOpenModal}
        text={t("noShippingAddress")}
      />
      <StopModal
        isStop={isStop}
        setIsStop={setIsStop}
      />
    </>
  );
};

export default NotSelected;
