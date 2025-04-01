import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormGroup, Form, Input, InputGroup } from "reactstrap";
import { useAtom } from "jotai";

import api from "../../utils/api";
import { showToast } from "../../utils/toastUtil";

import Spinner from "../../components/Others/Spinner";

import { bgColorAtom } from "../../store/theme";

const Reset = ({ resetPasswordLink, setIsReset }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bgColor] = useAtom(bgColorAtom);

  const [isVisible, setIsVisible] = useState(false);
  const [showErrMessage, setShowErrMessage] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
  });


  const togglePasswordVisibility = () => {
    setIsVisible(!isVisible);
  };

  const isFormValidate = () => {
    if (formData.newPassword)
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
      formData.resetPasswordLink = resetPasswordLink;
      const res = await api.post("/user/reset", formData);
      setSpinFlag(false);
      if (res.data.status === 1) {
        showToast(t(res.data.msg), "success");
        navigate("auth/login");
      }
      else showToast(t(res.data.msg), "error");
    } catch (error) {
      showToast(t("failedReq"), "error");
    }
  };

  return (
    <>
        <div className="w-full mx-auto rounded-lg bg-white shadow border-0 my-5">
          {spinFlag && <Spinner />}
          <div className="p-lg-4 p-2">
            <div className="text-center mb-5 mt-3 font-bold text-2xl">
              {t("reset")}
            </div>
            <Form role="form">
              <FormGroup>
                <p className="p-1 font-bold text-xs">{t("password")} *</p>
                <InputGroup className="input-group-alternative mb-1">
                  <Input
                    placeholder={t("password")}
                    type={isVisible ? "text" : "password"}
                    name="newPassword"
                    className={`border-[1px] rounded-r-lg ${
                      showErrMessage && !formData.newPassword ? "is-invalid" : ""
                    }`}
                    value={formData.newPassword}
                    autoComplete="current-password"
                    onChange={handleChangeFormData}
                  />
                  <div
                    onClick={togglePasswordVisibility}
                    className="cursor-pointer"
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "10px",
                    }}
                  >
                    {isVisible ? (
                      <i className="fa fa-eye text-gray-500" />
                    ) : (
                      <i className="fa fa-eye-slash text-gray-500" />
                    )}
                  </div>
                </InputGroup>
                {showErrMessage && !formData.newPassword ? (
                  <span className="flex text-sm text-red-600">
                    <i className="fa-solid fa-triangle-exclamation text-red-600 mr-2 mt-1"></i>
                    {t("requiredPwd")}
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
                  {t("reset")}
                </button>
                <button
                  className="text-light"
                  onClick={() => setIsReset(false)}
                >
                  <div className="text-md my-3 text-blue-500 hover:text-blue-700 py-1">
                    {t("forgot_pass")}
                  </div>
                </button>
              </div>
            </Form>
          </div>
        </div>
    </>
  );
};

export default Reset;
