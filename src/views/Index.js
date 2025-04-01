import { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import api from "../utils/api";
import { showToast } from "../utils/toastUtil";
import subCategories from "../utils/subCategories";

import ImageCarousel from "../components/Others/ImageCarousel";
import NotEnoughPoints from "../components/Modals/NotEnoughPoints";
import Spinner from "../components/Others/Spinner";

import { bgColorAtom } from "../store/theme";
import { categoryAtom } from "../store/category.js";
import GachaBlog from "../components/Blogs/GachaBlog";
import { gachasAtom, filterGachasAtom, homeAtom } from "../store/gachas";
import { useMemo } from "react";
import { Helmet } from 'react-helmet';

const Index = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const [bgColor] = useAtom(bgColorAtom);
  const [gachas] = useAtom(gachasAtom);
  const [homeSeo,] = useAtom(homeAtom);

  const [subCategory, setSubCategory] = useState(subCategories);
  const [filteredGacha, setFilteredGacha] = useAtom(filterGachasAtom);
  const [categoryFilter, setCategoryFilter] = useAtom(categoryAtom);
  const [category, setCategory] = useState(null);
  const [filter, setFilter] = useState(['all']);
  const [order, setOrder] = useState("recommended");
  const [isOpenPointModal, setIsOpenPointModal] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);

  useEffect(() => {
    const getData = async () => {
      
      getCategory();
    };
    getData();
  }, []);

  useMemo(() => {
    let filteredGachas;
      filteredGachas= gachas?.filter(
        (gacha) =>
          gacha.isRelease === true &&
          gacha.total_number > 0 &&
          (categoryFilter === "all"
            ? true
            : gacha.category._id === categoryFilter)
      );
    // Get gachas by sub category
    if (!filter.includes("all")) {
      if (filter.includes("lessThan100")) {
        filteredGachas = filteredGachas.filter(
          (item) =>
            (item.remain_prizes.length + item.rubbish_total_number) <= 100
        );
      }
      if (filter.includes('last_prize')) {
        filteredGachas = filteredGachas.filter(
          (item) => (item.kind.some((items) => items.value === 'last_prize'))
        );
      }
      if (filter.includes('once_per_day')) {
        filteredGachas = filteredGachas.filter(
          (item) => (item.kind.some((items) => items.value === 'once_per_day'))
        );
      }
      if (filter.includes('500')) {
        filteredGachas = filteredGachas.filter(
          (item) => (item.kind.some((items) => items.value === '500'))
        );
      }
      if (filter.includes('1000')) {
        filteredGachas = filteredGachas.filter(
          (item) => (item.kind.some((items) => items.value === '1000'))
        );
      }
      if (filter.includes('10000')) {
        filteredGachas = filteredGachas.filter(
          (item) => (item.kind.some((items) => items.value === '10000'))
        );
      }
      if (filter.includes('Inweek')) {
        filteredGachas = filteredGachas.filter(
          (item) => (item.kind.some((items) => items.value === 'Inweek'))
        );
      }
    }

    // Get gachas by order
    switch (order) {
      case "recommended":
        break;
      case "newest":
        filteredGachas?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "popularity":
        filteredGachas?.sort(
          (a, b) =>
            Number(
              b.total_number - b.remain_prizes.length
            ) -
            Number(
              a.total_number -  a.remain_prizes.length
            )
        );
        break;

      case "highToLowPrice":
        filteredGachas?.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "lowToHighPrice":
        filteredGachas?.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      default:
        break;
    }

    // sort that place to at the end remain_prizes length is 0
    filteredGachas = filteredGachas?.sort((a, b) => {
      return (a.remain_prizes.length + a.rubbish_total_number) === 0
        ? 1
        : (b.remain_prizes.length + b.rubbish_total_number) === 0
        ? -1
        : 0;
    });

    // Set the final filtered array
    setFilteredGacha(filteredGachas);
  }, [filter, categoryFilter, order]);
  // get main categories
  const getCategory = () => {
    api
      .get("admin/get_category")
      .then((res) => {
        if (res.data.status === 1) {
          setCategory(res.data.category);
        }
      })
      .catch((err) => {
        showToast(err, "error");
      });
  };
  // change gacha by sub order
  const changeMainCat = (cat) => {
    setCategoryFilter(cat);
  };

  // change gacha by sub category
  const changeSubCat = (selSubGat) => {
    // Make selected categories array
    let selSubCats;
    if (selSubGat === "all") {
      // If "all" is selected, reset the filter to contain only "all"
      selSubCats = ["all"];
    } 
    else {
      if (filter.includes(selSubGat)) {
        // If the filter already includes the item, remove it
        selSubCats = filter.filter(
          (item) => item !== selSubGat && item !== "all"
        );

        // If the filter becomes empty, reset it to contain "all"
        if (selSubCats.length === 0) {
          selSubCats = ["all"];
        }
      } else {
        // If the filter does not include the item, add it and remove "all" if present
        selSubCats = filter.filter((item) => item !== "all");
        selSubCats = [...selSubCats, selSubGat];
      }
    }

    // // Ordering selected categories by selecting
    // if (!selSubCats.includes("all")) {
    //   if (filter.includes(selSubGat)) {
    //     const restCategories = subCategory.filter(
    //       (item) => !selSubCats.includes(item)
    //     );
    //     // Add those values to the filter array
    //     const updatedFilter = [...selSubCats, ...restCategories];
    //     setSubCategory(updatedFilter);
    //   } else {
    //     // Find values from subCategory that are not in the filter array
    //     const restCategories = subCategory.filter(
    //       (item) => !selSubCats.includes(item)
    //     );
    //     // Add those values to the filter array
    //     const updatedFilter = [...selSubCats, ...restCategories];
    //     setSubCategory(updatedFilter);
    //   }
    // } else {
    //   setSubCategory(subCategories);
    // }

    // Set the final selSubCats array in one go
    setFilter(selSubCats);
  };

  // change gacha by sub order
  const changeOrder = (e) => {
    setOrder(e.currentTarget.value);
  };

  const gachabolg = () => {
    if (filteredGacha === null || filteredGacha === undefined ||filteredGacha.length === 0) {
      return (<div className="text-center mx-auto text-lg mt-4">
        {t("nogacha")}
      </div>);
    }
    return (   
      filteredGacha.map((data, i) => {
        return (<GachaBlog
          data={data}  setIsOpenPointModal={setIsOpenPointModal} setSpinFlag={setSpinFlag} key={i} 
        />);
      })
    );
  }

  return (
    <div className="flex flex-grow">
      {spinFlag && <Spinner />}
      <Helmet>
          <title>{homeSeo.title ? homeSeo.title : 'Oripa'}</title>
          <meta name="description" content={homeSeo.desc} />
          <meta name="keywords" content="oripa, gacha" />
      </Helmet>
      <div className="w-full lg:w-[90%] xm:w-[80%] xmd:w-[70%] xl:w-[60%]  md:mx-2 mt-16 mx-auto xm:p-2">
        <ImageCarousel />
        <div className="px-2">
          <div className="w-full flex justify-between overflow-auto text-red-800 shadow-md shadow-gray-200 px-2">
            <button
              className={`p-2 text-[18px] break-keep whitespace-nowrap font-bold border-b-red-500 hover:bg-gray-100 focus:bg-gray-100 hover:text-red-900 ${
                categoryFilter === "all" ? "bg-gray-100 border-t-4" : ""
              } `}
              style={{
                color: categoryFilter === "all" ? bgColor : "gray", // Set text color based on condition
                borderColor: categoryFilter === "all" ? bgColor : "transparent",
              }}
              onClick={() => changeMainCat("all")}
            >
              {t("all")}
            </button>
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
                    case "vn":
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
                    <button
                      key={i}
                      id={data.id}
                      className={`p-2 text-[18px] break-keep whitespace-nowrap font-bold border-b-red-500 hover:bg-gray-100 focus:bg-gray-100 hover:text-red-900 ${
                        categoryFilter === data._id
                          ? "bg-gray-100 border-t-4"
                          : ""
                      } `}
                      style={{
                        color: categoryFilter === data._id ? bgColor : "gray", // Set text color based on condition
                        borderColor:
                          categoryFilter === data._id ? bgColor : "transparent",
                      }}
                      onClick={() => changeMainCat(data._id)}
                    >
                      {catName}
                    </button>
                  );
                })
              : null}{" "}
          </div>
        </div>
        <div className="flex flex-wrap justify-between px-2">
          <div
            className={`${
              lang !== "jp" ? "w-[calc(99%-180px)]" : "w-[calc(99%-112px)]"
            } flex justify-start items-center overflow-auto px-2 pt-2`}
          >
            <div
              className={`py-2 px-3 rounded-2xl min-w-fit text-gray-700 hover:text-white text-sm font-bold mr-1 cursor-pointer ${
                filter.includes("all") ? "text-white" : ""
              }`}
              style={{
                backgroundColor: filter.includes("all") ? bgColor : "#e2e8f0",
              }}
              onClick={() => changeSubCat("all")}
            >
              {t("all")}
            </div>
            {subCategory.map((category, i) => {
              return (
                <div
                  key={i}
                  className={`p-2 mx-1 rounded-2xl min-w-fit text-gray-700 hover:text-white text-sm font-bold mr-1 cursor-pointer ${
                    filter.includes(category) ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: filter.includes(category)
                      ? bgColor
                      : "#e2e8f0",
                  }}
                  onClick={() => changeSubCat(category)}
                >
                  {t(category)}
                </div>
              );
            })}
            <div
              className={`py-2 px-3 rounded-2xl min-w-fit text-gray-700 hover:text-white text-sm font-bold mr-1 cursor-pointer ${
                filter.includes("lessThan100") ? "text-white" : ""
              }`}
              style={{
                backgroundColor: filter.includes("lessThan100")
                  ? bgColor
                  : "#e2e8f0",
              }}
              onClick={() => changeSubCat("lessThan100")}
            >
              {t("lessThan100")}
            </div>
          </div>
          <div
            className={`${
              lang !== "jp" ? "w-[180px]" : "w-[112px]"
            } flex justify-end items-center p-1 border-l-2 border-gray-[#e5e7eb]`}
          >
            <select
              className="w-auto border-transparent bg-transparent cursor-pointer focus:outline-none focus:border-none"
              name="changeOrder"
              id="changeOrder"
              autoComplete="changeOrder"
              onChange={(e) => changeOrder(e)}
              value={order}
            >
              <option value="recommended">{t("recommended")}</option>
              <option value="newest">{t("newest")}</option>
              <option value="popularity">{t("popularity")}</option>
              <option value="highToLowPrice">{t("highToLowPrice")}</option>
              <option value="lowToHighPrice">{t("lowToHighPrice")}</option>
            </select>
          </div>
        </div>
        <div className="w-full flex flex-wrap justify-between xm:px-3">
         {gachabolg()}
        </div>
      </div>
      <NotEnoughPoints
        headerText={t("noEnoughPoints")}
        bodyText={t("noEnoughPointsDesc")}
        okBtnClick={() => navigate("/user/purchasePoint")}
        isOpen={isOpenPointModal}
        setIsOpen={setIsOpenPointModal}
        bgColor={bgColor}
      />
      
    </div>
  );
};

export default Index;
