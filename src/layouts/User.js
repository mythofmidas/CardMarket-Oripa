import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  useLocation,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

import routes from "../routes.js";

import api from "../utils/api.js";
import useAffiliateID from "../utils/useAffiliateID.js";
import useAxiosInterceptor from "../utils/AxiosInterceptors.js";

import UserNavbar from "../components/Navbars/UserNavbar.js";
import Footer from "../components/Footers/Footer.js";
import iniLogoImg from "../assets/img/brand/oripa-logo.png";

import usePersistedUser from "../store/usePersistedUser.js";
import { bgColorAtom, logoAtom } from "../store/theme.js";
import { testAtom, navAtom } from "../store/test.js";
import { gachasAtom, homeAtom } from "../store/gachas.js";
import Spinner from "../components/Others/Spinner.js";
import {jwtDecode} from 'jwt-decode';
import SucceedModal from "../components/Modals/SucceedModal.js";
import { useTranslation } from "react-i18next";
import PayResult from "../views/user/PayResult.js";
import AmazonCheckOut from "../payment/AmazonCheckOut.js";
import StopModal from "../components/Modals/StopModal.js";

const User = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedOut } = useAxiosInterceptor();
  const [user, setUser] = usePersistedUser();
  const [, setBgColor] = useAtom(bgColorAtom);
  const [, setLogo] = useAtom(logoAtom);
  const [, setGachas] = useAtom(gachasAtom);
  const [, setHomeSeo] = useAtom(homeAtom);
  const { t, i18n } = useTranslation();
  
  const [, setAffId] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [testmode, setTestmode] = useAtom(testAtom);
  const [isOpenToggleMenu] = useAtom(navAtom);
  const [isnavbar, setIsnavbar] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);
  const [isOpenLoggedModal, setIsOpenLoggedModal] = useState(false);
  const [isStop, setIsStop] = useState(false);

  // check the URL parameters on page load to see if the affiliate ID is present.
  const handleAffiliateID = (affiliateID) => {
    setAffId(affiliateID);
  };
  useAffiliateID(handleAffiliateID);

  useEffect(() => {
    getThemeDataAndGacha();
    const userData = getUser(localStorage.getItem('token'));
    if (userData) setUser(userData);
    const test = (localStorage.getItem('testmode') === 'true');
    if (test !== testmode) {
      setTestmode(test);
    }
    if (localStorage.getItem("loggedIn")) {
      setIsOpenLoggedModal(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedOut) {
      setIsNavigating(true);
      navigate("/auth/login");
    } else if (user?.role === "admin") {
      setIsNavigating(true);
      navigate("/admin/index");
    } 
  }, [isLoggedOut, user]);
  
  useEffect(() => {
    // Disable body scroll
    if(isOpenToggleMenu && !isnavbar) document.body.style.overflow = 'hidden';

    // Cleanup function to reset the overflow when the component unmounts
    else  document.body.style.overflow = 'auto';
  }, [isOpenToggleMenu, isnavbar]);

  const getThemeDataAndGacha = async () => {
    setSpinFlag(true);
    const resTheme = await api.get("/admin/getThemeData");
    const resGacha = await api.get("/admin/gacha");
    setSpinFlag(false);

    if (resTheme.data.status === 1 && resTheme.data.theme) {
      if (resTheme.data.theme.logoUrl) {
        setLogo(process.env.REACT_APP_SERVER_ADDRESS + resTheme.data.theme.logoUrl);
      } else {
        setLogo(iniLogoImg);
      }

      if (resTheme.data.theme.bgColor) {
        setBgColor(resTheme.data.theme.bgColor);
      } else {
        setBgColor("#ff0000");
      }
    } else {
      setLogo(iniLogoImg);
      setBgColor("#ff0000");
    }

    if (resGacha.data.status === 1) {
      setGachas(resGacha.data.gachaList);
      setHomeSeo(resGacha.data.home);
      setIsStop(resGacha.data.isStop);
    }
  };

  const getUser = (token) => {
    if (!token) {
      return null; // No token provided
    }
  
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now())  return null;
      return decodedToken; // This will contain the user information
    } catch (error) {
      return null; // Return null if the token is invalid
    }
  };

  if (isNavigating || user?.role === "admin") {
    return null;
  }

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/user") {
        const token = localStorage.getItem("token");

        if (
          prop.path !== "/index" &&
          prop.path !== "/gachaDetail" &&
          prop.path !== "/blog" &&
          prop.path !== "/terms" &&
          prop.path !== "/lisence" &&
          prop.path !== "/specialLaw" &&
          !token
        )
          return (
            <Route
              path={prop.path}
              key={key}
              element={<Navigate to="/auth/login" replace />}
            />
          );
        else
          return (
            <Route path={prop.path} element={prop.component} key={key} exact />
          );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props?.location?.pathname.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  return (
    <div className={`flex flex-col min-h-screen ${testmode ? 'bg-gray-500 bg-opacity-40' : 'bg-gray-100'}`}>
      {isStop && user &&  <StopModal
        isStop={isStop}
        setIsStop={setIsStop}
      />}
      {!spinFlag && !isStop && <SucceedModal
        isOpen={isOpenLoggedModal}
        setIsOpen={setIsOpenLoggedModal}
        text={t("successLogin")}
      />}
      {spinFlag && <Spinner />}
        {!spinFlag && location.pathname !== "/user/acquisitionHistory" &&
        location.pathname !== "/user/changeShippingAddress" &&
        location.pathname !== "/user/addShippingAddress" &&
        location.pathname !== "/user/pointsHistory" &&
        location.pathname !== "/user/profile" &&
        location.pathname !== "/user/purchasePoint" &&
        location.pathname !== "/user/purchasePoint/amazon" &&
        location.pathname !== "/user/purchasePoint/result" &&
        location.pathname !== "/user/showDrawedPrizes" &&
        location.pathname !== "/user/decideShip" &&
        location.pathname !== "/user/redrawGacha" &&
        location.pathname !== "/user/entercode" && (
          <UserNavbar
            {...props}
            brandText={getBrandText(props?.location?.pathname)}
            isnavbar={isnavbar}
            setIsnavbar={setIsnavbar}
          />
        )}

      {!spinFlag && <Routes>
        {getRoutes(routes)}
        <Route path="/purchasePoint/result" element={< PayResult />} exact />
        <Route path="/purchasePoint/amazon"element={< AmazonCheckOut />} exact />
        <Route path="*" element={<Navigate to="/user/index" replace />} />
      </Routes>}
      {/* <ScrollToTop /> */}
      {!spinFlag && location.pathname !== "/user/gachaDetail" &&
        location.pathname !== "/user/acquisitionHistory" &&
        location.pathname !== "/user/changeShippingAddress" &&
        location.pathname !== "/user/addShippingAddress" &&
        location.pathname !== "/user/pointsHistory" &&
        location.pathname !== "/user/profile" &&
        location.pathname !== "/user/purchasePoint" &&
        location.pathname !== "/user/purchasePoint/amazon" &&
        location.pathname !== "/user/purchasePoint/result" &&
        location.pathname !== "/user/showDrawedPrizes" &&
        location.pathname !== "/user/decideShip" &&
        location.pathname !== "/user/redrawGacha" &&
        location.pathname !== "/user/entercode" && <Footer />}
    </div>
  );
};

export default User;
