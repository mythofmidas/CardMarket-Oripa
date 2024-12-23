import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import api from "../../utils/api";
import formatPrice from "../../utils/formatPrice";
import { showToast } from "../../utils/toastUtil";
import { setAuthToken } from "../../utils/setHeader";

import { googlePayConfig } from "../../payment/googlePayConfig";
import { initiateUnivaPayTransaction } from "../../payment/univaPayRequest";

import CustomSelect from "../../components/Forms/CustomSelect";
import PuchaseSpinner from "../../components/Others/PuchaseSpinner";
import Gpay from "../../assets/img/icons/common/google.png";
import Spinner from "../../components/Others/Spinner";
import ApplePay from "../../assets/img/icons/common/apple.png";
import Univa from "../../assets/img/icons/common/univa.png";

import usePersistedUser from "../../store/usePersistedUser";
import { bgColorAtom } from "../../store/theme";

function PurchasePoint() {
  const [bgColor] = useAtom(bgColorAtom);
  const [user, setUser] = usePersistedUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const paymentOptions = [
    { value: "gPay", label: "Google Pay", img: Gpay },
    { value: "applePay", label: "Apple Pay", img: ApplePay },
    { value: "univaPay", label: "Univa Pay", img: Univa },
  ];
  const [, setGPayReady] = useState(false);
  const [points, setPoints] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [, setSelId] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);

  useEffect(() => {
    setAuthToken();
    getPoints();

    // google pay settings
    const script = document.createElement("script");
    script.src = "https://pay.google.com/gp/p/js/pay.js";
    script.onload = onGooglePayLoaded;
    document.body.appendChild(script);
  }, []);

  const updateUserData = async () => {
    setAuthToken();

    try {
      if (user) {
        setSpinFlag(true);
        const res = await api.get(`/user/get_user/${user._id}`);
        setSpinFlag(false);

        if (res.data.status === 1) {
          setUser(res.data.user);
        } else {
          showToast(t("tryLogin"), "error");
          navigate("user/index");
        }
      }
    } catch (error) {
      showToast(t("tryLogin"), "error");
      navigate("user/index");
    }
  };

  const getPoints = async () => {
    try {
      setSpinFlag(true);
      const res = await api.get("/admin/get_point");
      setSpinFlag(false);

      setPoints(res.data.points);
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
        setWaiting(true);

        setTimeout(() => {
          setWaiting(false);
          updateUserData();
          navigate("user/index");
        }, 4000);
      } else showToast(t(res.data.msg), "error");
    } catch (error) {
      showToast(error, "error");
    }
  };

  const onGooglePayLoaded = () => {
    if (window.google) {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: googlePayConfig.environment,
      });

      paymentsClient
        .isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods:
            googlePayConfig.paymentDataRequest.allowedPaymentMethods,
        })
        .then((response) => {
          if (response.result) {
            setGPayReady(true);
          }
        })
        .catch((err) => {
          console.error("Error loading Google Pay:", err);
        });
    }
  };

  const handlePay = async (amount) => {
    try {
      if (paymentMethod === null) {
        showToast(t("selectPayOption"), "error");
        return;
      }

      switch (paymentMethod.value) {
        case "gPay":
          const paymentsClient = new window.google.payments.api.PaymentsClient({
            environment: googlePayConfig.environment,
          });

          const paymentDataRequest = {
            ...googlePayConfig.paymentDataRequest,
            transactionInfo: {
              ...googlePayConfig.paymentDataRequest.transactionInfo,
              totalPrice: amount.toString(),
            },
          };

          const paymentData = await paymentsClient.loadPaymentData(
            paymentDataRequest
          );

          if (paymentData) {
            await purchase_point(amount);
          }

          break;

        case "applePay":
          console.log("apple pay");

          break;

        case "univaPay":
          try {
            await initiateUnivaPayTransaction(amount);
            alert("Payment initiated successfully");
          } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed");
          }
          console.log("univa pay");

          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const testPay = async (amount) => {
    if (paymentMethod === null) {
      showToast(t("selectPayOption"), "error");
      return;
    }

    purchase_point(amount);
  };

  return (
    <div className="flex flex-grow">
      {spinFlag && <Spinner />}
      {waiting && <PuchaseSpinner />}
      <div className="w-full md:w-2/3 lg:w-1/2 p-3 mx-auto">
        <div className="w-full py-2">
          <div className="text-center text-xl text-slate-600">
            <i
              className="fa fa-chevron-left mt-1.5 float-left items-center cursor-pointer"
              onClick={() => navigate(-1)}
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
              <div className="p-1">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchasePoint;
