import React, { useState, useEffect } from 'react';
import AmazonPayButton from './AmazonPayButton';
import { useTranslation } from 'react-i18next';

const Amazon = ({ amount, setAmount }) => {
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
      <div className="items-center p-3 rounded-lg">
        {error && <p style={{ color: 'red' }}>{error}</p>}
          <AmazonPayButton
            amount={amount}
            onError={setError}
            setAmount={setAmount}
          />
          {/* <button
            type="button"
            className={`mt-1 w-full py-2 rounded-lg text-white font-semibold transition duration-300 bg-blue-400 hover:bg-blue-600`}
            onClick={() => setAmount(0)}
          >
            {t('cancel')}
          </button> */}
      </div>
    </div>
  );
};

export default Amazon;