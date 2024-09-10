import { useEffect, useState } from "react";
import formatDate from "../../utils/formatDate";
import api from "../../utils/api";
import SubHeader from "../../components/Forms/SubHeader";
import GetUser from "../../utils/getUserAtom";
import { setAuthToken } from "../../utils/setHeader";
import Pointlog from "../../components/Others/Pointlog";
function PointLog() {
  const { user } = GetUser();
  const [pointLog, setPointLog] = useState();
  useEffect(() => {
    setAuthToken();
    getPointLog();
  }, []);
  const getPointLog = () => {
    api
      .get(`/user/get_point_log/${user._id}`)
      .then((res) => {
        if (res.data.status === 1) setPointLog(res.data.pointLog);
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className="w-full md:w-3/6 p-3 mx-auto mt-16">
      <SubHeader text="Point Log" />
      <div className="flex flex-col">
        {pointLog?.length > 0
          ? pointLog.map((data) => (
              <Pointlog
                date={data.date}
                point_num={data.point_num}
                usage={data.usage}
                ioFlag={data.ioFlag}
              />
            ))
          : null}
      </div>
    </div>
  );
}

export default PointLog;
