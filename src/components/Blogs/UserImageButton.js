import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

import api from "../../utils/api";
import { setAuthToken } from "../../utils/setHeader";
import { showToast } from "../../utils/toastUtil";
import usePersistedUser from "../../store/usePersistedUser";
import { bgColorAtom } from "../../store/theme";
import { testAtom } from "../../store/test";
import StopModal from "../Modals/StopModal";

const UserImageButton = ({data, setIsOpenPointModal, setSpinFlag, check, isStop, setIsStop}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser ] = usePersistedUser ();
  const [bgColor] = useAtom(bgColorAtom);
  const [testmode] = useAtom(testAtom);

  // update user data and update localstorage
  const updateUserData = async () => {
    setAuthToken(testmode);

    try {
      if (user) {
        // update user date
        const res = await api.get(`/user/get_user/${user._id}`);
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

  // draw gacha
  const submitDrawGacha = async (gacha, counts) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    if (user.role === "admin") {
      showToast(t("drawnAdmin"), "error");
      return;
    }

    const totalPoints =
      gacha.price *
      (counts === "all"
        ? (gacha.remain_prizes.length + gacha.rubbish_total_number)
        : counts);
    const remainPoints = user.point_remain;
    if (!testmode && remainPoints < totalPoints) {
      setIsOpenPointModal(true);
      return;
    }
    try {
      setAuthToken(testmode);

      setSpinFlag(true);
      const res = await api.post("/admin/gacha/draw_gacha", {
        gachaId: gacha._id,
        counts: counts,
        drawDate: new Date(),
      });
      setSpinFlag(false);
      
      if (res.data.status == 2) setIsStop(true);
      else if (res.data.status === 1) {
        setSpinFlag(true);
        updateUserData();
        await api.post(`/user/drawlog`, {
          userid: user._id,
          gachaid: gacha._id,
        });
        setSpinFlag(false);

        navigate("/user/showDrawedPrizes", {
          state: { prizes: res.data.prizes },
        });
      } else {
        switch (res.data.msg) {
          case 0:
            showToast(t("drawnEnoughPrize"), "error");
            break;

          case 1:
            showToast(t("noEnoughPoints"), "error");
            break;

          default:
            showToast(t("faileReq", "error"));
            break;
        }
      }
    } catch (error) {
      showToast(t("faileReq", "error"));
    }
  };

  const hasPrizes = data.remain_prizes.length + data.rubbish_total_number;

  return (
    <>
      {(hasPrizes === 0 || check) ? (
        // border-r-[1px] border-t-2
        <button
          className="mx-1 text-white cursor-not-allowed bg-gray-400 text-center px-1 py-2.5  border-white rounded-lg m-0 xs:px-4 w-[60%]"
          disabled={true}
        >
          {check ? t("NOT") : t("soldOut")}
        </button>
      ) : (
        <>
          <button
            className="mx-1 cursor-pointer hover:opacity-50 text-white text-center px-1 py-2.5  border-white rounded-lg m-0 xs:px-4 w-[30%]"
            style={{
              backgroundColor: bgColor,
            }}
            onClick={() => {
              submitDrawGacha(data, 1);
            }}
          >
            {t("drawOne")}
          </button>
          {/* {!data.kind.some((item) => item.value === "once_per_day") && ( */}
          {(data.kind.some((item) => (item.value !== "once_per_day" && item.value !== "Inweek"))) &&  (
            <>
              {hasPrizes >= 10 && (
                <button
                  className="mx-1 cursor-pointer hover:opacity-50 text-white text-center px-1 py-2.5  border-white rounded-lg m-0 xs:px-4 w-[30%]"
                  onClick={() => { submitDrawGacha(data, 10); }}
                  style={{ backgroundColor: bgColor, }}
                >
                  {t("drawTen")}
                </button>
              )}
              {data.type === 2 && hasPrizes !== 1 && (
                <button
                  className="mx-1 cursor-pointer hover:opacity-50 text-white text-center px-1 py-2.5 rounded-lg  border-white m-0 xs:px-4 w-[30%]"
                  onClick={() => {
                    submitDrawGacha(data, "all");
                  }}
                  style={{
                    backgroundColor: bgColor,
                  }}
                >
                  {t("drawAll")}
                </button>
              )}
            </>
          )}
        </>
      )}
      
    </>
  );
};


export default UserImageButton;
