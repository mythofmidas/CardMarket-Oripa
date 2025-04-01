import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import api from "../../utils/api";
import { setAuthToken } from "../../utils/setHeader";
import { showToast } from "../../utils/toastUtil";
import formatPrice from "../../utils/formatPrice";

import usePersistedUser from "../../store/usePersistedUser";

import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import Spinner from "../Others/Spinner";
import PrizeCard from "../Others/PrizeCard";

function RubbishList({
  trigger,
  setFormData,
  setCuFlag,
  role,
  setImgUrl,
  gachaId,
  getGacha,
}) {
  const [user] = usePersistedUser();
  const { t } = useTranslation();

  const [rubbishs, setRubbishs] = useState([]);
  const [delRubbishId, setDelRubbishId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);
  const [count, setCount] = useState({id: '', value: 1});

  useEffect(() => {
    setAuthToken();
    getRubbishs();
  }, [trigger]);

  const getRubbishs = async () => {
    try {
      setSpinFlag(true);
      const res = await api.get("/admin/rubbish");
      setSpinFlag(false);

      if (res.data.status === 1) setRubbishs(res.data.rubbishs);
    } catch (error) {}
  };

  const rubbishEdit = (index) => {
    if (!user.authority["rubbish"]["write"]) {
      showToast(t("noPermission"), "error");
      return;
    }

    setFormData({
      id: rubbishs[index]._id,
      name: rubbishs[index].name,
      cashBack: rubbishs[index].cashback,
      nickname: rubbishs[index].nickname
      // kind: prizes[index].kind,
      // totalNumber: rubbishs[index].totalNumber,
      // deliveryCompany: prizes[index].deliveryCompany,
    });
    setCuFlag(0);
    setImgUrl(process.env.REACT_APP_SERVER_ADDRESS + rubbishs[index].img_url);
  };

  const delRubbish = async () => {
    setIsModalOpen(false);

    try {
      if (!user.authority["rubbish"]["delete"]) {
        showToast(t("noPermission"), "error");
        return;
      }

      setSpinFlag(true);
      const res = await api.delete(`/admin/rubbish/${delRubbishId}`);
      setSpinFlag(false);

      if (res.data.status === 1) {
        getRubbishs();
        showToast(t(res.data.msg));
      } else {
        showToast(t(res.data.msg), "error");
      }
    } catch (error) {
      showToast(t("failedReq"), "error");
    }
  };

  const changeCount = (i, e) => {
    setCount({id: i, value: e.target.value});
  };

  const addRubbish = async (rubbishId) => {
    try {
      if (!user.authority["gacha"]["write"]) {
        showToast(t("noPermission"), "error");
        return;
      }

      const formData = {
        gachaId: gachaId,
        rubbishId: rubbishId,
      };
      formData.count = count.value;

      setSpinFlag(true);
      const res = await api.post("/admin/gacha/set_rubbish", formData);
      setSpinFlag(false);

      if (res.data.status === 1) {
        getGacha();
        getRubbishs();
        setCount({...count, value: 1});
        showToast(t("successSet"), "success");
      } else {
        showToast(t("failedSetRubbish"), "error");
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
            <th>{t("image")}</th>
            <th>{t("name")}</th>
            <th>{t("cashback")}</th>
            {/* <th>{t("kind")}</th> */}
            {/* <th>{t("count")}</th> */}
            <th>{t("nickname")}</th>
            {role === "gacha" && <th>{t("count")}</th>}
            <th>{t("action")}</th>
          </tr>
        </thead>
        <tbody>
          {rubbishs && rubbishs.length !== 0 ? (
            rubbishs.map((data, i) => {
              return (
                <tr
                  key={data._id}
                  className={`${data.status === 0 ? "bg-[#f2f2f2]" : ""}`}
                >
                  <td>{i + 1}</td>
                  <td>
                    <div className="mx-auto w-[60px]">
                      <PrizeCard
                        img_url={data.img_url}
                        width={50}
                        height={80}
                      />
                    </div>
                  </td>
                  <td>{data.name}</td>
                  <td>{formatPrice(data.cashback)}pt</td>
                  {/* <td>{t(data.kind)}</td> */}
                  {/* <td>{data.totalNumber}</td> */}
                  <td>{data.nickname}</td>
                  {role === "gacha" && (
                    <td>
                      <input 
                        type="number"
                        min={1}
                        className="form-control w-28 mx-auto"
                        onChange={(e) => changeCount(i, e)}
                        value={count.id === i ? count.value : 1}
                      />
                    </td>
                  )}
                  <td>
                    {role === "gacha" ? (
                      <button
                        className="bg-[#0276ff] text-white text-md py-1 px-3 rounded-md cursor-pointer"
                        onClick={() => addRubbish(data._id)}
                      >
                        {t("add")}
                      </button>
                    ) : (
                      <>
                        <span
                          id={data._id}
                          className="fa fa-edit p-1 cursor-pointer"
                          onClick={(e) => rubbishEdit(i)}
                        />
                        {data.status === 0 &&
                        <span
                          className="fa fa-remove p-1 cursor-pointer"
                          onClick={(e) => {
                            setDelRubbishId(data._id);
                            setIsModalOpen(true);
                          }}
                        />}
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8">{t("noprize")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={delRubbish}
      />
    </div>
  );
}

export default memo(RubbishList);
