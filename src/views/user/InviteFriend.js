import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import api from "../../utils/api.js";
import Spinner from "../../components/Others/Spinner.js";

import usePersistedUser from "../../store/usePersistedUser.js";
import { showToast } from "../../utils/toastUtil.js";
import { setAuthToken } from "../../utils/setHeader.js";
import { bgColorAtom } from "../../store/theme.js";
import { testAtom } from "../../store/test.js";
import StopModal from "../../components/Modals/StopModal.js";

const InviteFriend = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = usePersistedUser();
  const [bgColor] = useAtom(bgColorAtom);
  const [admincode, setAdmincode] = useState('');
  const [spinFlag, setSpinFlag] = useState(false);
  const [testmode] = useAtom(testAtom);
  const [isStop, setIsStop] = useState(false);

  const updateUserData = async () => {
    setAuthToken();

    try {
      if (user) {
        setSpinFlag(true);
        const res = await api.get(`/user/get_user/${user._id}`);
        setSpinFlag(false);
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

  const handlecode = async () => {
    try {
      setAuthToken();

      if (testmode) {
        showToast(t('thisTestmode'), 'error');
        return;
      }
      setSpinFlag(true);
      const res = await api.post("/user/point/admincode", {
        user_id: user._id,
        code: admincode,
      });
      setSpinFlag(false);

      if (res.data.status == 2) setIsStop(true);
      else if (res.data.status === 1) {
        showToast((res.data.data + t(res.data.msg)), 'success');
        updateUserData();
      } else showToast(t(res.data.msg), "error");
    } catch (error) {
      showToast(error, "error");
    }
  };

  return (
    <div className="flex flex-grow">
      {spinFlag && <Spinner />}
      <div className={`relative w-full lg:w-2/3 mx-auto p-3`}>
        <div className="w-full py-2">
          <div className="text-center text-xl text-slate-600">
            <i
              className="fa fa-chevron-left mt-1.5 float-left items-center cursor-pointer"
              onClick={() => navigate(-1)}
            ></i>
            {t("inviteFriend")}
          </div>
          <hr className="w-full my-2"></hr>
          <div className="w-full rounded-lg bg-white mt-3 p-2">
            <p className="w-full text-2xl text-center text-theme_headertext_color">
              {t("coupon")}
            </p>
            <p className="p-2">
              {t(
                "inviteDesc"
              )}
            </p>
            <div className="flex flex-wrap justify-between w-full px-2">
              <input
                type="text"
                className=" block p-2 mt-2 text-slate-700 bg-white border rounded-md focus:border-slate-400 focus:ring-slate-300 focus:outline-none focus:ring focus:ring-opacity-40 flex-grow"
                value={admincode}
                onChange={(e) => setAdmincode(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap w-full justify-between px-2 pt-2">
              <button
                className="hover:opacity-50 px-4 py-2 my-1 rounded-md text-white"
                style={{ backgroundColor: bgColor }}
                onClick={handlecode}
              >
                {t("couponButtom")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <StopModal
        isStop={isStop}
        setIsStop={setIsStop}
      />
    </div>
  );
};

export default InviteFriend;
