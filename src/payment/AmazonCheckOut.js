import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation  } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setAuthToken } from '../utils/setHeader';
import { showToast } from '../utils/toastUtil';
import { bgColorAtom } from '../store/theme';
import { useAtom } from "jotai";

import usePersistedUser from '../store/usePersistedUser';
import api from '../utils/api';

const AmazonCheckOut = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatedSessionDetails, setUpdatedSessionDetails] = useState(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState('');
  const [user, setUser] = usePersistedUser();
  const [bgColor] = useAtom(bgColorAtom);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static-fe.payments-amazon.com/checkout.js";
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    setAuthToken();
    const checkoutSession = queryParams.get('amazonCheckoutSessionId');
    setCheckoutSessionId(checkoutSession);
    if (checkoutSessionId) {
      fetchCheckoutSession();
    }

    if (!window.amazon?.Pay || !checkoutSessionId) return;

    const bindAmazonActions = () => {
      const addressButton = document.getElementById('changeAddressButton');
      const paymentButton = document.getElementById('changePaymentButton');
      if (!addressButton || !paymentButton) {
        console.warn('Amazon Pay buttons not found in DOM. Retrying...');
        setTimeout(bindAmazonActions, 500);
        return;
      }

      window.amazon.Pay.bindChangeAction('#changeAddressButton', {
        amazonCheckoutSessionId: checkoutSessionId,
        changeAction: 'changeAddress',
        callback: async (newSessionId) => {
          console.log('Address change initiated:', newSessionId);
          await fetchCheckoutSession();
        },
      });

      window.amazon.Pay.bindChangeAction('#changePaymentButton', {
        amazonCheckoutSessionId: checkoutSessionId,
        changeAction: 'changePayment',
        callback: async (newSessionId) => {
          console.log('Payment method change initiated:', newSessionId);
          await fetchCheckoutSession();
        },
      });
    };

    bindAmazonActions();
  }, [checkoutSessionId]);

  const fetchCheckoutSession = async () => {
    try {
      const res = await api.get(`/user/point/get-checkout-session/${checkoutSessionId}`);
      if (res.data.status) setUpdatedSessionDetails(res.data.sessoionData);
      else showToast(t('failedReq'), "error");
    } catch (error) {
      console.error('Error fetching checkout session:', error);
      setError('failedRetrieveUpdatedCheckoutSession.');
    }
  };

  const completePayment = async () => {
    if (!checkoutSessionId) {
      setError('invalidCheckoutSessionID');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/user/point/update-checkout-session', {
        checkoutSessionId,
      });

      if (res.data.status) window.location.href = res.data.amazonPayRedirectUrl;
      else showToast(t('failedReq'), "error");
    } catch (error) {
      setError('errorOccurredDuringPaymentProcessing');
    } finally {
      setLoading(false);
    }
  };

  return (
    user && <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {t('confirmShippingAddress')}
        </h2>

        {updatedSessionDetails ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700">{t('shippingAddress')}</h3>
              <p className="text-gray-600 mt-2">
                {updatedSessionDetails.shippingAddress ? (
                  <>
                    {updatedSessionDetails.shippingAddress.addressLine1 || 'Not available'},
                    {updatedSessionDetails.shippingAddress.addressLine2 && ` ${updatedSessionDetails.shippingAddress.addressLine2},`}
                    {updatedSessionDetails.shippingAddress.city && ` ${updatedSessionDetails.shippingAddress.city},`}
                    {updatedSessionDetails.shippingAddress.stateOrRegion && ` ${updatedSessionDetails.shippingAddress.stateOrRegion},`}
                    {updatedSessionDetails.shippingAddress.postalCode && ` ${updatedSessionDetails.shippingAddress.postalCode},`}
                    {updatedSessionDetails.shippingAddress.countryCode && ` ${updatedSessionDetails.shippingAddress.countryCode}`}
                  </>
                ) : (
                  'Not available'
                )}
              </p>
              <button id="changeAddressButton" className="mt-2 text-blue-600 hover:text-blue-800 font-medium">{t('change')}</button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700">{t('paymentMethod')}</h3>
              <p className="text-gray-600 mt-2">
                {updatedSessionDetails.paymentInstrument?.paymentDescriptor || 'Not available'}
              </p>
              <button id="changePaymentButton" className="mt-2 text-blue-600 hover:text-blue-800 font-medium">{t('change')}</button>
            </div>

            <p className="text-gray-500 text-sm text-center">
              {t('ensureShippingDetailsAndPaymentmethod')}.
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500">{t('loadingCheckoutSessionDetails')}</p>
        )}

        {error && <p className="text-red-500 text-center mt-4">{t(error)}</p>}

        <button
          onClick={completePayment}
          disabled={loading || !checkoutSessionId || !updatedSessionDetails}
          className="w-full mt-6 transition duration-200 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50 hover:opacity-50 "
          style={{ backgroundColor: bgColor }}
        >
          {loading ? t('loading') + '...' : t('placeOrder')}
        </button>
      </div>
    </div>
  );
};

export default AmazonCheckOut;