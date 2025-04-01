import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import api from "../../utils/api";
import GachaBlog from "../Blogs/GachaBlog";

import Spinner from "../Others/Spinner";
import { showToast } from "../../utils/toastUtil";

const RelatedGacha = ({ gachaId }) => {
  const [gacha, setGacha] = useState(null);
  const { t, i18n } = useTranslation();
  const [spinFlag, setSpinFlag] = useState(false);
  
  useEffect(() => {
    const getGacha = async () => {
      try {
        setSpinFlag(true);
        const res = await api.get(`/admin/gacha/category/${gachaId}`);
        setSpinFlag(false);
  
        if (res.data.status === 1) {
          const gachalist = res.data.gacha.filter((item) => item.isRelease === true && item.total_number > 0);
          setGacha(gachalist);
  
        } else {
          showToast(t("failedReq"), "error");
        }
      } catch (error) {
        showToast(t("failedReq"), "error");
      }
    };
    getGacha()
  }, [gachaId]);
  

  return (
    <>
      <div className="text-center text-[24px] pt-10 pb-10">
        <h1 > {t('recommand')} </h1>
      </div>
      <div className="w-full flex flex-wrap justify-between xm:px-3 pb-10">
        {spinFlag && <Spinner />}
        {gacha?.map((data, i) => {
          return (
            <GachaBlog
              data={data}  setSpinFlag={setSpinFlag} key={i} 
            />
          );
        })
        }
      </div>
    </>
  );
};

export default RelatedGacha;
