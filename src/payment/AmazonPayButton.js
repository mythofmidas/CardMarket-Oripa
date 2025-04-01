import React, { useEffect, useRef } from 'react';
import api from '../utils/api';

const AmazonPayButton = ({ amount }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const initialSession = async () => {
      try {
        const res = await api.post('/user/point/create-checkout-session', {
          amount: amount
        });

        if (window.amazon?.Pay && buttonRef.current && res.data?.status) {
          window.amazon.Pay.renderButton('#AmazonPayButton', {
            merchantId: process.env.REACT_APP_MERCHANT_ID,
            publicKeyId: process.env.REACT_APP_PUBLIC_KEY_ID,
            ledgerCurrency: 'JPY',
            sandbox: false,
            checkoutLanguage: 'ja_JP',
            productType: 'PayAndShip',
            placement: 'Checkout',
            buttonColor: 'Gold',
            checkoutSessionId: res.data.checkoutSessionId,
            createCheckoutSessionConfig: {
              payloadJSON: res.data.payload,
              signature: res.data.signature,
              algorithm: 'AMZN-PAY-RSASSA-PSS-V2'
            },
          }, buttonRef.current);
        }
      } catch (err) {
        console.error('Error initializing Amazon Pay:', err);
      }
    };

    initialSession();

    // Cleanup function
    // return () => {
    //   if (window.amazon?.Pay) {
    //     window.amazon.Pay.unbind('#AmazonPayButton');
    //   }
    // };
  }, [amount]); // Added 'amount' to dependency array

  return <div ref={buttonRef} id="AmazonPayButton" />;
};

export default AmazonPayButton;