import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import NavBar from "../../components/Aquicision/NavBar";
import NotSelected from "../../components/Aquicision/NotSelected";
import Awaiting from "../../components/Aquicision/Awaiting";
import Shipped from "../../components/Aquicision/Shipped";

function AcquisitionHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [navItem, setNavItem] = useState("notSelected");

  return (
    <div className="flex flex-grow">
      <div className="w-full md:w-4/6 p-3 mx-auto">
        <div
          className="text-start text-xl text-slate-600 py-2 cursor-pointer"
          onClick={() => navigate("user/index")}
        >
          <i className="fa fa-chevron-left m-1.5 float-left"></i>
          {t("back")}
          <hr className="w-full mt-2"></hr>
        </div>
        <NavBar setNavItem={setNavItem} navItem={navItem} />
        {navItem === "notSelected" ? (
          <NotSelected />
        ) : navItem === "awaiting" ? (
          <Awaiting />
        ) : navItem === "shipped" ? (
          <Shipped />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default AcquisitionHistory;
