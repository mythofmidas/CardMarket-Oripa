import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

import api from "../../utils/api.js";
import { showToast } from "../../utils/toastUtil.js";
import { setAuthToken } from "../../utils/setHeader.js";

import usePersistedUser from "../../store/usePersistedUser.js";
import { bgColorAtom } from "../../store/theme.js";

import InputGroup from "../../components/Forms/InputGroup.js";
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal.js";
import Spinner from "../../components/Others/Spinner.js";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = usePersistedUser();
  const [bgColor] = useAtom(bgColorAtom);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
  });
  const [pwdData, setPwdData] = useState({
    currentPwd: "",
    newPwd: "",
  });

  useEffect(() => {
    setAuthToken();
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      setSpinFlag(true);
      const res = await api.get(`/user/get_user/${user?._id}`);
      setSpinFlag(false);

      if (res.data.status === 1) setUserData(res.data.user);
    } catch (error) {
      showToast(error, "error");
    }
  };

  // Update user data
  const handleSetUserData = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdateUserData = async () => {
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

  // change password
  const handleSetPwdData = (e) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const handleChangePass = async () => {
    setSpinFlag(true);
    const res = await api.post("/user/changePwd", pwdData);
    setSpinFlag(false);

    switch (res.data.status) {
      case 1:
        showToast(t("successEdited"), "success");
        break;
      case 0:
        showToast(t("failedEdited"), "error");
        break;
      case 2:
        showToast(t("incorrectCurPwd"), "error");
        break;

      default:
        break;
    }

    setPwdData({
      currentPwd: "",
      newPwd: "",
    });
  };

  const handleWithdrawalAccount = async () => {
    try {
      setSpinFlag(true);
      const res = await api.post("/user/withdraw_user/", { user_id: user._id });
      setSpinFlag(false);
      if (res.data.status === 1) logout();
    } catch (error) {
      showToast(error, "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    navigate("/auth/login");
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
            {t("profile")}
          </div>
          <hr className="w-full my-2"></hr>
        </div>
        <div className="flex flex-wrap justify-between">
          <div className="w-full xxsm:w-1/2 px-2 mb-3">
            <div className="flex flex-wrap rounded-lg bg-white p-2">
              <p className="w-full text-2xl text-center text-theme_headertext_color">
                {t("information")}
              </p>
              <hr className="py-2"></hr>
              <div className="flex flex-wrap w-full">
                <div className="w-full px-2">
                  <InputGroup
                    label={t("name")}
                    type="text"
                    name="name"
                    value={userData?.name || ""}
                    placeholder="Oliver Leo"
                    onChange={handleSetUserData}
                  />
                </div>
                <div className="w-full px-2">
                  <InputGroup
                    label={t("email")}
                    type="email"
                    name="email"
                    value={userData?.email || ""}
                    placeholder="OliverLeo118@email.com"
                    onChange={handleSetUserData}
                  />
                </div>
                <div className="w-full px-2">
                  <InputGroup
                    label={t("country")}
                    type="text"
                    name="country"
                    value={userData?.country || ""}
                    placeholder="United States"
                    onChange={handleSetUserData}
                  />
                </div>
              </div>
              <div className="hover:opacity-50 w-full flex flex-wrap justify-end px-2">
                <button
                  className="px-4 py-2 my-1 rounded-md text-white"
                  onClick={handleUpdateUserData}
                  style={{ backgroundColor: bgColor }}
                >
                  {t("save")}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full xxsm:w-1/2 px-2">
            <div className="w-full rounded-lg bg-white p-2">
              <div className="flex flex-wrap">
                <p className="w-full text-2xl text-center text-theme_headertext_color">
                  {t("changePass")}
                </p>
                <hr className="py-2"></hr>
                <div className="flex flex-wrap w-full">
                  <div className="w-full md:w-1/2 px-2">
                    <InputGroup
                      label={t("currentPass")}
                      type="password"
                      name="currentPwd"
                      placeholder="*******"
                      value={pwdData.currentPwd}
                      onChange={handleSetPwdData}
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-2">
                    <InputGroup
                      label={t("newPass")}
                      type="password"
                      name="newPwd"
                      placeholder="*******"
                      value={pwdData.newPwd}
                      onChange={handleSetPwdData}
                    />
                  </div>
                </div>
                <div className="hover:opacity-50 flex flex-wrap w-full justify-end px-2">
                  <button
                    className="px-4 py-2 my-1 rounded-md text-white"
                    onClick={handleChangePass}
                    style={{ backgroundColor: bgColor }}
                  >
                    {t("change")}
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="w-full rounded-lg bg-white mt-3 p-2">
              <p className="w-full text-2xl text-center text-theme_headertext_color">
                {t("account")}
              </p>
              <p className="p-2">{t("withdrawalDes")}</p>
              <div className="flex flex-wrap w-full justify-end px-2">
                <button
                  className="hover:opacity-50 px-4 py-2 my-1 rounded-md text-white"
                  onClick={setIsModalOpen}
                  style={{ backgroundColor: bgColor }}
                >
                  {t("withdrawal")}
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleWithdrawalAccount}
        bgColor={bgColor}
      />
    </div>
  );
};

export default Profile;
