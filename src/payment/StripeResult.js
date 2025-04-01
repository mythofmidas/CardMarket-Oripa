import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toastUtil";
import usePersistedUser from "../store/usePersistedUser";
import { setAuthToken } from "../utils/setHeader";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const StripeResult = ({amount, setStatusPay, setAmount}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const { t } = useTranslation();
  const [user, setUser] = usePersistedUser();

  const purchase_point = async (amount) => {
    try {
      setStatusPay(true);
      const res = await api.post("/user/point/purchase", {
        user_id: user._id,
        point_num: amount,
        price: amount,
      });
      setStatusPay(false);


      if (res.data.status === 1) {
        navigate("user/index");
      } else showToast(t(res.data.msg), "error");
    } catch (error) {
      showToast(error, "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setAuthToken();

    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });
    setIsLoading(false);

    if (error) {
      showToast(t('failedReq'), "error");
    } else {
      setWaiting(true);
      purchase_point(amount);
    }
  };

  return (
    <div
      className={`${
        waiting ? "hidden" : ""
      } fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-4 md:mx-0">
        <h2 className="text-xl font-semibold text-center mb-3">{t('completePayment')}</h2>
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className={`mt-4 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? t('loading') + '...' : t('paynow')}
          </button>
          <button
            type="button"
            className={`mt-1 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
              isLoading ? "bg-gray-600" : "bg-blue-400 hover:bg-blue-600"
            }`}
            onClick={() => setAmount(0)}
          >
            {t('cancel')}
          </button>
          {message && <div className="mt-2 text-red-500 text-center">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default StripeResult;