import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import api from "../../utils/api";
import { setAuthToken } from "../../utils/setHeader";
import { setMultipart, removeMultipart } from "../../utils/setHeader";
import { showToast } from "../../utils/toastUtil";
import usePersistedUser from "../../store/usePersistedUser";

import AgreeButton from "../../components/Forms/AgreeButton";
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal";
import PageHeader from "../../components/Forms/PageHeader";

import uploadimage from "../../assets/img/icons/upload.png";
import formatPrice from "../../utils/formatPrice";

function Point() {
  const [user, setUser] = usePersistedUser();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    id: "",
    pointNum: 0,
    price: 0,
    file: null,
  });
  const [points, setPoints] = useState([]);
  const [cuflag, setCuFlag] = useState(1); //determine whether the status is adding or editing, default is adding (1)
  const [imgUrl, setImgUrl] = useState(""); //local image url when file selected
  const [delPointId, setDelPointId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setAuthToken();
    getPoint();
  }, []);

  //handle form change, formData input
  const changeFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //get registered point
  const getPoint = () => {
    setAuthToken();
    api
      .get("/admin/get_point")
      .then((res) => {
        if (res.data.status === 1) {
          setPoints(res.data.points);
        } else console.log("getPoint Error---->", res.data.err);
      })
      .catch((err) => console.error(err));
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file !== undefined) {
      setFormData({ ...formData, file: file });
      const reader = new FileReader();

      reader.onload = (e) => {
        setImgUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* add and update prize with image file uploading
  if there is a property 'id' vin formData, this perform update of prize */
  const AddPoint = () => {
    if (!user.authority["point"]["write"]) {
      showToast("You have no permission for this action", "error");
      return;
    }

    setMultipart();
    setAuthToken();

    if (parseFloat(formData.pointNum) <= 0) {
      showToast("Point amount must be greater than than 0", "error");
    } else if (parseInt(formData.price) <= 0) {
      showToast("Point price must be greater than than 0", "error");
    } else if (
      cuflag === 1 &&
      (formData.file === NaN ||
        formData.file === null ||
        formData.file === undefined)
    ) {
      showToast("Point image is not selected", "error");
    } else {
      api.post("/admin/point_upload", formData).then((res) => {
        if (res.data.status === 1) {
          showToast("Point Added Successfully.");
          setImgUrl("");
          fileInputRef.current.value = null;
          setFormData({
            ...formData,
            id: "",
            pointNum: 0,
            price: 0,
            file: null,
          });
          setCuFlag(1); //set create/update flag as creating
          removeMultipart();
        } else if (res.data.status === 2) {
          showToast("Point Updated Successfully.");
          setImgUrl("");
          setFormData({
            ...formData,
            id: "",
            pointNum: 0,
            price: 0,
            file: null,
          });
          setCuFlag(1); //set create/update flag as creating
          removeMultipart();
        } else {
          showToast("Point Add/Update Failed", "error");
        }
        getPoint();
      });
    }
  };

  //handle Edit Button click event
  const handleEdit = (i) => {
    setFormData({
      id: points[i]._id,
      pointNum: points[i].point_num,
      price: points[i].price,
    });
    setCuFlag(0); //set create/update flag as updating
    setImgUrl(process.env.REACT_APP_SERVER_ADDRESS + points[i].img_url);
  };

  //handle point update
  const CancelPoint = () => {
    setImgUrl("");
    setFormData({
      ...formData,
      id: "",
      pointNum: 0,
      price: 0,
      file: null,
    });
    setCuFlag(1);
  };

  //handle point update
  const UpdatePoint = () => {
    if (!user.authority["point"]["write"]) {
      showToast("You have no permission for this action", "error");
      return;
    }

    setCuFlag(1);

    AddPoint();
  };

  //handle point delete
  const pointDel = () => {
    if (!user.authority["point"]["delete"]) {
      showToast("You have no permission for this action", "error");
      return;
    }

    api.delete(`/admin/del_point/${delPointId}`).then((res) => {
      if (res.data.status === 1) {
        showToast("Successfully Deleted.");
        getPoint();
      } else showToast("Point delete failed.");
    });
  };

  const handleDelete = () => {
    setIsModalOpen(false);
    pointDel();
  };

  return (
    <div className="p-3">
      <div className="w-full md:w-[70%] mx-auto">
        <PageHeader text={t("point")} />
      </div>
      <div className="flex flex-col w-full md:w-[70%] border-2 m-auto">
        <div className="py-2 bg-admin_theme_color text-gray-200 text-center">
          {t("point") + " " + t("add")}
        </div>
        <div className="flex flex-wrap justify-center sm:px-4 pt-2 w-full">
          <div className="flex flex-col w-full xxsm:w-1/2">
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="pointNum" className="text-gray-700">
                {t("point") + " " + t("amount")}:{" "}
              </label>
              <input
                name="pointNum"
                className="p-1 w-full form-control"
                onChange={changeFormData}
                value={formData.pointNum}
                id="pointNum"
                autoComplete="name"
              ></input>
            </div>
            <div className="flex flex-wrap justify-between items-center my-1 px-2 w-full">
              <label htmlFor="price" className="text-gray-700">
                {t("price")}:{" "}
              </label>
              <input
                name="price"
                className="p-1 w-full form-control"
                onChange={changeFormData}
                value={formData.price}
                id="price"
                autoComplete="name"
              ></input>
            </div>
          </div>
          <div className="flex flex-col justify-between items-center px-2 pb-2 w-full xxsm:w-1/2">
            <label htmlFor="fileInput" className="text-gray-700 px-1">
              {t("point") + " " + t("image")}:{" "}
            </label>
            <input
              name="fileInput"
              type="file"
              id="fileInput"
              ref={fileInputRef}
              className="image p-1 w-full form-control"
              onChange={handleFileInputChange}
              autoComplete="name"
            ></input>
            <img
              src={imgUrl ? imgUrl : uploadimage}
              alt="prize"
              className={`${
                imgUrl ? "w-auto h-[250px]" : ""
              }  object-cover`}
              onClick={() => {
                document.getElementById("fileInput").click();
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-end px-3 pb-2">
          {!cuflag ? (
            <button
              className="button-22 !bg-red-500 !mr-2"
              onClick={CancelPoint}
            >
              {t("cancel")}
            </button>
          ) : null}
          <button className="button-22" onClick={UpdatePoint}>
            {!cuflag ? t("update") : t("add")}
          </button>
        </div>
      </div>
      <div className="mx-auto my-3 w-full md:w-[70%] overflow-auto">
        <table className="border-2 w-full  m-auto">
          <thead>
            <tr className="bg-admin_theme_color font-bold text-gray-200">
              <th>{t("no")}</th>
              <th>{t("point") + " " + t("amount")}</th>
              <th>{t("price")}</th>
              <th>{t("point") + " " + t("image")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {points ? (
              points.map((data, i) => (
                <tr key={data._id} className="border-2">
                  <td>{i + 1}</td>
                  <td>{formatPrice(data.point_num)} pt</td>
                  <td>¥ {formatPrice(data.price)}</td>
                  <td>
                    <img
                      className="m-auto"
                      src={process.env.REACT_APP_SERVER_ADDRESS + data.img_url}
                      width="50px"
                      height="50px"
                      alt={`${data.point_num} points`} // Meaningful alt text
                    />
                  </td>
                  <td>
                    <span
                      id={data._id}
                      className="fa fa-edit p-1"
                      onClick={() => {
                        handleEdit(i);
                      }}
                    ></span>
                    <span
                      id={data._id}
                      className="fa fa-remove p-1"
                      onClick={() => {
                        setDelPointId(data._id);
                        setIsModalOpen(true);
                      }}
                    ></span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">There is no Point</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Point;
