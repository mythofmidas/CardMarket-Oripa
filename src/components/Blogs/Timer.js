import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

import { bgColorAtom } from "../../store/theme";

const Timer = ({setTimeFlag, countdown, chk}) => {
  const [bgColor] = useAtom(bgColorAtom);
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  useEffect(() => setCount(countdown), []);

  useEffect(() => {
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setTimeFlag(false);
            return 0;
          }
          return prevTime - 1; // Decrease count by 1 second
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [count, setTimeFlag]);

  // Function to format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400)/ 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return (
      <div className="w-full text-center flex justify-center">
        <div className="justify-center">
        {chk !== 1 && <div className="text-2xl font-extrabold text-gray-800 tracking-wide whitespace-nowrap">{t('Untilpublished')}</div>}
        <div className="flex justify-center items-center gap-1 flex-wrap">
          <div className="flex flex-col items-center">
            <div className="bg-red-500 text-white font-extrabold text-2xl p-1 rounded-lg shadow-md relative overflow-hidden min-w-[60px] mb-1">
              {days}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></div>
            </div>
            {chk !== 1 && <div className="text-sm font-semibold text-gray-600 mt-1 tracking-wide">{t('days')} </div>}
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-red-500 text-white font-extrabold text-2xl p-1 rounded-lg shadow-md relative overflow-hidden min-w-[60px] mb-1">
              {hours}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></div>
            </div>
            {chk !== 1 && <div className="text-sm font-semibold text-gray-600 mt-1 tracking-wide">{t('hours')} </div>}
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-red-500 text-white font-extrabold text-2xl p-1 rounded-lg shadow-md relative overflow-hidden min-w-[60px] mb-1">
              {minutes}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></div>
            </div>
            {chk !== 1 && <div className="text-sm font-semibold text-gray-600 mt-1 tracking-wide">{t('minutes')} </div>}
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-red-500 text-white font-extrabold text-2xl p-1 rounded-lg shadow-md relative overflow-hidden min-w-[60px] mb-1">
              {secs}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></div>
            </div>
            {chk !== 1 && <div className="text-sm font-semibold text-gray-600 mt-1 tracking-wide"> {t('seconds')} </div>}
          </div>
        </div>
        </div>
      </div>
    )
  };

  return (
    <div className="text-[37px] text-blue- w-full h-full">
      {formatTime(count)}
    </div>
  );
};

export default Timer;
