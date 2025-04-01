import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";

import api from "../../utils/api";
import { showToast } from "../../utils/toastUtil";
import { setAuthToken } from "../../utils/setHeader";
import { setMultipart, removeMultipart } from "../../utils/setHeader";
import formatPrice from "../../utils/formatPrice";
import subCategories from "../../utils/subCategories";
import usePersistedUser from "../../store/usePersistedUser";

import AgreeButton from "../../components/Forms/AgreeButton";
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal";
import PageHeader from "../../components/Forms/PageHeader";
import uploadimage from "../../assets/img/icons/upload.png";
import Spinner from "../../components/Others/Spinner";

function SEO() {
  const navigate = useNavigate();
  const [user] = usePersistedUser();
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);
  const lang = i18n.language;

  const [formData, setFormData] = useState({
    gachaId: '',
    title: '',
    desc: ''
  });
  const [imgUrl, setImgUrl] = useState("");
  const [gacha, setGacha] = useState(null);
  const [spinFlag, setSpinFlag] = useState(false);
  const [home, setHome] = useState({title: '', desc: ''});

  useEffect(() => {
    getGacha();
  }, []);

  const getGacha = async () => {
    setSpinFlag(true);
    const res = await api.get("/admin/gacha");
    setSpinFlag(false);

    if (res.data.status === 1) {
      setGacha(res.data.gachaList);
      setHome(res.data.home);
    }
  };

  const changeFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addGacha = async () => {
    try {
      // if (!user.authority["gacha"]["write"]) {
      //   showToast(t("noPermission"), "error");
      //   return;
      // }

      setAuthToken();
      
      setSpinFlag(true);
      const res = await api.post("/admin/gacha/seo", formData);
      setSpinFlag(false);

      if (res.data.status === 1) {
        showToast(t(res.data.msg), "success");
        getGacha();
      } else showToast(t(res.data.msg), "error");
      } catch (error) {
        showToast(error, "error");
    }
  };

  const cancelGacha = async () => {
    setFormData({
      ...formData,
      title: '',
      desc: ''
    });
    setImgUrl('');
  }

  const handleGacha = (gacha) => {
    if (gacha === 1) {
      setImgUrl(uploadimage);
      setFormData({
        gachaId: '',
        title: home.title,
        desc: home.desc
      });
    }
    else {
      setFormData({
        gachaId: gacha._id,
        title: gacha.title,
        desc: gacha.desc
      });
      setImgUrl(process.env.REACT_APP_SERVER_ADDRESS + gacha.img_url);
    }
  }

  return (
    <div className="relative px-3 pt-2 py-12">
      {spinFlag && <Spinner />}
      <div className="w-full md:w-[70%] mx-auto">
        <PageHeader text={t("SEO")} />
      </div>
      <div className="flex flex-wrap">
        <div className="flex flex-col w-full lg:w-[35%] mb-2 border-1 h-fit">
          <div className="py-2 bg-admin_theme_color text-gray-200 text-center">
            {t("add") + " " + t("description")}
          </div>
          <div className="flex flex-col justify-between items-center p-2 w-full">
            <label className="text-gray-700 p-1 mb-2">
              {t("gacha") + " " + t("image")}
            </label>
            <img
              src={imgUrl ? imgUrl : uploadimage}
              alt="prize"
              className={`cursor-pointer ${
                imgUrl ? "w-auto h-[250px]" : ""
              }  object-cover`}
            />
          </div>
          <div className="flex flex-col p-2">
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="name" className="text-gray-700">
                {t("title")}
              </label>
              <input
                name="title"
                className="p-1 w-full form-control"
                onChange={changeFormData}
                value={formData.title}
                id="title"
                autoComplete="title"
              />
            </div>
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="description" className="text-gray-700">
                {t("description")}
              </label>
              <textarea 
                className="p-1 w-full form-control h-[100px]"
                name='desc'
                value={formData.desc}
                onChange={changeFormData}
                placeholder="Enter your text here..."
              ></textarea>
            </div>
            {imgUrl && <div className="flex flex-wrap justify-end">
              <AgreeButton
                name={t("cancel")}
                addclassName="inline-block float-right"
                onClick={cancelGacha}
              />
              <AgreeButton
                name={t("add")}
                addclassName="inline-block float-right"
                onClick={addGacha}
              />
            </div>}
          </div>
        </div>

        <div className="overflow-auto flex flex-wrap w-full lg:w-[65%] h-fit">
          <div className="border-1 py-2 bg-admin_theme_color text-gray-200 text-center w-full">
            {t("gacha") + " " + t("list")}
          </div>
          <table className="w-full m-auto">
            <thead className="bg-admin_theme_color font-bold text-gray-200">
              <tr>
                <th>{t("no")}</th>
                <th>{t("image")}</th>
                <th>{t("type")}</th>
                <th>{t("name")}</th>
                <th>{t("price")}</th>
                <th>{t("category")}</th>
                <th>{t("kind")}</th>
                <th>{t("number")}</th>
                <th>{t("order")}</th>
                <th>{t("time")}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                className={`border-2 cursor-pointer ${
                  (home.title || home.desc) ? "bg-[#f2f2f2]" : ""
                }`}
                onClick={() => handleGacha(1)}
              >
                <td rowSpan="1">{1}</td>
                <td>
                  <img
                    src={ uploadimage }
                    width="100"
                    className="mx-auto"
                    alt="Home"
                  />
                </td>
                <td> </td>
                <td>{t('homepage')}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              {gacha && gacha.length !== 0 && (
                gacha.map((data, i) => {
                  let catName;
                  switch (lang) {
                    case "ch1":
                      catName = data.category.ch1Name;
                      break;
                    case "ch2":
                      catName = data.category.ch2Name;
                      break;
                    case "vt":
                      catName = data.category.vtName;
                      break;
                    case "en":
                      catName = data.category.enName;
                      break;

                    default:
                      catName = data.category.jpName;
                      break;
                  }

                  return (
                    <React.Fragment key={data._id}>
                      <tr
                        key={i}
                        className={`border-2 cursor-pointer ${
                          (data.title || data.desc) ? "bg-[#f2f2f2]" : ""
                        }`}
                        onClick={() => handleGacha(data)}
                      >
                        <td rowSpan="1">{i + 2}</td>
                        <td>
                          <img
                            src={
                              process.env.REACT_APP_SERVER_ADDRESS +
                              data.img_url
                            }
                            width="100"
                            className="mx-auto"
                            alt="gacha thumnail"
                          />
                        </td>
                        <td>{t("gacha") + " " + data.type}</td>
                        <td>{data.name}</td>
                        <td>{formatPrice(data.price)}pt</td>
                        <td>{catName}</td>
                        <td>
                          {data.kind.map((item, i) => (
                            <p key={i}>{t(item.value)}</p>
                          ))}
                        </td>
                        <td>
                          {
                            data.remain_prizes.length
                          }{" "}
                          / {data.total_number}
                        </td>
                        <td>{data.order}</td>
                        <td>{data.time}</td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SEO;
