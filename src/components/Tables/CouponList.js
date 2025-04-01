import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import api from "../../utils/api";
import { setAuthToken } from "../../utils/setHeader";
import { showToast } from "../../utils/toastUtil";
import formatPrice from "../../utils/formatPrice";

import usePersistedUser from "../../store/usePersistedUser";

import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import Spinner from "../Others/Spinner";

function CouponList({
  trigger,
  setFormData,
  setCuFlag,
  setIsToggled
}) {
  const [user] = usePersistedUser();
  const { t } = useTranslation();

  const [coupons, setCoupons] = useState([]);
  const [delCouponId, setDelCouponId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);

  useEffect(() => {
    setAuthToken();
    getCoupons();
  }, [trigger]);

  const getCoupons = async () => {
    try {
      setSpinFlag(true);
      const res = await api.get("/admin/coupon");
      setSpinFlag(false);
      if (res.data.status === 1) setCoupons(res.data.coupons);
    } catch (error) {}
  };

  const couponEdit = (index) => {
    if (!user.authority["coupon"]["write"]) {
      showToast(t("noPermission"), "error");
      return;
    }

    setFormData({
      id: coupons[index]._id,
      name: coupons[index].name,
      cashBack: coupons[index].cashback,
      allow: coupons[index].allow,
      code: coupons[index].code,
    });
    setIsToggled(coupons[index].allow)
    setCuFlag(0);
  };

  const delCoupon = async () => {
    setIsModalOpen(false);

    try {
      if (!user.authority["coupon"]["delete"]) {
        showToast(t("noPermission"), "error");
        return;
      }

      setSpinFlag(true);
      const res = await api.delete(`/admin/coupon/${delCouponId}`);
      setSpinFlag(false);

      if (res.data.status === 1) {
        showToast(t(res.data.msg));
        getCoupons();
      } else {
        showToast(t(res.data.msg), "error");
      }
    } catch (error) {
      showToast(t("failedReq"), "error");
    }
  };

  return (
    <div className="overflow-auto w-full">
      {spinFlag && <Spinner />}
      <table className="w-full">
        <thead className="bg-admin_theme_color text-gray-200">
          <tr>
            <th>{t("no")}</th>
            <th>{t("code")}</th>
            <th>{t("name")}</th>
            <th>{t("cashback")}</th>
            <th>{t("active")}</th>
            <th>{t("action")}</th>
          </tr>
        </thead>
        <tbody>
          {coupons && coupons.length !== 0 ? (
            coupons.map((data, i) => {
              return (
                <tr
                  key={data._id}
                  className={`${data.allow.toString() === "true" ? "bg-[#f2f2f2]" : ""}`}
                >
                  <td>{i + 1}</td>
                  <td>{data.code}</td>
                  <td>{data.name}</td>
                  <td>{formatPrice(data.cashback)}pt</td>
                  <td>{data.allow.toString().toUpperCase()}</td>
                  <td>
                    <span
                      id={data._id}
                      className="fa fa-edit p-1 cursor-pointer"
                      onClick={(e) => couponEdit(i)}
                    />
                    <span
                      className="fa fa-remove p-1 cursor-pointer"
                      onClick={(e) => {
                        setDelCouponId(data._id);
                        setIsModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8">{t("nocoupon")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={delCoupon}
      />
    </div>
  );
}

export default memo(CouponList);
