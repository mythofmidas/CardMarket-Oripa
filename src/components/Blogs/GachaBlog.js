import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

import GachaPriceLabel from "../Others/GachaPriceLabel";
import Progressbar from "../Others/progressbar";

import api from "../../utils/api";
import usePersistedUser from "../../store/usePersistedUser";
import { bgColorAtom } from "../../store/theme";
import UserImageButton from "./UserImageButton";
import Timer from "./Timer";
import StopModal from "../Modals/StopModal";

const GachaBlog = ({ data, setIsOpenPointModal, setSpinFlag}) => {
  const navigate = useNavigate();
  const [user, setUser ] = usePersistedUser ();
  const [bgColor] = useAtom(bgColorAtom);
  const { t } = useTranslation();
  const [timeFlag, setTimeFlag] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [check, setCheck] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [isStop, setIsStop] = useState(false);

  useEffect(() => {
    let gachaTime;
    const currentTime = Math.floor(new Date(new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo', // Specify the time zone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format
    }).format(Date.now())) / 1000);
    if (data) gachaTime = Math.floor(new Date(new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo', // Specify the time zone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format
    }).format(new Date(data.createdAt))) / 1000);
    
    const fetchGachaTime = async () => {
      try {
        // setShowFlag(true);
        const res = await api.get(`/user/drawlog/${user?._id}/${data?._id}`);
        // setShowFlag(false);

        if (data.kind.some((item) => item.value === "500")) {
          if (user.rankData.totalPointsAmount < 500) {setCheck(true); return;}
        }
        if (data.kind.some((item) => item.value === "1000")) {
          if (user.rankData.totalPointsAmount < 1000) {setCheck(true); return;}
        }
        if (data.kind.some((item) => item.value === "10000")) {
          if (user.rankData.totalPointsAmount < 10000) {setCheck(true); return;}
        }
        // once per day
        if (data.kind.some((item) => item.value === "once_per_day")) {
          const currentdaystart = currentTime - currentTime % 86400;
          if (res.data.msg !== "notdraw" && currentdaystart <= res.data.gacha) {
            setCheck(true);
            return ;
          }
        }
        // once in a week
        if (data.kind.some((item) => item.value === "Inweek")) {
          const registertime = Math.floor(new Date(user.createtime) / 1000);
          if (currentTime - registertime >= 86400 * 7) {setCheck(true); return;}  
          else if (res.data.msg !== "notdraw") {setCheck(true); return;} 
        }
      } catch (error) {
        console.error('Error fetching gacha data:', error);
      }
    };
    const determineCount = () => {
      let resttime = currentTime - gachaTime;
      setTimeFlag(resttime <= data.time * 60);
      if (resttime <= data.time * 60) {
        setCountdown(data.time * 60 - resttime); // Set countdown to remaining time
      }
    }

    setCheck(false);
    if (user && data) fetchGachaTime();
    if (data) determineCount();

  }, [data, user, check]);
  const hash = data.remain_prizes.length + data.rubbish_total_number;

  return (
    <>
    {!showFlag &&
    <div className="w-full xsm:w-[90%] xxsm:w-[70%] md:w-[48%] mx-auto p-2">
      <div className="p-2 flex flex-col justify-between border-2 hover:bg-white rounded-lg shadow-md shadow-gray-400 border-gray-300 hover:scale-[101%] outline-2 hover:outline-pink-500">
        <button
          className="relative cursor-pointer w-full"
          onClick={() => {
            navigate("/user/gachaDetail", {
              state: { gachaId: data?._id },
            });
          }}
        >
          <div className="w-full h-0 pb-[100%] relative overflow-hidden"> {/* Square container */}
            <img
              src={process.env.REACT_APP_SERVER_ADDRESS + data?.img_url}
              alt="img_url"
              className={`absolute top-0 left-0 w-full h-auto object-cover rounded-t `}
            />
            {!hash && ( // Only show the overlay if hash is falsy
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-75 rounded-t"></div>
            )}
            {!hash && <div className="absolute top-0 left-0 w-full my-auto h-full flex flex-col items-center justify-center  p-4 rounded-md">
              <p className="font-bold text-red-500 text-5xl">SOLD  OUT</p>
              <p className="font-bold text-white text-3xl mt-4">{t('soldOut')}</p>
            </div>}
          </div>
          <div className="w-full h-[35px]">
            <div className="w-4/6 flex flex-col justify-center items-center absolute left-1/2 -translate-x-1/2 bottom-0 text-center">
              <GachaPriceLabel price={data?.price} />
              <Progressbar
                progress={
                  ((data.remain_prizes.length + data.rubbish_total_number)/
                    data.total_number) *
                  100
                }
                label={
                  (data.remain_prizes.length + data.rubbish_total_number) +
                  " / " +
                  data.total_number
                }
                height={20}
              />
            </div>
          </div>
        </button>
        <div className="w-full flex flex-wrap justify-center">
            {timeFlag === true && !check ? <Timer chk={1} setTimeFlag={setTimeFlag} countdown={countdown} /> : <UserImageButton 
            check={check} data={data} setIsOpenPointModal={setIsOpenPointModal} setSpinFlag={setSpinFlag} isStop={isStop} setIsStop={setIsStop}
          />}
        </div>
      </div>
      <StopModal
        isStop={isStop}
        setIsStop={setIsStop}
        text={t("successLogin")}
      />
    </div>}
    </>
  );
};

export default GachaBlog;
