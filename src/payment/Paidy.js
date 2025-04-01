import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../utils/api';
import { showToast } from '../utils/toastUtil';
import { setAuthToken } from '../utils/setHeader';
import { bgColorAtom } from '../store/theme';
import { useAtom } from "jotai";

import usePersistedUser from '../store/usePersistedUser';
import PuchaseSpinner from '../components/Others/PuchaseSpinner';
import Spinner from '../components/Others/Spinner';

function Paidy({ amount , setAmount}) {
  const [user, setUser] = usePersistedUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [pay, setPay] = useState(false);
  const [bgColor] = useAtom(bgColorAtom);

  useEffect(() => {
    setAuthToken();

    const script = document.createElement('script');
    script.src = 'https://apps.paidy.com/';
    script.async = true;
    
    script.onload = () => {
      const config = {
        api_key: process.env.REACT_APP_PAIDY_PUBLIC_KEY,
        logo_url: 'https://on-gacha.net/images/logo.png',
        closed: function (callbackData) {
          if (callbackData.status === 'authorized') {
            const process = async() => {
              try {
                setLoading(true)
                const checkRes = await api.post('/user/point/paidy/retrieve-payment', {
                  paymentId: callbackData.id,
                });
                if (checkRes.data.status && checkRes.data.payment === amount) {
                  const res = await api.post('/user/point/paidy/capture-payment', {
                    paymentId: callbackData.id,
                  });
                  setLoading(false);
                  if (res.data.status) {
                      await purchase_point(amount);
                  } else  showToast(t('failedReq'), "error");
                }
                else {
                  setLoading(false);
                  showToast(t('failedReq'), "error");
                }
              } catch (err) {
                showToast(t('failedReq'), "error");
              }
            };
            process();
          } else if (callbackData.status === 'rejected' || callbackData.status === 'closed') {
            showToast(t('payment_cancelled'), "error");
          } else {
            showToast(t('payment_unknown_status'), "error");
          }
        }
      };
      
      window.paidyHandler = window.Paidy.configure(config);
    };

    document.body.appendChild(script);

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window.paidyHandler;
    };
  }, [amount]);

  const validatePhone = (phone) => {
    const phoneRegex = /^\+81[0-9]{9,10}$/;
    return phoneRegex.test(phone);
  };

  const purchase_point = async (amount) => {
    try {
      setPay(true);
      const res = await api.post("/user/point/purchase", {
        user_id: user._id,
        point_num: amount,
        price: amount,
      });
      setPay(false);

      if (res.data.status === 1) {
        navigate("user/index");
        showToast(t('payment.success'), 'success');
      } else {
        showToast(t(res.data.msg), "error");
      }
    } catch (error) {
      console.error('Purchase point failed:', error);
      showToast(t('purchase.error'), "error");
    }
  };

  const handler = async () => {
    setLoading(true);

    // if (!validatePhone(phone)) {
    //   setError(t('invalid_phone_format'));
    //   setLoading(false);
    //   return;
    // }

    const payload = {
      amount: amount,
      currency: 'JPY',
      store_name: 'Paidy sample store',
      buyer: {
      },
      description: 'Purchase Point',
      order: {
        items: [
          {
            id: `item-${Date.now()}`,
            quantity: 1,
            title: 'Purchase Point',
            unit_price: amount,
            description: ' ',
          },
        ],
        order_ref: `order-${Date.now()}`,
        shipping: 0,
        tax: 0,
      },
      
    };
    
    try {
      if (!window.paidyHandler) {
        throw new Error('Paidy SDK not initialized');
      }
      window.paidyHandler.launch(payload);
    } catch (err) {
      showToast(t('failedReq'), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* Loading Spinner */}
    {loading && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 shadow-lg" />
      </div>
    )}
    
    {/* Payment Spinner */}
    {pay && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500 shadow-lg" />
      </div>
    )}

    {/* Main Modal */}
    {!loading && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-40 p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-gray-800 tracking-tight">
              {t('Paidy')}
            </h1>

            {/* Place Order Button */}
            <button
              type="submit"
              onClick={handler}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ring-1 ring-black/5`}
              style={{ backgroundColor: bgColor }}
            >
              {t('placeOrder')}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setAmount(0)}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ring-1 ring-black/5`}
              style={{ backgroundColor: bgColor }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

export default Paidy;