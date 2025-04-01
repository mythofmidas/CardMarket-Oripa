import { useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import { Nav, NavItem } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import '../../assets/css/responsive.css';

import { bgColorAtom } from "../../store/theme";
import api from "../../utils/api";
import { categoryAtom } from "../../store/category";
import logo from '../../assets/img/brand/on-gacha_logo.png'

const Footer = () => {
  const [category, setCategory] = useState(null);
  const [categoryFilter, setCategoryFilter] = useAtom(categoryAtom);
  const navigate = useNavigate();
  // const { t } = useTranslation();
  const [bgColor] = useAtom(bgColorAtom);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const changeMainCat = (cat) => {
    // getGacha();
    setCategoryFilter(cat);
  };

  useEffect(() => {
    api
      .get("admin/get_category")
      .then((res) => {
        if (res.data.status === 1) {
          setCategory(res.data.category);
        }
      })
  }, []);

  return (
    <div
      className="w-full py-3 xsm:px-1 relative bottom-0 z-10 flex flex-wrap justify-center"
    >
      <div className="lg:w-3/4 sm:w-full xm flex flex-wrap px-4 pb-10 pt-3">
        <div className="footer-responsive lg:w-[100%] sm:w-[100%]">
          <img alt="..." src={logo} className="w-[180px] mb-3"/>
          <div className="flex flex-wrap">
            <div className="footer-responsive flex flex-wrap lg:w-[15%] sm:w-[100%] pb-4">
              <Nav className="nav-footer text-white grid grid-cols-1 gap-2 ">
                <NavItem>
                  <div className={`pb-1`} >
                    <span className="text-custom_gray font-bold text-xl" > {t('category')} </span>
                  </div>
                </NavItem>
              {category != null
                    ? category.map((data, i) => {
                        let catName;
                        switch (lang) {
                          case "ch1":
                            catName = data.ch1Name;
                            break;
                          case "ch2":
                            catName = data.ch2Name;
                            break;
                          case "vt":
                            catName = data.vtName;
                            break;
                          case "en":
                            catName = data.enName;
                            break;

                          default:
                            catName = data.jpName;
                            break;
                        }

                        return (
                          <NavItem key={i} id={data.id}>
                            <div className={`pt-1 hover:cursor-pointer`}
                            >
                              <span className="text-custom_purple text-16" onClick={() => {changeMainCat(data._id)}}> {catName} </span>
                            </div>
                          </NavItem>
                        );
                      })
                    : null}{" "}
              </Nav>
            </div>
            <div className="footer-responsive flex flex-wrap  lg:w-[60%] sm:w-[100%] pb-4">
              <Nav className="nav-footer text-white grid grid-cols-1 gap-2">
                <NavItem>
                  <div className={`pb-1`} >
                    <span className="text-custom_gray font-bold text-xl" > {t('AboutOngacha')} </span>
                  </div>
                </NavItem>

                <NavItem>
                  <div className="pt-1 hover:cursor-pointer">
                    <span
                      className="text-custom_purple"
                      onClick={() => window.open("https://company.on-gacha.com/lp/riyoukiyaku/", "_blank")}
                    >
                      {t("userterms")}
                    </span>
                  </div>
                </NavItem>

                <NavItem>
                  <div className="pt-1 hover:cursor-pointer">
                    <span
                      className="text-custom_purple"
                      onClick={() => window.open("https://company.on-gacha.com/lp/privacy", "_blank")}
                    >
                      {t("privacy")}
                    </span>
                  </div>
                </NavItem>

                <NavItem>
                  <div className="pt-1 hover:cursor-pointer">
                    <span
                      className="text-custom_purple"
                      onClick={() => window.open("https://company.on-gacha.com/lp/faq-contact", "_blank")}
                    >
                      {t("FAQ")}
                    </span>
                  </div>
                </NavItem>

                <NavItem>
                  <div className="pt-1 hover:cursor-pointer">
                    <span
                      className="text-custom_purple"
                      onClick={() => window.open("https://company.on-gacha.com/lp/shotorihiki/", "_blank")}
                    >
                      {t("specialLaw")}
                    </span>
                  </div>
                </NavItem>


                {/* <NavItem>
                  <div className="pt-1 hover:cursor-pointer">
                    <span className="text-custom_purple" onClick={() => navigate("/user/blog")}>
                      {t("blog")}
                    </span>
                  </div>
                </NavItem> */}

                {/* <NavItem>
                  <div className="pt-1 hover:cursor-pointer">
                    <span
                      className="text-custom_purple hover:underline-offset-2"
                      onClick={() => navigate("/user/license")}
                    >
                      {t("license")}
                    </span>
                  </div>
                </NavItem> */}
              </Nav>
            </div>
            <div className="footer-responsive copyright text-custom_gray  flex-1">
              <div className="w-full flex lg:justify-end sm:justify-begin">
                <div className="text-custom_gray">
                  © {new Date().getFullYear()}{" "}
                  <button
                    className="font-weight-bold text-red-900"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="text-custom_gray text-md">Operating Company</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
