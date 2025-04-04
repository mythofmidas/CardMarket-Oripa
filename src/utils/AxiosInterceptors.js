import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "./api";
import { showToast } from "./toastUtil";

import usePersistedUser from "../store/usePersistedUser";

const useAxiosInterceptor = () => {
  const navigate = useNavigate();
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [, setUser] = usePersistedUser();
  const { t } = useTranslation();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Unauthorized error
              setIsLoggedOut(true);
              showToast(error.response.data.msg, "error");
              // Clear user data from local storage or state
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("testmode");
              setUser(null);
              // Redirect to login page
              navigate("/auth/login");
              break;
            case 403:
              // Forbidden error
              showToast(t("noPermission"), "error");
              break;
            // Add more cases as needed
            default:
              console.log("An error occurred:", error.response.data);
          }
        } else if (error.request) {
          console.log("No response received:", error.request);
        } else {
          console.log("Error setting up request:", error.message);
        }
        return Promise.reject(error);
      }
    );

    // Clean up the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return { isLoggedOut };
};

export default useAxiosInterceptor;
