import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import api from "../../utils/api";
import formatPrice from "../../utils/formatPrice";
import { showToast } from "../../utils/toastUtil";
import { setAuthToken } from "../../utils/setHeader";

import CustomSelect from "../../components/Forms/CustomSelect";
import PuchaseSpinner from "../../components/Others/PuchaseSpinner";
import Spinner from "../../components/Others/Spinner";
import StripePic from "../../assets/img/icons/common/stripe-card.png";
import PaidyPic from "../../assets/img/icons/common/paidy.png";
import AmazonPic from "../../assets/img/icons/common/amazonpay.png";

import usePersistedUser from "../../store/usePersistedUser";
import { bgColorAtom } from "../../store/theme";
import { testAtom } from "../../store/test";
import StripePayment from "../../payment/StripePayment";
import Amazon from "../../payment/Amazon";
import Paidy from "../../payment/Paidy";
import StopModal from "../../components/Modals/StopModal";

function PurchasePoint() {
  const [bgColor] = useAtom(bgColorAtom);
  const [user, setUser] = usePersistedUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [testmode] = useAtom(testAtom);

  const paymentOptions = [
    { value: "stripe", label: t('Stripe'), img: StripePic },
    { value: "amazon", label: "Amazon Pay", img: AmazonPic },
    { value: "paidy", label: "Paidy", img: PaidyPic },
  ];
  const [points, setPoints] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0]);
  const [, setSelId] = useState(0);
  const [spinFlag, setSpinFlag] = useState(false);
  const [amount, setAmount] = useState(0);
  const [statusPay, setStatusPay] = useState(false);
  const [isStop, setIsStop] = useState(false);
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    setAuthToken();
    getPoints();
  
    const amazonScript = document.createElement("script");
    amazonScript.src = "https://static-fe.payments-amazon.com/checkout.js";
    amazonScript.async = true;
    document.body.appendChild(amazonScript);
  
    return () => {
      document.body.removeChild(amazonScript);
    };
  }, []);
  

  const getPoints = async () => {
    try {
      setSpinFlag(true);
      const res = await api.get("/admin/get_point");
      setSpinFlag(false);

      setPoints(res.data.points);
      setIsStop(res.data.isStop);
    } catch (error) {
      showToast(error, "error");
    }
  };

  const purchase_point = async (amount) => {
    try {
      setAuthToken();

      const res = await api.post("/user/point/purchase", {
        user_id: user._id,
        point_num: amount,
        price: amount,
      });

      if (res.data.status === 1) {
        navigate("user/index");
      } else showToast(t(res.data.msg), "error");
    } catch (error) {
      showToast(error, "error");
    }
  };

  const testPay = async (amount) => {
    if (paymentMethod === null) {
      showToast(t("selectPayOption"), "error");
      return;
    }
    if (testmode) {
      showToast(t("thisTestmode"), "error");
      return;
    }
    if (isStop) {
      setIsShow(true);
      return;
    }
    setAmount(amount);
  };
  const payment =  () => {
    if (!paymentMethod || !amount) return null;
    if (paymentMethod.value === 'stripe') {
      return <StripePayment amount={amount} setSpinFlag={setSpinFlag} setStatusPay={setStatusPay} setAmount={setAmount} />;
    }
    if (paymentMethod.value === 'amazon') {
      return <Amazon amount={amount} setAmount={setAmount} />
    }
    if (paymentMethod.value === 'paidy') {
      return <Paidy amount={amount} setAmount={setAmount} />
    }
  }

  return (
    <div className="flex flex-grow">
      {spinFlag && <Spinner />}
      { statusPay && <PuchaseSpinner /> }
      { !isStop && payment()}
      
      <div className="w-full md:w-2/3 lg:w-1/2 p-3 mx-auto">
        <div className="w-full py-2">
          <div className="text-center text-xl text-slate-600">
            <i
              className="fa fa-chevron-left mt-1.5 float-left items-center cursor-pointer"
              onClick={() => navigate('/user/index')}
            ></i>
            {t("purchasePoints")}
          </div>
          <hr className="w-full my-2"></hr>
        </div>

        <div className="flex flex-wrap">
          <div className="p-2 w-full">
            <div className="text-lg mt-3 mb-1 font-bold">
              {t("paymentMethod")}
            </div>
            <CustomSelect
              options={paymentOptions}
              selectedOption={paymentMethod}
              setOption={setPaymentMethod}
            />
            <div>
              <div className="text-lg mt-3 mb-1 font-bold">
                {t("chargetAmount")}
              </div>
            </div>
            <div className="flex flex-col justify-between bg-white rounded-lg mt-2">
              {!spinFlag && <div className="p-1 over">
                {points && points.length !== 0 ? (
                  points.map((point, i) => (
                    <div key={i}>
                      <div className="p-2 flex justify-between items-center">
                        <div className="flex">
                          <img
                            src={
                              process.env.REACT_APP_SERVER_ADDRESS +
                              point.img_url
                            }
                            alt="point"
                            width="50px"
                            height="50px"
                          ></img>
                          <div className="flex flex-col px-2">
                            <div className="text-left text-lg font-bold">
                              {formatPrice(point.point_num)}pt
                            </div>
                            <div className="text-s text-center text-theme_text_color">
                              {t("purchase")} ¥{formatPrice(point.price)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <button
                            className="hover:opacity-50 py-1 px-2 xsm:py-2 xsm:px-3 rounded-md text-white text-md font-bold"
                            onClick={() => {
                              setSelId(i); //set selected id for api
                              testPay(point.price);
                            }}
                            style={{ backgroundColor: bgColor }}
                          >
                            {t("buyNow")}
                          </button>
                        </div>
                      </div>
                      <hr className="py-1" />
                    </div>
                  ))
                ) : (
                  <span className="text-center">{t("nopoint")}</span>
                )}
              </div>}
            </div>
          </div>
        </div>
      </div>
      <StopModal
        isStop={isShow}
        setIsStop={setIsShow}
      />
    </div>
  );
}

export default PurchasePoint;
