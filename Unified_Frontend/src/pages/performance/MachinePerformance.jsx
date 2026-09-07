import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";

import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";

import CycleTimeHeatMap from "../../partials/charts/machinePerformance/CycleTimeHeatMap";
import DowntimeTimeTrend from "../../partials/DowntimeTimeTrend";
import BreakdownByLossCategory from "../../partials/BreakdownByLossCategory";
import MachineOEEChart from "../../partials/charts/machinePerformance/MachineOEEChart";
import MachineAvailabilityChart from "../../partials/charts/machinePerformance/MachineAvailabilityChart";
import MachinePerformanceChart from "../../partials/charts/machinePerformance/MachinePerformanceChart";
import MachineQualityChart from "../../partials/charts/machinePerformance/MachineQualityChart";
import ExpectedVsActualChart from "../../partials/charts/machinePerformance/ExpectedVsActualChart";
import QualityChart from "../../partials/charts/machinePerformance/QualityChart";

import DowntimeDurationCard from "../../partials/DowntimeDurationCard";
import DowntimeOccurrenceCard from "../../partials/DowntimeOccurrenceCard";
import RejectionReasonChart from "../../partials/charts/machinePerformance/RejectionReasonChart";

import { machinePerformanceAPI } from "../../services/operations/machinePerformanceAPI";

function MachinePerformance() {
  const location = useLocation();
  const machineOEE = useSelector((state) => state.machine.machineOEE);
  const filters = useSelector((state) => state.filters);


  //4m dt analysis chart


  // console.log("Machine OEE from Redux Store:", machineOEE);

  const [durationFilter, setDurationFilter] = useState("Select");
  const [occurrenceFilter, setOccurrenceFilter] = useState("Select");

  const lossNames = useSelector((state) => state.machine.lossNames);
  // console.log("Loss Names from Redux Store:", lossNames);
  const dropdownLossNames = lossNames?.map((loss) => loss.LossName) || [];

  const machine = location.state;              // From state
  const equipmentId = machine?.EquipmentID;
  const equipmentName = machine?.EquipmentName;
  const getLossId = (lossName) => {
    const match = lossNames.find(loss => loss.LossName === lossName);
    return match ? match.LossID : null;
  };

  const durationLossId = getLossId(durationFilter);
  const occurrenceLossId = getLossId(occurrenceFilter);


  const dispatch = useDispatch();
  const { durationData, occurrenceData, loading } = useSelector(
    (state) => state.machineDowntime
  );




  useEffect(() => {
    if (equipmentName && equipmentId) {
      let normalizedMode = filters.period?.toLowerCase() || "shift";
      if (normalizedMode === "custom") normalizedMode = "date";

      // Format dates properly
      const formatDate = (date) =>
        date ? new Date(date).toISOString().split("T")[0] : null;

      const start = formatDate(filters.startDate);
      const end = formatDate(filters.endDate);

      dispatch(
        machinePerformanceAPI({
          mode: normalizedMode,
          equipmentName,
          equipmentKey: equipmentId,
          startDate: start,
          endDate: end,
        })
      ).catch((err) => console.log("machinePerformanceAPI error:", err));
    }
  }, [filters.period, filters.startDate, filters.endDate, equipmentId, equipmentName, dispatch]);



  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Charts */}
        <div className="grid grid-cols-12 gap-6">

          {/* Plant Production */}
          <div className="col-span-12 md:col-span-6 h-72 p-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <h2 className="font-semibold mb-1">Machine OEE</h2>
            <h2 className="font-semibold text-sm mb-2">OEE: <span className="text-black text-xl dark:text-white">{machineOEE && machineOEE.length > 0 ? machineOEE[0].OEEPercent : 0}%</span></h2>
            <MachineOEEChart />
          </div>

          {/* Plant Performance */}
          <div className="col-span-12 md:col-span-6 p-4 h-72  bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <h2 className="font-semibold mb-1">Machine Availability​</h2>
            <h2 className="font-semibold text-sm mb-2">Availability: <span className="text-black text-xl dark:text-white">{machineOEE && machineOEE.length > 0 ? machineOEE[0].AvailabilityPercent : 0}%</span></h2>
            <MachineAvailabilityChart />
          </div>

          {/* Plant Downtime */}
          <div className="col-span-12 md:col-span-6 p-4 h-72  bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <h2 className="font-semibold mb-1">Machine Performance​</h2>
            <h2 className="font-semibold text-sm mb-2">Performance: <span className="text-black text-xl dark:text-white">{machineOEE && machineOEE.length > 0 ? machineOEE[0].PerformancePercent : 0}%</span></h2>
            <MachinePerformanceChart />
          </div>

          {/* Plant Quality */}
          <div className="col-span-12 md:col-span-6 p-4 h-72  bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <h2 className="font-semibold mb-1">Machine Quality​</h2>
            <h2 className="font-semibold text-sm mb-2">Quality: <span className="text-black text-xl dark:text-white">{machineOEE && machineOEE.length > 0 ? machineOEE[0].QualityPercent : 0}%</span></h2>
            <MachineQualityChart />
          </div>
        </div>

        <div className="mt-10 ">
          <CycleTimeHeatMap />
        </div>

        <div className="mt-10">
          <BreakdownByLossCategory />
        </div>

        <div className="mt-10">
            <DowntimeTimeTrend equipmentKey={equipmentId} />
        </div>

        <div className="mt-10">
          <h2 className="bg-[#3c51d2]  p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4">Expected vs Actual</h2>
          <ExpectedVsActualChart />
        </div>

        <div className="mt-10">
          <h2 className="bg-[#3c51d2]  p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4">Quality</h2>
          <QualityChart />
        </div>

        <div className="mt-10">
          <h2 className="bg-[#3c51d2]  p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4">Rejection Reasons</h2>
          <RejectionReasonChart />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MachinePerformance;

