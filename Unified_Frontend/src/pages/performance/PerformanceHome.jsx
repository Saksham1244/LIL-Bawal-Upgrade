import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import PlantProductionChart from "../../partials/charts/home/PlantProductionChart";
import PlantPerformanceChart from "../../partials/charts/home/PlantPerformanceChart";
import PlantDowntimeChart from "../../partials/charts/home/PlantDowntimeChart";
import PlantQualityChart from "../../partials/charts/home/PlantQualityChart";
import HomePageMacineSummaryCard from "../../partials/HomePageMachineSummaryCard";
import { fetchPlantData } from "../services/operations/homePlantDataAPI";

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPlantData({ mode: "SHIFT" }));
  }, [dispatch]);

  const plantData = useSelector((state) => state.plant.plantData || []);
  const planActualData = useSelector((state) => state.plant.planActualData || []);
  const okTotalData = useSelector((state) => state.plant.okTotalData || []);
  const oeeData = useSelector((state) => state.plant.oeeData || []);

  const oeeValue = oeeData[0]?.OEE || 0;
  const productionPercentage = useMemo(() => {
    const plan = planActualData[0]?.TotalExpectedQty || 0;
    const actual = planActualData[0]?.TotalActualQty || 0;
    return plan ? ((actual / plan) * 100).toFixed(2) : 0;
  }, [planActualData]);
  const qualityPercentage = useMemo(() => {
    const ok = okTotalData[0]?.TotalGoodQty || 0;
    const total = okTotalData[0]?.TotalActualQty || 0;
    return total ? ((ok / total) * 100).toFixed(2) : 0;
  }, [okTotalData]);

  console.log("Plant data:", plantData);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6 bg-white p-4 rounded-xl">
            <h2>Production ({productionPercentage}%)</h2>
            <PlantProductionChart data={plantData} />
          </div>
          <div className="col-span-6 bg-white p-4 rounded-xl">
            <h2>Performance (OEE: {oeeValue}%)</h2>
            <PlantPerformanceChart data={plantData} />
          </div>
          <div className="col-span-6 bg-white p-4 rounded-xl">
            <h2>Downtime</h2>
            <PlantDowntimeChart data={plantData} />
          </div>
          <div className="col-span-6 bg-white p-4 rounded-xl">
            <h2>Quality ({qualityPercentage}%)</h2>
            <PlantQualityChart data={plantData} />
          </div>
        </div>

     <h2 className="bg-[#3c51d2]  p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4 mt-4">Machine Wise Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {plantData.map((machine, idx) => (
  <HomePageMacineSummaryCard
    key={idx}
    machine={{
      EquipmentName: machine.EquipmentName,
      MouldName: machine.MouldName,
      ExpectedQuantity: machine.ExpectedQuantity,
      ActualQuantity: machine.ActualQuantity,
      RejectedQty: machine.RejectedQty,
      OpTime:machine.OpTime,
      Downtime: `${machine.Downtime} min`,
      OEEPercent: `${machine.OEEPercent}%`,
      AvailabilityPercent: `${machine.AvailabilityPercent}%`,
      PerformancePercent: `${machine.PerformancePercent}%`,
      QualityPercent: `${machine.QualityPercent}%`,
    }}
  />
))}
        </div>
      </div>
    </DashboardLayout>
  );
}
