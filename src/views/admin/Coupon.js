import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import api from "../../utils/api";
import { showToast } from "../../utils/toastUtil";
import formatPrice from "../../utils/formatPrice";
import {
  setAuthToken,
} from "../../utils/setHeader";

import AgreeButton from "../../components/Forms/AgreeButton";
import CouponList from "../../components/Tables/CouponList";
import PageHeader from "../../components/Forms/PageHeader";
import Spinner from "../../components/Others/Spinner";

import usePersistedUser from "../../store/usePersistedUser";

const Coupon = () => {
  const { t } = useTranslation();
  const [user] = usePersistedUser();
  const [isToggled, setIsToggled] = useState(false);
  const [cuflag, setCuFlag] = useState(1);
  const [trigger, setTrigger] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [spinFlag, setSpinFlag] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    cashBack: 0,
    allow: false,
    code: ""
  });

  const changeFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addCoupon = async (flag = 0) => {
    try {
      if (!user.authority["coupon"]["write"]) {
        showToast(t("noPermission"), "error");
        return;
      }
      setAuthToken();

      if (formData.name.trim() === "") {
        showToast(t("requiredName"), "error");
      } else if (parseInt(formData.cashBack) <= 0) {
        showToast(t("cashback") + " " + t("greaterThan"), "error");
      } else {
        formData.allow = isToggled;
        formData.flag = flag;

        setSpinFlag(true);
        const res = await api.post("/admin/coupon", formData);
        setSpinFlag(false);

        if (res.data.status === 1) {
          setTrigger(!trigger);
          setFormData({
            ...formData,
            id: "",
            name: "",
            cashBack: 0,
          });
          setIsToggled(false);
          showToast(t(res.data.msg), "success");
        } else showToast(t(res.data.msg), "error");
      }
    } catch (error) {
      showToast(t("failedReq"), "error");
    }
  };

  const updateCoupon = () => {
    if (!user.authority["coupon"]["write"]) {
      showToast(t("noPermission"), "error");
      return;
    }

    setCuFlag(1);
    addCoupon(1);
  };

  return (
    <div className="px-3 pt-2 py-12">
      {spinFlag && <Spinner />}
      <div className="w-full md:w-[70%] mx-auto">
        <PageHeader text={t("coupon")} />
      </div>
      <div className="flex flex-wrap">
        <div className="flex flex-col w-full lg:w-[35%] mb-2 border-1 h-fit">
          <div className="py-2 bg-admin_theme_color text-gray-200 text-center">
            {t("coupon") + " " + t("add")}
          </div>
          <div className="flex flex-col p-2">
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="couponname" className="text-gray-700">
                {t("name")}
              </label>
              <input
                name="name"
                className="p-1 w-full form-control"
                onChange={changeFormData}
                value={formData.name}
                id="couponname"
                autoComplete="name"
              ></input>
            </div>
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="cashBack" className="text-gray-700">
                {t("cashback")} (pt)
              </label>
              <input
                type="number"
                name="cashBack"
                min={0}
                className="p-1 w-full form-control"
                onChange={changeFormData}
                value={formData.cashBack}
                id="cashBack"
                autoComplete="name"
              ></input>
            </div>
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="allow" className="text-gray-700">
                {t("active")}
              </label>
              <div className="flex items-center justify-center ">
                <button
                  onClick={() => setIsToggled(!isToggled)}
                  className={`relative inline-flex items-center justify-between w-32 h-10 border-2 rounded-full transition-all duration-300 ease-in-out ${isToggled ? 'border-green-600 bg-green-200' : 'border-gray-400 bg-gray-200'}`}
                >
                  <span
                    className={`absolute left-1 transition-transform duration-300 ease-in-out transform ${isToggled ? 'translate-x-full' : 'translate-x-0'}`}
                  >
                    <span className={`font-bold text-lg ${isToggled ? 'text-green-600' : 'text-gray-600'}`}>
                      {isToggled ? 'ON' : 'OFF'}
                    </span>
                  </span>
                  <span
                    className={`absolute w-10 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out transform ${isToggled ? 'translate-x-20' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-end">
              {cuflag ? (
                <AgreeButton name={t("add")} onClick={() => addCoupon()} />
              ) : (
                <>
                  <button
                    className="p-2 px-4 my-1 text-white hover:bg-opacity-50 bg-red-500 rounded-md"
                    onClick={() => {
                      setCuFlag(true);
                      setFormData({
                        ...formData,
                        id: "",
                        name: "",
                        cashBack: 0,
                        allow: false
                      });
                    }}
                  >
                    {t("cancel")}
                  </button>
                  <AgreeButton name={t("update")} onClick={updateCoupon} />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap w-full lg:w-[65%] h-fit">
          <div className="mx-auto w-full">
            {coupons && coupons.length !== 0 ? (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-admin_theme_color font-bold text-gray-200">
                    <tr>
                      <td>{t("no")}</td>
                      <td>{t("code")}</td>
                      <td>{t("name")}</td>
                      <td>{t("cashback")}</td>
                      <td>{t("active")}</td>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((data, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{data.code}</td>
                        <td>{data.name}</td>
                        <td>{formatPrice(data.cashback)}pt</td>
                        <td>{t(data.allow)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="border-1 py-2 bg-admin_theme_color text-gray-200 text-center w-full">
            {t("coupon") + " " + t("list")}
          </div>
          <CouponList
            trigger={trigger}
            setFormData={setFormData}
            setCuFlag={setCuFlag}
            setIsToggled={setIsToggled}
          />
        </div>
      </div>
    </div>
  );
};

export default Coupon;
