import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormGroup, Form, Input, InputGroup } from "reactstrap";
import { useAtom } from "jotai";

import api from "../../utils/api";
import { showToast } from "../../utils/toastUtil";
import Reset from "./Reset";
import Spinner from "../../components/Others/Spinner";

import { bgColorAtom } from "../../store/theme";

const Forgot = () => {
  const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);
  const [showErrMessage, setShowErrMessage] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const [formData, setFormData] = useState({
    email: "",
  });

  useEffect(() => {
    if (token) setIsReset(true);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValidate = () => {
    if (formData.email && emailRegex.test(formData.email))
      return true;
    else return false;
  };

  const handleChangeFormData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    isFormValidate();
  };

  const emailVerify = () => {
    setShowErrMessage(true);
    if (!isFormValidate()) return;
    handleSubmit();
  };

  const handleSubmit = async (e) => {
    try {
      setSpinFlag(true);
      const res = await api.post("/user/forgot", formData);
      setSpinFlag(false);
      if (res.data.status === 1) {
        showToast(t(res.data.msg), "success");
      }
      else showToast(t(res.data.msg), "error");
    } catch (error) {
      showToast(t("failedReq"), "error");
    }
  };

  return (
    <>
      {isReset ? (
          <Reset
            resetPasswordLink={token}
            setIsReset={setIsReset}
          />
        ) : (
        <div className="w-full mx-auto rounded-lg bg-white shadow border-0 my-5">
          {spinFlag && <Spinner />}
          <div className="p-lg-4 p-2">
            <div className="text-center mb-5 mt-3 font-bold text-2xl">
              {t("forgot_pass")}
            </div>
            <Form role="form">
              <FormGroup>
                <p className="p-1 font-bold text-xs">{t("email")} *</p>
                <InputGroup className="input-group-alternative mb-1">
                  <Input
                    placeholder={t("email")}
                    type="email"
                    name="email"
                    className={`border-[1px] ${
                      showErrMessage && !formData.email ? "is-invalid" : ""
                    }`}
                    value={formData.email}
                    autoComplete="email"
                    onChange={handleChangeFormData}
                  />
                </InputGroup>
                {showErrMessage && !formData.email ? (
                  <span className="flex text-sm text-red-600">
                    <i className="fa-solid fa-triangle-exclamation text-red-600 mr-2 mt-1"></i>
                    {t("requiredEmail")}
                  </span>
                ) : showErrMessage && !emailRegex.test(formData.email) ? (
                  <span className="flex text-sm text-red-600">
                    <i className="fa-solid fa-triangle-exclamation text-red-600 mr-2 mt-1"></i>
                    {t("requiredEmail")}
                  </span>
                ) : null}
              </FormGroup>
              <div className="flex flex-col text-center mt-10">
                <button
                  className="px-10 py-2 text-white rounded-md m-auto hover:opacity-50"
                  type="button"
                  onClick={emailVerify}
                  style={{ backgroundColor: bgColor }}
                >
                  {t("forgot_pass")}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default Forgot;
