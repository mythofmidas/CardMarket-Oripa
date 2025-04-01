import { useEffect, useState } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import { useTranslation } from "react-i18next";
import usePersistedUser from "../../store/usePersistedUser.js";

import api from "../../utils/api.js";
import { showToast } from "../../utils/toastUtil.js";

import PuchaseSpinner from "../../components/Others/PuchaseSpinner.js";
import { setAuthToken } from "../../utils/setHeader.js";
import Spinner from "../../components/Others/Spinner.js";

const PayResult = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = usePersistedUser();
  const queryParams = new URLSearchParams(location.search);
  const [statusPay, setStatusPay] = useState(false);

  useEffect(() => {
    setAuthToken();
    const checkoutSessionId = queryParams.get('amazonCheckoutSessionId');
    const amount = queryParams.get('amount');
    const completeSession = async () => {
      const res = await api.post('/user/point/complete-checkout-session', {
        checkoutSessionId, amount
      });
      if (res.data.status) purchase_point(Number(amount));
      else {
        navigate("/user/purchasePoint");
        showToast(t('failedReq'), "error");
      }
    } 
    if (checkoutSessionId) completeSession();
  }, []);

  const purchase_point = async (amount) => {
    if (user) {
    try {
      setStatusPay(true);
      const res = await api.post("/user/point/purchase", {
        user_id: user._id,
        point_num: amount,
        price: amount,
      });
      setStatusPay(false);

      if (res.data.status === 1)  navigate("/user/index");
      else {
        navigate("/user/purchasePoint");
        showToast(t(res.data.msg), "error");
      }
    } catch (error) {
        navigate("/user/purchasePoint");
      showToast(error.message, "error");
    }
  }
  };
  
  return (
    user && <div className="flex flex-grow">
      { <PuchaseSpinner /> }
    </div>
  );
};

export default PayResult;
