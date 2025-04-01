import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { setAuthToken } from "../utils/setHeader";

import api from "../utils/api";
import StripeResult from "./StripeResult";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripePayment = ({amount, setSpinFlag, setStatusPay, setAmount}) => {
  const [clientSecret, setClientSecret] = useState("");
  useEffect(() => {
    setAuthToken();
    setClientSecret("");

    const createPaymentIntent = async () => {
      setSpinFlag(true);
      const res = await api.post("/user/point/create-payment-intent", {
        amount: amount,
      });
      if (res.data.status) setClientSecret(res.data.clientSecret);
      setSpinFlag(false);
    }
    createPaymentIntent();
  }, [amount]);

  const options = {
    clientSecret,
  };

  return (
    <>
    {clientSecret && (
      <Elements stripe={stripePromise} options={options} >
        <StripeResult amount={amount} setStatusPay={setStatusPay}  setAmount={setAmount}/>
      </Elements>
    )}
    </>
  );
};

export default StripePayment;