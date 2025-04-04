import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import api from "../../utils/api";
import { setAuthToken } from "../../utils/setHeader";
import formatPrice from "../../utils/formatPrice";

import PageHeader from "../../components/Forms/PageHeader";
import PieChart from "../../components/Charts/PieChart";
import LineChart from "../../components/Charts/LineChart";
import SucceedModal from "../../components/Modals/SucceedModal";
import Spinner from "../../components/Others/Spinner";

const Statistics = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [spinFlag, setSpinFlag] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [prizeStatus, setPrizeStatus] = useState([0, 0]);
  const [pendingPeriod, setPendingPeriod] = useState("7");
  const [pendingData, setPendingData] = useState([]);
  const [deliveringPeriod, setDeliveringPeriod] = useState("7");
  const [deliveringData, setDeliveringData] = useState([]);
  const [isToggled, setIsToggled] = useState({ gacha: false, invite: false });
  const [isStop, setIsStop] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (localStorage.getItem("loggedIn")) {
      setIsOpen(true);
    }

    getStatisticsData();
  }, [pendingPeriod, deliveringPeriod]);

  const getStatisticsData = async () => {
    setAuthToken();

    try {
      const pendingStartDate = new Date(
        Date.now() - (pendingPeriod - 1) * 24 * 60 * 60 * 1000
      );
      const deliveringStartDate = new Date(
        Date.now() - (deliveringPeriod - 1) * 24 * 60 * 60 * 1000
      );

      setSpinFlag(true);
      const res = await api.post("/admin/statistics", {
        pendingStartDate: pendingStartDate,
        deliveringStartDate: deliveringStartDate,
      });
      setSpinFlag(false);

      // set total income
      setTotalIncome(res.data.totalIncome);
      // set prize status
      setPrizeStatus(res.data.prizeStatus);
      // set gachaVisit Status
      setIsToggled(res.data.currentStatus);
      // set maintance mode
      setIsStop(res.data.maintance);
      // get counts of prize as period and status
      caclCounts(res.data.periodPendings, Number(pendingPeriod), "pending");
      caclCounts(res.data.periodDeliverings, Number(deliveringPeriod), "delivering");
    } catch (error) {}
  };

  const changePeriod = (type, e) => {
    switch (type) {
      case "Pending":
        setPendingPeriod(e.currentTarget.value);
        break;
      case "Delivering":
        setDeliveringPeriod(e.currentTarget.value);
        break;

      default:
        break;
    }
  };

  const caclCounts = (data, period, type) => {
    // make dateArray
    const dateArray = [];
    const startDate = new Date(Date.now() - (period - 1) * 24 * 60 * 60 * 1000);
    const start = new Date(startDate);
    const endDate = new Date();

    // Loop through the dates
    for (let date = start; date <= endDate; date.setDate(date.getDate() + 1)) {
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed)
      const day = String(date.getDate()).padStart(2, "0"); // Get day
      const formattedDate = `${month}-${day}`; // Format as MM-DD
      dateArray.push(formattedDate); // Add to the array
    }

    if (period === 30) {
      // Get today's date
      const today = new Date();

      // Extract the month and day
      let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      let day = String(today.getDate()).padStart(2, "0"); // Get the day of the month

      // Format the date as MM-DD
      const formattedDate = `${month}-${day}`;

      dateArray.push(formattedDate);
    }

    // make countArray
    let countArray = [];
    dateArray.forEach((date) => {
      let counts = 0;

      data.forEach((prize) => {
        // Convert drawDate to a Date object
        let drawDateObj = new Date(prize.drawDate);

        // Extract the month and day from drawDate
        let month = String(drawDateObj.getUTCMonth() + 1).padStart(2, "0");
        let day = String(drawDateObj.getUTCDate()).padStart(2, "0");
        // Format the extracted date as MM-DD
        let formattedDrawDate = `${month}-${day}`;

        if (formattedDrawDate === date) {
          counts++;
        }
      });

      countArray.push(counts);
    });

    if (type === "pending") setPendingData([dateArray, countArray]);
    if (type === "delivering") setDeliveringData([dateArray, countArray]);
  };

  const handleInvite = async (e) => {
    setAuthToken();

    let status = { ...isToggled };
    status.invite = !isToggled?.invite;
    setSpinFlag(true);
    const res = await api.post("/admin/gachastatus", {
      current: status
    });
    setSpinFlag(false);
    if (res.data.status) setIsToggled(status);
  }
  const handleGacha = async (e) => {
    setAuthToken();

    let status = { ...isToggled };
    status.gacha = !isToggled?.gacha;
    setSpinFlag(true);
    const res = await api.post("/admin/gachastatus", {
      current: status
    });
    setSpinFlag(false);
    if (res.data.status) setIsToggled(status);
  }

  const handleMaintance = async () => {
    setAuthToken();
    setSpinFlag(true);
    const res = await api.post("/admin/maintance", {
      current: !isStop
    })
    setSpinFlag(false);
    if (res.data.status) setIsStop(!isStop);
  }

  return (
    <div className="px-3 pt-2 py-4">
      {spinFlag && <Spinner />}
      <div className="w-full md:w-[100%] lg:w-[70%] mx-auto mb-4">
        <PageHeader text={t("statistics")} />
      </div>
      <div className="mx-auto h-50 w-[60%] bg-white border-[1px] border-gray-200 rounded-md shadow-md shadow-gray-300 my-2">
        <div className="flex items-center justify-center py-2">
          <span className="text-3xl text-slate-600 pr-5">
            {t("gachavisit")}
          </span> 
          <button
            name='gacha'
            onClick={handleGacha}
            className={`relative inline-flex items-center justify-between w-32 h-10 border-2 rounded-full transition-all duration-300 ease-in-out ${isToggled?.gacha ? 'border-green-600 bg-green-200' : 'border-gray-400 bg-gray-200'}`}
          >
            <span
              className={`absolute left-1 transition-transform duration-300 ease-in-out transform ${isToggled?.gacha ? 'translate-x-full' : 'translate-x-0'}`}
            >
              <span className={`font-bold text-lg ${isToggled?.gacha ? 'text-green-600' : 'text-gray-600'}`}>
                {isToggled?.gacha ? 'ON' : 'OFF'}
              </span>
            </span>
            <span
              className={`absolute w-10 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out transform ${isToggled?.gacha ? 'translate-x-20' : 'translate-x-0'}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-center py-2">
          <span className="text-3xl text-slate-600 pr-5">
            {t("invitefunctionstatus")}
          </span> 
          <button
            onClick={handleInvite}
            className={`relative inline-flex items-center justify-between w-32 h-10 border-2 rounded-full transition-all duration-300 ease-in-out ${isToggled?.invite ? 'border-green-600 bg-green-200' : 'border-gray-400 bg-gray-200'}`}
          >
            <span
              className={`absolute left-1 transition-transform duration-300 ease-in-out transform ${isToggled?.invite ? 'translate-x-full' : 'translate-x-0'}`}
            >
              <span className={`font-bold text-lg ${isToggled?.invite ? 'text-green-600' : 'text-gray-600'}`}>
                {isToggled?.invite ? 'ON' : 'OFF'}
              </span>
            </span>
            <span
              className={`absolute w-10 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out transform ${isToggled?.invite ? 'translate-x-20' : 'translate-x-0'}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-center py-2">
          <span className="text-3xl text-slate-600 pr-5">
            {t("maintenancemode")}
          </span> 
          <button
            onClick={handleMaintance}
            className={`relative inline-flex items-center justify-between w-32 h-10 border-2 rounded-full transition-all duration-300 ease-in-out ${isStop ? 'border-green-600 bg-green-200' : 'border-gray-400 bg-gray-200'}`}
          >
            <span
              className={`absolute left-1 transition-transform duration-300 ease-in-out transform ${isStop ? 'translate-x-full' : 'translate-x-0'}`}
            >
              <span className={`font-bold text-lg ${isStop ? 'text-green-600' : 'text-gray-600'}`}>
                {isStop ? 'ON' : 'OFF'}
              </span>
            </span>
            <span
              className={`absolute w-10 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out transform ${isStop ? 'translate-x-20' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-between items-start w-full lg:w-[90%] xl:w-[70%] mx-auto">
        <div className="h-auto flex flex-col w-full lg:w-[50%] p-2">
          <div className="flex flex-wrap items-center justify-between h-32 overflow-auto w-full bg-white border-[1px] border-gray-200 rounded-md shadow-md shadow-gray-300 my-2 p-4">
            <span className="text-3xl text-slate-600">
              {t("total") + " " + t("income")}
            </span>
            <span className="text-3xl text-slate-600">
              ¥{formatPrice(totalIncome)}
            </span>
          </div>
          <div className="h-full flex flex-col overflow-auto w-full bg-white border-[1px] border-gray-200 rounded-md shadow-md shadow-gray-300 my-2 p-4">
            <span className="text-3xl text-slate-600">
              {t("prize") + " " + t("status")}
            </span>
            <hr className="my-2 w-full text-sm mx-auto"></hr>
            <div className="chart mt-4">
              <PieChart data={prizeStatus} />
            </div>
          </div>
        </div>
        <div className="h-auto flex flex-col w-full lg:w-[50%] p-2">
          <div className="h-full flex flex-col overflow-auto w-full bg-white border-[1px] border-gray-200 rounded-md shadow-md shadow-gray-300 my-2 p-4">
            <div className="flex flex-wrap justify-between">
              <span className="text-3xl text-slate-600">
                {t("pending") + " " + t("prize")}
              </span>
              <select
                className="w-32 cursor-pointer border rounded-md text-sm"
                name="changePendingPeriod"
                id="changePendingPeriod"
                autoComplete="changePendingPeriod"
                onChange={(e) => changePeriod("Pending", e)}
                value={pendingPeriod}
              >
                <option value="7" className="p-2">
                  {t("last") + " 7 " + t("days")}
                </option>
                <option value="30" className="p-2">
                  {t("last") + " 30 " + t("days")}
                </option>
              </select>
            </div>
            <hr className="my-2 w-full text-sm mx-auto"></hr>
            <div className="chart mt-4">
              <LineChart data={pendingData} type="pending" />
            </div>
          </div>
          <div className="h-full flex flex-col overflow-auto w-full bg-white border-[1px] border-gray-200 rounded-md shadow-md shadow-gray-300 my-2 p-4">
            <div className="flex flex-wrap justify-between">
              <span className="text-3xl text-slate-600">
                {t("delivering") + " " + t("prize")}
              </span>
              <select
                className="w-32 cursor-pointer border rounded-md text-sm"
                name="changeDeliveringPeriod"
                id="changeDeliveringPeriod"
                autoComplete="changeDeliveringPeriod"
                onChange={(e) => changePeriod("Delivering", e)}
                value={deliveringPeriod}
              >
                <option value="7" className="p-2">
                  {t("last") + " 7 " + t("days")}
                </option>
                <option value="30" className="p-2">
                  {t("last") + " 30 " + t("days")}
                </option>
              </select>
            </div>
            <hr className="my-2 w-full text-sm mx-auto"></hr>
            <div className="chart mt-4">
              <LineChart data={deliveringData} type="delivering" />
            </div>
          </div>
        </div>
      </div>

      <SucceedModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        text={t("successLogin")}
      />
    </div>
  );
};

export default Statistics;
