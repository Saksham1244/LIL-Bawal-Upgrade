import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";

import OperatingVsRunTimeChart from "../../partials/charts/machineDowntime/OperatingVsRunTimeChart";
import DowntimeChart from "../../partials/charts/machineDowntime/DowntimeChart";
import IdleTimeChart from "../../partials/charts/machineDowntime/IdleTimeChart";
import NoProductionTimeChart from "../../partials/charts/machineDowntime/NoProductionTimeChart";
import TopFiveDowntimeDurationChart from "../../partials/charts/machineDowntime/TopFiveDowntimeDurationChart";
import TopFiveDowntimeOccurrenceChart from "../../partials/charts/machineDowntime/TopFiveDowntimeOccurrenceChart";

const MachineDowntime = () => {
  const { stationId } = useParams();
  const filters = useSelector((state) => state.filters);
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [operatingRunData, setOperatingRunData] = useState({});
  const [idleTimeData, setIdleTimeData] = useState({});
  const [downtimeData, setDowntimeData] = useState({});
  const [noProdData, setNoProdData] = useState({});
  const [top5DT, setTop5DT] = useState([]);
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentID, setEquipmentID] = useState(null);

  // Normalize mode from filters
  const mode =
    filters.period === "Date"
      ? "DATE"
      : filters.period?.toUpperCase() || "DAY";

 useEffect(() => {
  const fetchMachineInfo = async () => {
    try {
      const res = await axios.get(`${baseURL}/PerformanceHome/GetMachineName`);
      console.log("📡 Machine list from API:", res.data);

      if (res.data?.success && Array.isArray(res.data.data)) {
        const matchedMachine = res.data.data.find(
  (m) => String(m.EquipmentID)?.trim() === String(stationId)?.trim()
);

        if (matchedMachine) {
          console.log("✅ Matched machine:", matchedMachine);
          setEquipmentName(matchedMachine.EquipmentName);
          setEquipmentID(matchedMachine.EquipmentID);
        } else {
          console.warn("⚠️ No match found for StationID:", stationId);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching machine info:", err);
    }
  };

  fetchMachineInfo();
}, [stationId, baseURL]);


  // ✅ Step 2: Fetch Downtime Data (after equipmentID is set)
  useEffect(() => {
    if (!equipmentID) return; // wait until we have EquipmentID

    const fetchDowntimeData = async () => {
      try {
        const params = {
          Mode: mode,
          EquipmentID: equipmentID,
          StartDate: filters.startDate || null,
          EndDate: filters.endDate || null,
        };

        const [runRes, idleRes, dtRes, noProdRes, top5Res] = await Promise.all([
          axios.get(`${baseURL}/DowntimeMachine/GetMachineOperatingRunningTime`, { params }),
          axios.get(`${baseURL}/DowntimeMachine/GetMachineIdleTime`, { params }),
          axios.get(`${baseURL}/DowntimeMachine/GetMachineDTTotalTime`, { params }),
          axios.get(`${baseURL}/DowntimeMachine/GetMachineNoProductionTime`, { params }),
          axios.get(`${baseURL}/DowntimeMachine/GetTop5MachineDowntime`, { params }),
        ]);

        setOperatingRunData(runRes.data?.data?.[0] || {});
        setIdleTimeData(idleRes.data?.data?.[0] || {});
        setDowntimeData(dtRes.data?.data?.[0] || {});
        setNoProdData(noProdRes.data?.data?.[0] || {});
        setTop5DT(top5Res.data?.data || []);
      } catch (err) {
        console.error("❌ Error fetching downtime data:", err);
      }
    };

    fetchDowntimeData();
  }, [equipmentID, filters.startDate, filters.endDate, mode, baseURL]);

  // ✅ Step 3: Render
  return (
    <DashboardLayout>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-center mb-6 text-blue-900">
          Machine Downtime Dashboard - {equipmentName || "Loading..."}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <OperatingVsRunTimeChart data={operatingRunData} mode={mode} />
          <DowntimeChart data={downtimeData} mode={mode} />
          <IdleTimeChart data={idleTimeData} mode={mode} />
          <NoProductionTimeChart data={noProdData} mode={mode} />

          <div className="col-span-2 bg-blue-900 text-white text-center py-2 rounded-md font-semibold">
            Top Five Downtimes
          </div>

          <TopFiveDowntimeDurationChart data={top5DT} mode={mode} />
          <TopFiveDowntimeOccurrenceChart data={top5DT} mode={mode} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MachineDowntime;
